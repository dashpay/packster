import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

import list from './commands/list';
import conflictsCheckCommand from './commands/conflictsCheck';
import conflictsFixCommand from './commands/conflictsFix';

async function main() {
  await yargs(hideBin(process.argv))
    .command(list)
    .command(conflictsCheckCommand)
    .command(conflictsFixCommand)
    .option('verbose', {
      alias: 'v',
      type: 'boolean',
      description: 'Run with verbose logging',
    })
    .demandCommand()
    .help()
    .argv;
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error(e);
  process.exit(1);
});
