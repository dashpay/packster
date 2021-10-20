import Package from './Package';

/**
 * If the field `dependencyResolvedTo` is set, that means that the dependency was resolved through
 * npm. If the above is true and the localDependencyVersion is different from dependsOn, that that
 * means that although the versions do match, dependency was resolves through npm, and running
 * `npm dedupe` would fix that
 */
interface VersionConflict {
    dependantName: string;
    dependencyName: string;
    localDependencyVersion: string | null;
    dependsOn: string | null;
    dependencyResolvedTo: string | null;
    resolved: string | null;
}

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
      // Direct and nested
      const uniqueDependants: string[] = [];

      for (const [, pack] of Object.entries(this.packages)) {
        const dependants = pack.getDependants();

        for (const dependant of dependants) {
          if (!uniqueDependants.includes(dependant.name)) {
            uniqueDependants.push(dependant.name);
          }
        }
      }

      return uniqueDependants;
    }

    getDependencyVersionConflicts(): VersionConflict[] {
      // Direct and nested
      const conflicts: VersionConflict[] = [];

      for (const [, pack] of Object.entries(this.packages)) {
        const dependants = pack.getDependants();

        for (const dependant of dependants) {
          if (dependant.dependsOnVersion !== pack.getVersion()) {
            conflicts.push({
              dependantName: dependant.name,
              dependsOn: dependant.dependsOnVersion,
              dependencyName: pack.getName(),
              localDependencyVersion: pack.getVersion(),
              dependencyResolvedTo: dependant.dependencyResolvedTo,
              resolved: dependant.resolved,
            });
          }
        }
      }

      return conflicts;
    }
}
