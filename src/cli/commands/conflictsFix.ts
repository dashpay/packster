import { Arguments, Argv } from 'yargs';
import DependencyGraphFactory from '../../lib/DependencyGraphFactory';
import NpmAdapter from '../../lib/PackageManagerAdapter/NpmAdapter';

const conflictsFixCommand = {
  command: 'check <packageNames..>',
  description: 'Check that all dependents of the package are linked to the local package instead of one from the npm',
  builder: (argv: Argv): Argv<{ packageNames: string[] | undefined }> => argv.positional('packageNames', {
    type: 'string',
    array: true,
    describe: 'List of packages to check. Can be one or multiple package names separated with a whitespace',
  }),
  handler: async (args: Arguments<{ packageNames: string[] | undefined }>): Promise<void> => {
    const { packageNames } = args;
    const conflictsDescription: { [packageName: string]: string[] } = {};

    if (!packageNames) {
      throw new Error('Expected at least one package name');
    }

    const packageManager = new NpmAdapter();
    const builder = new DependencyGraphFactory(packageManager);
    await Promise.all(packageNames.map(async (packageName): Promise<void> => {
      const dependencyGraph = await builder.buildGraph(packageName);

      const versionConflicts = dependencyGraph.getDependencyVersionConflicts();
      await Promise.all(versionConflicts.map((conflict) => {
        if (conflict.dependsOn !== conflict.localDependencyVersion) {
          // TODO: Set correct version here
          throw new Error('Not implemented');
          return Promise.resolve();
        }
        if (conflict.dependencyResolvedTo) {
          return packageManager.dedupe();
        }
        throw new Error(`Unknown version conflict in ${conflict.dependantName} that depends on ${conflict.dependencyName}`);
      }));
    }));

    // eslint-disable-next-line no-console
    console.log(conflictsDescription);
  },
};

export default conflictsFixCommand;
