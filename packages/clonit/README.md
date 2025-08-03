# Clonit

Maintainable scaffolding toolkit

## Installation

```bash
npm install clonit
```

## Usage

### New API with Source Functions

```js
import { create, fromFS, fromGit } from 'clonit'

// From file system
const ctx = await create(fromFS('./templates/hello-app'), './my-app', {
	overwrite: true, // overwrite target directory if not empty
	dryRun: true    // simulate operations without actual changes
});

// From git repository
const ctx2 = await create(
  fromGit('https://github.com/user/template-repo', { 
    branch: 'main',
    depth: 1 
  }), 
  './my-app'
);

// Backward compatible - string source still works
const ctx3 = await create('./templates/hello-app/', './my-app', {
	overwrite: true,
	dryRun: true    
}); 

// Transform files
await ctx.rename('_gitignore', '.gitignore');
await ctx.update('README.md', (content) => {
	return content.replace('__PLACEHOLDER__', 'My App')
})
await ctx.updateJson('package.json', (pkg) => {
	pkg.description = 'My first app';
	pkg.name = 'my-app';
	return pkg;
})

// Output to target directory
await ctx.out('./my-app');
```

## Source Functions

### fromFS(source, options?)
Create a source function that copies from the file system.

Options:
- `ignore`: File/folder patterns to ignore when copying (glob)

### fromGit(repo, options?)
Create a source function that clones from a git repository.

Options:
- `branch`: Branch to clone (default: 'main')
- `tag`: Tag to clone
- `commit`: Specific commit to checkout after clone
- `depth`: Clone depth for shallow clones (default: 1)
- `sparse`: Array of paths for sparse checkout

Example with sparse checkout:
```js
// Clone only a specific directory from a repository
const ctx = await create(
  fromGit('https://github.com/vitejs/vite', {
    sparse: ['packages/create-vite/template-react-ts']
  }),
  './my-react-app'
);
// The contents of template-react-ts will be placed at the root of my-react-app
```

## Core Concepts

- `create`: 소스 함수를 실행하여 임시 디렉토리로 복사하고 ClonitContext를 생성
- `fromFS`: 파일 시스템에서 복사하는 소스 함수 생성
- `fromGit`: Git 저장소에서 클론하는 소스 함수 생성
- `ClonitContext`: 템플릿 파일을 수정하고 최종 타겟 폴더로 복사하는 컨텍스트
- `rename`: 파일이나 디렉토리 이름 변경
- `update`: 텍스트 파일 내용 수정
- `updateJson`: JSON 파일 내용 수정
- `read`: 파일 내용 읽기
- `out(targetDir)`: 임시 폴더의 내용을 최종 타겟 폴더로 복사

## Options

- `ignore`: 복사할 때 제외할 파일/폴더 패턴 (glob) - 문자열 소스에서만 사용
- `keepTemp`: out() 후 임시 폴더를 유지할지 여부 (기본값: false=삭제)
- `overwrite`: 타겟 폴더가 비어있지 않을 때 덮어쓸지 여부 (기본값: false=에러)
- `cwd`: 작업 디렉토리 (기본값: process.cwd())
- `dryRun`: 실제 파일 시스템 변경 없이 시뮬레이션만 수행 (기본값: false)

