import yargs, { Arguments, Argv } from 'yargs';
import DependencyGraphFactory from '../../lib/DependencyGraphFactory';
import NpmAdapter from '../../lib/PackageManagerAdapter/NpmAdapter';

const conflictsCheckCommand = {
  command: 'check <packageNames..>',
  description: 'Check that all dependents of the package are linked to the local package instead of one from the npm',
  builder: (argv: Argv): Argv<{
    packageNames: string[] | undefined,
    json: boolean | undefined,
    error: boolean | undefined
  }> => argv
    .positional('packageNames', {
      type: 'string',
      array: true,
      describe: 'List of packages to check. Can be one or multiple package names separated with a whitespace',
    })
    .options({
      json: {
        type: 'boolean',
        description: 'Serialize command output as json for convenient parsing by other tools',
      },
      error: {
        type: 'boolean',
        description: 'Fail when conflicts detected instead of just outputting the conflicts. Useful in CI',
      },
    }),
  handler: async (args: Arguments<{
    packageNames: string[] | undefined,
    json: boolean | undefined,
    error: boolean | undefined
  }>): Promise<void> => {
    const { packageNames, json, error } = args;
    const conflictsDescription: { [packageName: string]: string[] } = {};
    let anyConflicts = false;

    if (!packageNames) {
      throw new Error('Expected at least one package name');
    }

    const builder = new DependencyGraphFactory(new NpmAdapter());
    await Promise.all(packageNames.map(async (packageName): Promise<void> => {
      const dependencyGraph = await builder.buildGraph(packageName);

      const versionConflicts = dependencyGraph.getDependencyVersionConflicts();
      conflictsDescription[packageName] = versionConflicts.map((conflict) => {
        if (!anyConflicts) {
          anyConflicts = true;
        }

        if (conflict.dependsOn !== conflict.localDependencyVersion) {
          return `${conflict.dependantName} depends on ${conflict.dependencyName}@${conflict.dependsOn}, but local dependency is ${conflict.dependencyName}@${conflict.localDependencyVersion}`;
        }
        if (conflict.dependencyResolvedTo) {
          return `${conflict.dependantName} depends on the correct version of ${conflict.dependencyName}, but is still resolved from npm. Probably you need to run npm dedupe`;
        }
        return `${conflict.dependantName} that depends on ${conflict.dependencyName} is causing a conflict for an unknown reason`;
      });
    }));

    // eslint-disable-next-line no-console
    if (json) {
      console.log(JSON.stringify(conflictsDescription));
    } else {
      console.dir(conflictsDescription, { depth: 100 });
    }

    if (anyConflicts && error) {
      throw new Error('Version check failed, version conflicts detected. Please check th output above');
    }
  },
};

export default conflictsCheckCommand;
