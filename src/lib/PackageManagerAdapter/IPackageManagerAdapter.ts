import { IDependency } from './IDependency';

export interface IPackageManagerAdapter {
    listDependencies(packageName: string): Promise<IDependency>;
}
