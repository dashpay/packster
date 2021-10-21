import exec from '../utils/exec';
import IPackageManagerAdapter from './IPackageManagerAdapter';
import IDependency from './IDependency';

export default class NpmAdapter implements IPackageManagerAdapter {
  async listDependencies(packageName: string): Promise<IDependency> {
    const command = `npm ls ${packageName} --json`;
    return JSON.parse(await exec(command));
  }

  async dedupe(): Promise<void> {
    await exec('npm dedupe');
  }

  async install(): Promise<void> {
    await exec('npm i');
  }

  async setDependencyVersionForPackage(
    packageName: string, dependency: string, version: string | null, resolved: string | null,
  ): Promise<void> {
    const devDependencies = JSON.parse(
      await exec(`npm pkg get devDependencies -w ${packageName}`),
    );

    const isDevDependency = !!devDependencies[packageName][dependency];

    const versionString = version ? `${version}` : '';
    const dependencyString = isDevDependency ? 'devDependencies' : 'dependencies';

    const command = `npm pkg set ${dependencyString}.${dependency}=${versionString} -w ${packageName}`;
    const res = await exec(command);
    console.log(`${packageName}: Set ${dependency} version to ${version} ${res}`);
  }

  async listAllWorkspaces(): Promise<string[]> {
    const packages = JSON.parse(await exec('npm pkg get name --workspaces'));
    return Object.keys(packages);
  }
}
