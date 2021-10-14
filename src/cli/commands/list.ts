import { Arguments, Argv } from 'yargs';
import DependencyGraphFactory from '../../lib/DependencyGraphFactory';
import NpmAdapter from '../../lib/PackageManagerAdapter/NpmAdapter';

const listCommand = {
  command: 'list <packageNames..>',
  description: 'list all dependants for a package',
  builder: (argv: Argv): Argv<{ packageNames: string[] | undefined }> => argv.positional('packageNames', {
    type: 'string',
    array: true,
    describe: 'List of packages to scan. Can be one or multiple package names separated with a whitespace',
  }),
  handler: async (args: Arguments<{ packageNames: string[] | undefined }>): Promise<void> => {
    const { packageNames } = args;
    const result: { [packageName: string]: string[] } = {};

    if (!packageNames) {
      throw new Error('Expected at least one package name');
    }

    const builder = new DependencyGraphFactory(new NpmAdapter());
    await Promise.all(packageNames.map(async (packageName): Promise<void> => {
      const dependencyGraph = await builder.buildGraph(packageName);
      result[packageName] = dependencyGraph.listAllDependants();
    }));

    // eslint-disable-next-line no-console
    console.log(result);
  },
};

export default listCommand;
