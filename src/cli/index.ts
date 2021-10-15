import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

import list from './commands/list';
import conflictsCheck from './commands/conflictsCheck';

async function main() {
  await yargs(hideBin(process.argv))
    .command(list)
    .command(conflictsCheck)
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
