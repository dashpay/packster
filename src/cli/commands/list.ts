import { Arguments, Argv } from 'yargs';
import listDependencies from '../../lib/utils/listDependencies';

const listCommand = {
  command: 'list <packageNames..>',
  description: 'list all dependants for a package',
  builder: (argv: Argv): Argv<{
    packageNames: string[] | undefined, json: boolean | undefined
  }> => argv
    .positional('packageNames', {
      type: 'string',
      array: true,
      describe: 'List of packages to scan. Can be one or multiple package names separated with a whitespace',
    })
    .option('json', {
      type: 'boolean',
      description: 'Serialize command output as json for convenient parsing by other tools',
    }),
  handler: async (args: Arguments<{
    packageNames: string[] | undefined,
    json: boolean | undefined
  }>): Promise<void> => {
    const { packageNames, json } = args;

    if (!packageNames) {
      throw new Error('Expected at least one package name');
    }

    const result = await listDependencies(packageNames);

    if (json) {
      console.log(JSON.stringify(result));
    } else {
      console.dir(result, { depth: 100 });
    }
  },
};

export default listCommand;
