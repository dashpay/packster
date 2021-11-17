import { Arguments, Argv } from 'yargs';
import semver from 'semver';
import bumpReleaseVersionToPrereleaseVersion from '../../lib/utils/bumpReleaseVersionToPrereleaseVersion';
import exec from '../../lib/utils/exec';
import NpmAdapter from '../../lib/PackageManagerAdapter/NpmAdapter';
import listDependencies from '../../lib/utils/listDependencies';

const bumpCommand = {
  command: 'bump [releaseType]',
  description: 'bump version for all packages',
  builder: (argv: Argv): Argv<{
    releaseType: string | undefined
  }> => argv
    .positional('releaseType', {
      type: 'string',
      describe: 'Release type. Can be release or prerelease',
      choices: ['release', 'prerelease'],
    }),
  handler: async (args: Arguments<{
    releaseType: string | undefined,
  }>): Promise<void> => {
    let { releaseType } = args;
    const npmAdapter = new NpmAdapter();

    const rootVersion = (await exec('npm pkg get version')).replace(/"/g, '').trim();
    const rootVersionType = semver.prerelease(rootVersion) !== null ? 'prerelease' : 'release';

    if (releaseType === undefined) {
      // get releaseType from root package.json
      releaseType = semver.prerelease(rootVersion) !== null ? 'prerelease' : 'release';
    }

    // collect workspaces data
    const workspaces: string[] = await npmAdapter.listAllWorkspaces();
    const versionsWithWorkspaces = await Promise.all(
      workspaces.map(async (workspace) => {
        const workspaceWithVersion: Record<string, string> = JSON.parse(await exec(`npm pkg get version -w ${workspace}`));
        const version: string = workspaceWithVersion[workspace];

        return {
          workspace,
          version,
        };
      }),
    );

    const versionsByWorkspaces: Record<string, string> = versionsWithWorkspaces
      .reduce((result: Record<string, string>, { workspace, version }) => ({
        ...result,
        [workspace]: version,
      }), {});

    // check all packages have the same type of version: release or prerelease
    const workspacesWithBadVersions: Array<Record<'version' | 'workspace', string>> = [];
    versionsWithWorkspaces.forEach(({ version, workspace }) => {
      const workspaceVersionType = semver.prerelease(version) !== null ? 'prerelease' : 'release';

      if (workspaceVersionType !== rootVersionType) {
        workspacesWithBadVersions.push({ version, workspace });
      }
    });

    if (workspacesWithBadVersions.length > 0) {
      const wrongPackagesMsg = workspacesWithBadVersions
        .reduce((result, item) => `${result}\n${item.workspace}: ${item.version}`, '');

      console.error(`Main package has ${rootVersionType} version ${rootVersion} but these packages have another type of versions: ${wrongPackagesMsg}`);

      process.exit(1);
    }

    const dependenciesByWorkspaces = await listDependencies(workspaces);

    // bump versions
    if (rootVersionType === releaseType && releaseType === 'prerelease') {
      // update packages versions
      console.log('Bump version in prerelease mode');

      await exec('npm version prerelease --preid=dev --workspaces --no-git-tag-version');

      // update root version
      await exec('npm version prerelease --preid=dev -no-git-tag-version');
    } else if (releaseType === 'release') {
      // update packages versions
      console.log('Bump version in release mode');

      await exec('npm version patch --workspaces --no-git-tag-version');

      // update root version
      await exec('npm version patch --no-git-tag-version');
    } else {
      console.log('Bump version in release to prerelease mode');

      await Promise.all(
        workspaces.map(async (workspace) => {
          const currentVersion = versionsByWorkspaces[workspace];
          const newVersion = bumpReleaseVersionToPrereleaseVersion(currentVersion);

          await exec(`npm pkg set version=${newVersion} -w ${workspace}`);
        }),
      );

      // update root version
      const newVersion = bumpReleaseVersionToPrereleaseVersion(rootVersion);
      await exec(`npm --no-git-tag-version version ${newVersion}`);
    }

    // update dependencies
    const updatedVersionsWithWorkspaces = await Promise.all(
      workspaces.map(async (workspace) => {
        const workspaceWithVersion: Record<string, string> = JSON.parse(await exec(`npm pkg get version -w ${workspace}`));
        const version: string = workspaceWithVersion[workspace];

        return {
          workspace,
          version,
        };
      }),
    );

    const updatedVersionsByWorkspaces: Record<string, string> = updatedVersionsWithWorkspaces
      .reduce((result: Record<string, string>, { workspace, version }) => ({
        ...result,
        [workspace]: version,
      }), {});

    // don't use Promise.all, because it will cause race condition
    for (const workspace of workspaces) {
      const version = updatedVersionsByWorkspaces[workspace];
      // don't use Promise.all, because it will break json files
      for (const dependency of dependenciesByWorkspaces[workspace]) {
        await npmAdapter.setDependencyVersionForPackage(
          dependency,
          workspace,
          version,
        );
      }
    }

    // fix dependencies on package.json files
    await exec('packster fix --all');

    // run npm i to update package-lock.json
    await exec('npm i');
  },
};

export default bumpCommand;
