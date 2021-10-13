export class Dependant {
    public readonly name: string;

    public readonly version: string | null;

    public readonly dependsOnVersion: string | null;

    public readonly dependencyResolvedTo: string | null;

    /**
     *
     * @param name
     * @param version
     * @param dependsOnVersion
     * @param dependencyResolvesTo
     */
    constructor(name: string, version: string | null, dependsOnVersion: string | null, dependencyResolvesTo: string | null) {
      this.name = name;
      this.version = version;
      this.dependsOnVersion = dependsOnVersion;
      this.dependencyResolvedTo = dependencyResolvesTo;
    }
}
