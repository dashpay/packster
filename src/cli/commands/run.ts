import yargs, { Arguments, Argv } from 'yargs';
import NpmAdapter from '../../lib/PackageManagerAdapter/NpmAdapter';

const workspacesCommand = {
  command: 'run <command>',
  description: 'run npm script',
  builder: (argv: Argv): Argv<{
      command: string | undefined,
      all: boolean | undefined,
      interrupt: boolean | undefined,
      workspace: string[] | undefined,
      except: string[] | undefined,
  }> => argv
    .positional('command', {
      type: 'string',
      description: 'Command to run',
    })
    .options({
      workspace: {
        type: 'string',
        description: 'List of packages to check. Can be one or multiple package names separated with a whitespace',
        conflicts: ['all'],
        array: true,
        alias: 'w',
      },
      all: {
        type: 'boolean',
        description: 'Serialize command output as json for convenient parsing by other tools',
        alias: 'a',
      },
      except: {
        type: 'string',
        description: 'Run command for every workspace, except for specified',
        conflicts: ['workspace'],
        array: true,
      },
      interrupt: {
        type: 'boolean',
        description: 'Interrupt all successive runs if one fails',
      },
    }),
  handler: async (args: Arguments<{
        command: string | undefined,
        except: string[] | undefined,
    }>): Promise<void> => {
    const { command, except } = args;
    const failIfScriptIsNotPresent = false;

    if (!command) {
      yargs.exit(1, new Error('run requires to specify the command'));
      return;
    }

    const packageManager = new NpmAdapter();

    const allPackages = await packageManager.listAllWorkspaces();
    let packagesToRunCommandIn = allPackages;

    console.log(except);

    if (except) {
      packagesToRunCommandIn = allPackages.filter((packageName) => !except.includes(packageName));
    }

    console.log(`Running command ${command} in ${packagesToRunCommandIn.join(', ')}`);

    for (const packageName of packagesToRunCommandIn) {
      try {
        await packageManager.run(packageName, command, failIfScriptIsNotPresent);
      } catch (e: any) {
        console.error(e);
        yargs.exit(1, e);
        break;
      }
    }
  },
};

export default workspacesCommand;
