import { Arguments, Argv, boolean } from 'yargs';
import DependencyGraphFactory from '../../lib/DependencyGraphFactory';
import NpmAdapter from '../../lib/PackageManagerAdapter/NpmAdapter';
import DependencyGraph from '../../lib/DependencyGraph';

const conflictsFixCommand = {
  command: 'fix',
  description: 'Check that all dependents of the package are linked to the local package instead of one from the npm',
  builder: (argv: Argv): Argv<{
    workspace: string[] | undefined,
    all: boolean | undefined,
    dedupe: boolean | undefined,
  }> => argv
    .options({
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
      dedupe: {
        type: 'boolean',
        description: 'Run dedupe after fixing package versions',
      },
    }),
  handler: async (args: Arguments<{
    workspace: string[] | undefined,
    all: boolean | undefined,
    dedupe: boolean | undefined,
  }>): Promise<void> => {
    const { all, dedupe } = args;
    let { workspace: packages } = args;
    const conflictsDescription: { [packageName: string]: string[] } = {};

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
    let anyConflictsFixed = false;

    const graphs = await Promise.all(packages.map(async (packageName): Promise<{
      graph: DependencyGraph, name: string
    }> => {
      const graph = await builder.buildGraph(packageName);
      return { graph, name: packageName };
    }));

    await Promise.all(graphs.map(async (graph): Promise<void> => {
      const dependencyGraph = graph.graph;
      const packageName = graph.name;
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
      if (dedupe) {
        await packageManager.dedupe();
      }
    }

    console.log('Conflicts resolved. You might need to run dedupe manually');
  },
};

export default conflictsFixCommand;
