import { Arguments, Argv } from 'yargs';
import DependencyGraphFactory from '../../lib/DependencyGraphFactory';
import NpmAdapter from '../../lib/PackageManagerAdapter/NpmAdapter';

const conflictsFixCommand = {
  command: 'fix <packageNames..>',
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
    let anyConflictsFixed = false;

    await Promise.all(packageNames.map(async (packageName): Promise<void> => {
      const dependencyGraph = await builder.buildGraph(packageName);
      conflictsDescription[packageName] = [];

      const versionConflicts = dependencyGraph.getDependencyVersionConflicts();
      await Promise.all(versionConflicts.map(async (conflict) => {
        anyConflictsFixed = true;
        if (conflict.dependsOn !== conflict.localDependencyVersion) {
          // If the version in the dependant is different from version in the repo, we need to
          // set version from the local package as a dependency
          conflictsDescription[packageName]
            .push(
              `${conflict.dependantName} depends on ${conflict.dependencyName}@${conflict.dependsOn}, but local dependency is ${conflict.dependencyName}@${conflict.localDependencyVersion}`,
            );

          return packageManager.setDependencyVersionForPackage(
            conflict.dependantName,
            conflict.dependencyName,
            conflict.localDependencyVersion,
            conflict.resolved,
          );
        }
        if (conflict.dependencyResolvedTo) {
          // If versions are the same, but there's still "resolved" field, that means that one of
          // dependencies is installed from multiple sources, and project requires dependency
          // dedupe. Dedupe will run after the end of the fix command, so no action needs to be
          // taken here
          conflictsDescription[packageName]
            .push(
              `${conflict.dependantName} depends on the correct version of ${conflict.dependencyName}, but is still resolved from npm. Probably you need to run npm dedupe`,
            );
        }

        conflictsDescription[packageName]
          .push(
            `Unknown version conflict in ${conflict.dependantName} that depends on ${conflict.dependencyName}`,
          );
        // In theory the code should never end up in this branch
        throw new Error(`Unknown version conflict in ${conflict.dependantName} that depends on ${conflict.dependencyName}`);
      }));
    }));

    console.log('Found conflicts:');
    console.dir(conflictsDescription);
    console.log('Fixing conflicts...');

    if (anyConflictsFixed) {
      await packageManager.install();
      await packageManager.dedupe();
    }
  },
};

export default conflictsFixCommand;
