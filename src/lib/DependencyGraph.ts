import Package from './Package';

export default class DependencyGraph {
    public readonly packages: { [packageName: string] : Package }

    constructor(packages: { [packageName: string] : Package }) {
      this.packages = packages;
    }

    /**
     * Lists all packages that depend on the package for which graph was built, no
     * matter how nested.
     *
     * @return {string[]}
     */
    listAllDependants(): string[] {
      const packageNames = Object.keys(this.packages);

      // Direct and nested
      const uniqueDependants: string[] = [];

      for (const name of packageNames) {
        const dependants = this.packages[name].getDependants();

        for (const dependant of dependants) {
          if (!uniqueDependants.includes(dependant.name)) {
            uniqueDependants.push(dependant.name);
          }
        }
      }

      return uniqueDependants;
    }
}
