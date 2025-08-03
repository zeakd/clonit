---
"@zeakd/create": minor
---

Update to use new clonit source function API

- Migrated from string-based template sources to function-based approach
- Now uses `fromFS` for local templates and `fromGit` for remote templates
- Improved template resolution with better error messages
- Enhanced TypeScript template support with proper configurations
- Updated dependencies to latest versions