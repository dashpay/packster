import semver from 'semver';

const bumpReleaseVersionToPrereleaseVersion = (version: string): string => {
  const bumpedVersion = <string>semver.inc(version, 'minor');

  return `${semver.major(bumpedVersion)}.${semver.minor(bumpedVersion)}.0-dev.1`;
};

export default bumpReleaseVersionToPrereleaseVersion;
