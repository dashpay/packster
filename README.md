# Packster

<a href='https://www.npmjs.com/package/js-merkle' target='_blank'><img src='https://img.shields.io/npm/v/js-merkle' alt='NPM Version' /></a>
<a href='https://coveralls.io/github/antouhou/js-merkle?branch=refs/tags/v0.1.2'><img src='https://coveralls.io/repos/github/antouhou/js-merkle/badge.svg?branch=refs/tags/v0.1.2' alt='Coverage Status' /></a>
<img src='https://github.com/antouhou/js-merkle/workflows/Build%20and%20test/badge.svg' alt="Build status" />

Description

### The key advantages of this library:

- Some cool feature

## Usage

### Available commands

#### list

Lists dependents of a certain package

#### check

Checks that all packages use local package as a dependency

Options:

- `--all`: Check all packages in the repository
- `--json`: Serialize output to json
- `--error`: Exit process with status 1 instead of just printing version conflicts.
Useful in CI
- `--workspace`: Check dependents of a specific workspace. You can specify
`--workspace` multiple times. Conflicts with `-all`

#### fix

Make all packages that do not use local package as a dependency to use it

Options:

- `--all`: Fix versions for all packages in the repository
- `--workspace`: Fix dependents of a specific workspace. You can specify
  `--workspace` multiple times. Conflicts with `-all`
- `--dedupe`: Run dedupe after fixing version conflicts

#### run

Usage: `packster run test`

Options: 

- `--workspace`: Run the command in a specific workspace. You can specify
  `--workspace`: multiple times. Conflicts with `-all`
- `--all`: Run the command in all workspaces
- `--except`: Run the command in all workspaces except for specified packages. 
You can specify `--except` multiple times. Conflicts with `--workspace`
- `--interrupt`: Fail on the first encountered error 

#### workspaces

List all packages in the repository

#### 

## Contributing

Everyone is welcome to contribute in any way or form! For the further details, please read [CONTRIBUTING.md](./CONTRIBUTING.md)

## Authors
- [Anton Suprunchuk](https://github.com/antouhou) - [Website](https://antouhou.com)

See also the list of contributors who participated in this project.

## License

This project is licensed under the MIT License - see the [LICENSE.md](./LICENSE.md) file for details
