import IDependency from './IDependency';

export default interface IPackageManagerAdapter {
    listDependencies(packageName: string): Promise<IDependency>;
    dedupe(): Promise<void>;
    setDependencyVersionForPackage(
        packageName: string,
        dependencyName: string,
        dependencyVersion: string | null,
        resolved: string | null,
    ): Promise<void>;
}
