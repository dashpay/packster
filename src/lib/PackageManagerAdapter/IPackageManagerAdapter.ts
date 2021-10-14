import IDependency from './IDependency';

export default interface IPackageManagerAdapter {
    listDependencies(packageName: string): Promise<IDependency>;
}
