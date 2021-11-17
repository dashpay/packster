import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

import list from './commands/list';
import conflictsCheckCommand from './commands/conflictsCheck';
import conflictsFixCommand from './commands/conflictsFix';
import workspacesCommand from './commands/workspaces';
import runCommand from './commands/run';
import bumpCommand from './commands/bump';

async function main() {
  await yargs(hideBin(process.argv))
    .command(list)
    .command(conflictsCheckCommand)
    .command(conflictsFixCommand)
    .command(workspacesCommand)
    .command(bumpCommand)
    .command(runCommand)
    .demandCommand()
    .help()
    .argv;
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
