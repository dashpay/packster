import { Dependant } from './Dependant';

export class Package {
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
    getName() {
      return this.name;
    }

    getVersion() {
      return this.version;
    }

    getDependants() {
      return this.dependants;
    }

    getResolved() {
      return this.resolved;
    }

    /**
     *
     * @param {Dependant} dependant
     */
    addDependant(dependant: Dependant) {
      this.dependants.push(dependant);
    }
}
