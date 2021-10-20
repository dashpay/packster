import { Arguments, Argv } from 'yargs';
import DependencyGraphFactory from '../../lib/DependencyGraphFactory';
import NpmAdapter from '../../lib/PackageManagerAdapter/NpmAdapter';

const listCommand = {
  command: 'list <packageNames..>',
  description: 'list all dependants for a package',
  builder: (argv: Argv): Argv<{ packageNames: string[] | undefined, json: boolean | undefined }> => argv.positional('packageNames', {
    type: 'string',
    array: true,
    describe: 'List of packages to scan. Can be one or multiple package names separated with a whitespace',
  })
    .option('json', {
      type: 'boolean',
      description: 'Serialize command output as json for convenient parsing by other tools',
    }),
  handler: async (args: Arguments<{ packageNames: string[] | undefined, json: boolean | undefined }>): Promise<void> => {
    const { packageNames, json } = args;
    const result: { [packageName: string]: string[] } = {};

    if (!packageNames) {
      throw new Error('Expected at least one package name');
    }

    const builder = new DependencyGraphFactory(new NpmAdapter());
    await Promise.all(packageNames.map(async (packageName): Promise<void> => {
      const dependencyGraph = await builder.buildGraph(packageName);
      result[packageName] = dependencyGraph.listAllDependants();
    }));

    if (json) {
      console.log(JSON.stringify(result));
    } else {
      console.dir(result, { depth: 100 });
    }
  },
};

export default listCommand;
