import yargs from 'yargs/yargs';
import { hideBin } from 'yargs/helpers';

import list from './commands/list';

async function main() {
  await yargs(hideBin(process.argv))
    .command(list)
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
  console.error(e);
  process.exit(1);
});
