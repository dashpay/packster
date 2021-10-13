import { Package } from './Package';
import { IPackageManagerAdapter } from './PackageManagerAdapter/IPackageManagerAdapter';
import { Dependant } from './Dependant';
import { DependencyGraph } from './DependencyGraph';

export class GraphBuilder {
    private packageManager: IPackageManagerAdapter;

    constructor(packageManagerAdapter: IPackageManagerAdapter) {
      this.packageManager = packageManagerAdapter;
    }

    async buildDependencyGraph(packageName: string) {
      const scanned: { [packageName: string]: boolean } = {};
      const currentlyScanning: { [packageName: string]: boolean } = {};
      const packages: { [packageName: string]: Package } = {};

      const buildGraph = async (packageName: string): Promise<void> => {
        currentlyScanning[packageName] = true;
        const result = await this.packageManager.listDependencies(packageName);
        // Result is a project itself, with name being the name of the project
        const self = result.dependencies[packageName];
        const { version } = self;
        const { resolved } = self;

        const pack = new Package(packageName, version, resolved);
        packages[packageName] = pack;

        const dependentNames = Object.keys(result.dependencies);

        // Filter itself, as it will be listed as a dependency
        await Promise.all(dependentNames
          .filter((dependentName) => dependentName !== packageName)
          .map((packageName) => {
            const rawDep = result.dependencies[packageName];

            if (!rawDep.dependencies[pack.getName()]) {
              return;
            }

            const dependency = rawDep.dependencies[pack.getName()];
            const dependant = new Dependant(
              packageName, rawDep.version, dependency.version, dependency.resolved,
            );
            pack.addDependant(dependant);

            if (currentlyScanning[packageName] || scanned[packageName]) {
              return;
            }

            return buildGraph(packageName);
          }));

        currentlyScanning[packageName] = false;
        scanned[packageName] = true;
      };

      await buildGraph(packageName);

      return new DependencyGraph(packages);
    }
}
