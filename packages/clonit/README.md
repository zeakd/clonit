# Clonit

Maintainable scaffolding toolkit


```js
import { createClonit } from 'clonit'

// -
const ctx = await createClonit('./templates/hello-app/', {
	overwrite: true // overwrite target directory if not empty
}); 

// -
await ctx.rename('_gitignore', '.gitignore');
await ctx.update('README.md', (content) => {
	return content.replace('__PLACEHOLDER__', 'My App')
})
await ctx.updateJson('package.json', (pkg) => {
	pkg.description = 'My first app';
	pkg.name = 'my-app';
	return pkg;
})

// -
await ctx.out('./my-app');
```

## Core Concepts

- `createClonit`: 템플릿 폴더를 임시 디렉토리로 복사하고 ClonitContext를 생성
- `ClonitContext`: 템플릿 파일을 수정하고 최종 타겟 폴더로 복사하는 컨텍스트
- `rename`: 파일이나 디렉토리 이름 변경
- `update`: 텍스트 파일 내용 수정
- `updateJson`: JSON 파일 내용 수정
- `out`: 임시 폴더의 내용을 최종 타겟 폴더로 복사

## Options

- `ignore`: 복사할 때 제외할 파일/폴더 패턴 (glob)
- `keepTemp`: out() 후 임시 폴더를 유지할지 여부 (기본값: false=삭제)
- `overwrite`: 타겟 폴더가 비어있지 않을 때 덮어쓸지 여부 (기본값: false=에러)
- `cwd`: 작업 디렉토리 (기본값: process.cwd())

