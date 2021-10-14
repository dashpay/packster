import Dependant from './Dependant';

export default class Package {
    private readonly name: string;

    private readonly version: string | null;

    private readonly resolved: string | null;

    private readonly dependants: Dependant[];

    /**
     *
     * @param {string} name
     * @param {string} version
     * @param {string} resolved
     */
    constructor(name: string, version: string | null, resolved: string | null) {
      this.name = name;
      this.version = version;
      this.resolved = resolved;
      this.dependants = [];
    }

    /**
     *
     * @return {string}
     */
    getName(): string {
      return this.name;
    }

    getVersion(): string | null {
      return this.version;
    }

    getDependants(): Dependant[] {
      return this.dependants;
    }

    getResolved(): string | null {
      return this.resolved;
    }

    /**
     *
     * @param {Dependant} dependant
     */
    addDependant(dependant: Dependant): void {
      this.dependants.push(dependant);
    }
}
