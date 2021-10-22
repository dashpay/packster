import { Arguments, Argv } from 'yargs';
import NpmAdapter from '../../lib/PackageManagerAdapter/NpmAdapter';

const workspacesCommand = {
  command: 'workspaces',
  description: 'list all workspaces in the repo',
  builder: (argv: Argv): Argv<{ json: boolean | undefined }> => argv
    .option('json', {
      type: 'boolean',
      description: 'Serialize command output as json for convenient parsing by other tools',
    }),
  handler: async (args: Arguments<{
    json: boolean | undefined
  }>): Promise<void> => {
    const { json } = args;

    const packageManager = new NpmAdapter();

    const result = await packageManager.listAllWorkspaces();

    if (json) {
      console.log(JSON.stringify(result));
    } else {
      for (const pack of result) {
        console.log(pack);
      }
    }
  },
};

export default workspacesCommand;
