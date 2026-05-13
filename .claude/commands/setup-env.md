---
description: Node/Next.js 프로젝트 빌드·환경변수 점검 (SRS 스택 기준)
argument-hint: [선택: dev | prod]
allowed-tools: Read, Edit, Write, Grep, Glob, Bash
---

# Build & Environment Setup (Decision Layer / Next.js)

대상 환경: **$ARGUMENTS** (미지정 시 `dev`)

## 1. 레포 구조
```bash
tree -L 3 -I 'node_modules|.git|.next|dist|coverage' .
```
(또는 `find` 로 `app/`, `prisma/`, `src/` 존재 확인)

## 2. 패키지 매니저
- **pnpm** 우선 (`pnpm -v`). `package.json` scripts: `dev`, `build`, `lint`, `test` 등 확인.
- 레거시 Vite 스캐폴드가 남아 있으면 SRS **C-TEC-001** 기준으로 Next.js 마이그레이션 계획을 메모.

## 3. 필수 환경 변수 (예시 — 실제 키는 팀 비밀)
- `DATABASE_URL` (SQLite 로컬 / Supabase Postgres)
- `NEXTAUTH_SECRET`, OAuth 클라이언트 ID/시크릿 (Google/Kakao 등)
- `GEMINI_API_KEY`, `GEMINI_MODEL`
- `POSTHOG_KEY` (또는 프로젝트 표준명), `NEXT_PUBLIC_POSTHOG_KEY` 등
- `ONESIGNAL_*` (REST 키, 앱 ID 등 팀 표준)
- `CRON_SECRET` (Vercel Cron이 호출하는 라우트 보호)
- `.env.example` 이 있으면 누락 키를 PR에 맞춰 갱신 제안.

## 4. Prisma
- `prisma/schema.prisma` 존재 시 `pnpm prisma validate` (또는 `npx prisma validate`).
- 마이그레이션 디렉터리와 배포 DB URL 일치 여부 확인.

## 5. Vercel
- 프로젝트에 `vercel.json` 있으면 cron 경로와 `CRON_SECRET` 사용처 검토.
- **Secrets는 Vercel 대시보드**에만; Git에 커밋 금지.

## 6. 산출물
- 누락된 env, 스크립트 불일치, 빌드 실패 원인을 목록화.
- 필요 시 `README.md` Setup 섹션 또는 `.env.example` 패치 제안.
