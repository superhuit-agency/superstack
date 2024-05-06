# Contributors guidelines

To maintain our project's quality and facilitate version management, we adhere to structured guidelines for version updating and change logging.

## Version update rules

Our goal by instoring version update rules is to ensure that the project's versioning is consistent and predictable.

Our version numbering follows the MAJOR.MINOR.PATCH format, with increments based on the type of changes made:

-   **MAJOR** version: when you update Wordpress or Next.js versions in this way we keep in sync with the versions of the main technologies of our boilerplate.
-   **MINOR** version: when you add features
-   **PATCH** version: when you make bug fixes

Our version updating rules are inspired by the [Semantic Versioning](https://semver.org/).

## Change log documentation

To keep each stakeholder informed and be able to trace back the evolution each change in the project should be documented in our [CHANGELOG.md](./CHANGELOG.md) file.
The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Here's a guideline for documenting changes:

```markdown
## [version] - [date]

### Added

-   Feature or enhancement (issue #[issue_number])

### Changed

-   Modification to existing feature (issue #[issue_number])

### Fixed

-   Resolved bug or issue (issue #[issue_number])

### Removed | Deprecated | Security | Breaking Changes | Documentation | Others

-   Specify any removals, deprecations, security updates, breaking changes, or other noteworthy changes.
```
