# @zeakd/create

## 0.1.0

### Minor Changes

- 681aced: create @zeakd/create

## 1.1.0

### Minor Changes

- 9a03a86: Update to use new clonit source function API

  - Migrated from string-based template sources to function-based approach
  - Now uses `fromFS` for local templates and `fromGit` for remote templates
  - Improved template resolution with better error messages
  - Enhanced TypeScript template support with proper configurations
  - Updated dependencies to latest versions

### Patch Changes

- Updated dependencies [9a03a86]
  - clonit@0.2.0
