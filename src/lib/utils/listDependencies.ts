import DependencyGraphFactory from '../DependencyGraphFactory';
import NpmAdapter from '../PackageManagerAdapter/NpmAdapter';

const listDependencies = async (packageNames: string[]):
  Promise<{ [packageName: string]: string[] }> => {
  const result: { [packageName: string]: string[] } = {};

  const builder = new DependencyGraphFactory(new NpmAdapter());
  await Promise.all(packageNames.map(async (packageName): Promise<void> => {
    const dependencyGraph = await builder.buildGraph(packageName);
    result[packageName] = dependencyGraph.listAllDependants();
  }));

  return result;
};

export default listDependencies;
