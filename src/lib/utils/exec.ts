import { exec } from 'child_process';

/**
 *
 * @param {string} command
 * @param [options]
 * @param {string} [options.cwd] - working directory to run command from
 * @param {boolean} [options.forwardStdout] - forwarding stdout of the command to console.log
 * @returns {Promise<string>}
 */
export function execute(command: string, options: any = {}): Promise<string> {
  return new Promise((resolve, reject) => {
    const childProcess = exec(command, options, (err, result) => {
      if (err) {
        return reject(err);
      }
      // @ts-ignore
      return resolve(result);
    });

    if (options.forwardStdout && childProcess.stdout) {
      childProcess.stdout.on('data', (data) => {
        console.log(`${data}`);
      });
    }
  });
}
