import IPackageManagerAdapter from './PackageManagerAdapter/IPackageManagerAdapter';
import DependencyGraph from './DependencyGraph';
import DependencyGraphBuilder from './DependencyGraphBuilder';

export default class DependencyGraphFactory {
    private readonly packageManager: IPackageManagerAdapter;

    constructor(packageManagerAdapter: IPackageManagerAdapter) {
      this.packageManager = packageManagerAdapter;
    }

    async buildGraph(packageName: string): Promise<DependencyGraph> {
      const graphBuilder = new DependencyGraphBuilder(this.packageManager);

      await graphBuilder.build(packageName);
      return graphBuilder.getGraph();
    }
}
