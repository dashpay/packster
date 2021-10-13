export interface IDependency {
    name: string;
    version: string | null;
    resolved: string | null;
    dependencies: { [packageName: string]: IDependency };
}
