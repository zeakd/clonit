---
"clonit": minor
---

Implement source function architecture for flexible template handling

- Added `fromFS` source function with ignore pattern support
- Added `fromGit` source function with sparse checkout capability
- Redesigned API to use function-based sources: `create(fromFS('./template')).then(ctx => ctx.out('./target'))`
- Enhanced type safety and extensibility for future source types
- Support for both local filesystem and remote git templates