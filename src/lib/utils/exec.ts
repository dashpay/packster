import { exec, ExecOptions } from 'child_process';

interface Options {
  forwardStdout?: boolean
}
/**
 *
 * @param {string} command
 * @param [options]
 * @param {string} [options.cwd] - working directory to run command from
 * @param {boolean} [options.forwardStdout] - forwarding stdout of the command to console.log
 * @returns {Promise<string>}
 */
export default function execute(
  command: string, options: ExecOptions & Options = {},
): Promise<string> {
  return new Promise((resolve, reject) => {
    const childProcess = exec(command, options, (err, result) => {
      if (err) {
        return reject(err);
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return resolve(result);
    });

    if (options.forwardStdout && childProcess.stdout) {
      childProcess.stdout.on('data', (data) => {
        // eslint-disable-next-line no-console
        // console.log(`${data}`);
        process.stdout.write(data);
      });
    }
  });
}
