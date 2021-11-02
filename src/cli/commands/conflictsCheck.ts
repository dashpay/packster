import yargs, { Arguments, Argv } from 'yargs';
import DependencyGraphFactory from '../../lib/DependencyGraphFactory';
import NpmAdapter from '../../lib/PackageManagerAdapter/NpmAdapter';

const conflictsCheckCommand = {
  command: 'check',
  description: 'Check that all dependents of the package are linked to the local package instead of one from the npm',
  builder: (argv: Argv): Argv<{
    workspace: string[] | undefined,
    json: boolean | undefined,
    error: boolean | undefined,
    all: boolean | undefined,
  }> => argv
    .options({
      json: {
        type: 'boolean',
        description: 'Serialize command output as json for convenient parsing by other tools',
      },
      error: {
        type: 'boolean',
        description: 'Fail when conflicts detected instead of just outputting the conflicts. Useful in CI',
      },
      all: {
        type: 'boolean',
        description: 'Check all packages',
        conflicts: ['workspace'],
      },
      workspace: {
        type: 'string',
        description: 'List of packages to check. Can be one or multiple package names separated with a whitespace',
        conflicts: ['all'],
        array: true,
      },
    }),
  handler: async (args: Arguments<{
    workspace: string[] | undefined,
    json: boolean | undefined,
    error: boolean | undefined,
    all: boolean | undefined,
  }>): Promise<void> => {
    const { json, error, all } = args;
    let { workspace: packages } = args;
    const conflictsDescription: { [packageName: string]: string[] } = {};
    let anyConflicts = false;

    if (!packages && !all) {
      throw new Error('Expected --packages to check specific packages or --all option to check all packages');
    }

    if (packages && packages.length > 0 && all) {
      throw new Error('--all option can not be used when package names provided');
    }

    const packageManager = new NpmAdapter();

    if (all) {
      packages = await packageManager.listAllWorkspaces();
    }

    if (!packages || !packages.length) {
      throw new Error('No packages to check');
    }

    const builder = new DependencyGraphFactory(packageManager);
    await Promise.all(packages.map(async (packageName): Promise<void> => {
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
      yargs.exit(1, new Error('Version check failed, version conflicts detected. Please check th output above'));
    }
  },
};

export default conflictsCheckCommand;
