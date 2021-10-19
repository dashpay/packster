import IPackageManagerAdapter from './PackageManagerAdapter/IPackageManagerAdapter';
import Package from './Package';
import Dependant from './Dependant';
import DependencyGraph from './DependencyGraph';

export default class DependencyGraphBuilder {
    private readonly packageManager: IPackageManagerAdapter;

    public scanned: { [packageName: string]: boolean };

    public currentlyScanning: { [packageName: string]: boolean };

    public packages: { [packageName: string]: Package };

    constructor(packageManager: IPackageManagerAdapter) {
      this.scanned = {};
      this.currentlyScanning = {};
      this.packages = {};
      this.packageManager = packageManager;
    }

    async build(packageName: string): Promise<void> {
      const { currentlyScanning, scanned, packages } = this;
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
        .filter((dependentName: string) => dependentName !== packageName)
        .map(async (dependantName: string) => {
          const rawDep = result.dependencies[dependantName];

          if (!rawDep.dependencies[pack.getName()]) {
            return;
          }

          const dependency = rawDep.dependencies[pack.getName()];
          const dependant = new Dependant(
            dependantName, rawDep.version, dependency.version, dependency.resolved, rawDep.resolved,
          );
          pack.addDependant(dependant);

          if (currentlyScanning[dependantName] || scanned[dependantName]) {
            return;
          }

          await this.build(dependantName);
        }));

      currentlyScanning[packageName] = false;
      scanned[packageName] = true;
    }

    getGraph(): DependencyGraph {
      return new DependencyGraph(this.packages);
    }
}
