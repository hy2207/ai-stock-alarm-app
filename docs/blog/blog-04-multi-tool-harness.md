# 하나의 규칙, 세 개의 AI 도구: Cursor·Claude Code·Antigravity 동시 운영기

이번 프로젝트는 처음부터 한 가지 도구로만 개발하지 않았다. Cursor, Claude Code, 그리고 Google Antigravity를 상황에 따라 바꿔가며 썼다. 문제는 세 도구가 프로젝트 규칙을 읽는 방식이 전부 다르다는 것이다 — 하나의 도구에만 규칙을 써두면 다른 도구를 켰을 때 그 규칙이 통째로 증발한다. 이번 편은 "지식은 중앙화하고, 제어는 분산화한다"는 원칙으로 이 문제를 어떻게 풀었는지에 대한 기록이다.

## 1. 문제 상황: 도구마다 규칙 파일이 다르다

각 도구가 자동으로 읽어들이는 파일이 이렇게 다르다.

| 도구 | 전역 규칙 위치 | 스킬 위치 |
|---|---|---|
| Cursor | `.cursor/rules/*.mdc` | `.cursor/skills/*/SKILL.md` |
| Claude Code | `CLAUDE.md` | `.claude/skills/*/SKILL.md` (또는 `.claude/agents`) |
| Antigravity / Gemini CLI | `.agents/rules/*.md` | `.agents/skills/*/SKILL.md` |

똑같은 "차트를 메인 화면에 넣지 마라" 같은 규칙을 세 곳에 복붙해두면, 나중에 규칙 하나 고칠 때마다 세 파일을 손으로 맞춰야 한다. 실제로 초기에 이렇게 하다가 한 번 어긋난 적이 있다 — Cursor 쪽 규칙은 업데이트했는데 Claude Code 쪽은 깜빡해서, 도구를 바꿔 켰더니 이미 폐기한 결정을 다시 구현하려는 걸 본 적이 있다.

## 2. 해법: `AGENTS.md`를 공통 상위 규칙으로

그래서 프로젝트 루트에 `AGENTS.md`라는 파일 하나를 만들고, 여기에 제품 원칙·ADR·기술 스택 같은 "내용(Content)"을 전부 몰아넣었다. 이 파일은 Cursor, Claude Code, Antigravity 세 도구가 공통으로 읽는 오픈한 규약이다.

```markdown
# AGENTS.md — Cross-tool global rules
**Supported by:** Cursor, Claude Code, Google Antigravity / Gemini CLI

- docs/PRD_v1.md — 제품 비전, ADR, KPI
- docs/SRS-v1.md — 기능/비기능 요구사항, API, Prisma 모델

구현 세부사항 충돌 시: PRD → SRS → AGENTS.md → 코드 순서
```

그리고 각 도구 전용 파일(`CLAUDE.md`, `.cursor/rules`)에는 내용을 다시 쓰지 않고, `AGENTS.md`를 참조하도록만 얇게 써뒀다. `CLAUDE.md`를 열어보면 실제로 "Global rules: see AGENTS.md" 한 줄로 시작한다.

[스크린샷 삽입 위치: 저장소 루트에서 `AGENTS.md`, `CLAUDE.md`, `.cursor/`, `.agents/` 폴더가 나란히 보이는 GitHub 파일 트리 화면 — https://github.com/hy2207/ai-stock-alarm-app ]

## 3. 스킬은 심볼릭 링크로 하나만 관리

스킬(반복 작업 매뉴얼)도 세 벌 쓰지 않는다. 물리적으로는 `.cursor/skills/` 한 곳에만 파일을 두고, 나머지는 심볼릭 링크로 연결한다.

```bash
# .agents/skills -> .cursor/skills 심볼릭 링크
ln -sfn ../.cursor/skills .claude/skills
```

`generate-tasks-from-srs`, `010-decision-layer-product-gates` 같은 스킬을 한 번만 쓰면 세 도구 모두에서 동일하게 호출된다. 스킬 내용을 고치는 것도 파일 하나만 고치면 끝난다.

## 4. 공통화할 수 없는 것은 억지로 합치지 않는다

여기서 중요한 판단이 하나 있었다 — 서브에이전트 정의와 훅(Hook)은 공통화를 포기했다는 것이다.

- Claude Code 서브에이전트(`.claude/agents/*.md`)는 `skills` 프론트매터로 스킬을 미리 주입(preload)하거나 `context: fork`로 컨텍스트를 분리하는 기능이 있다.
- Gemini CLI 서브에이전트(`.gemini/agents/*.md`)는 `model: inherit` 같은 Hub-and-Spoke 구조를 명시해야 한다.
- Cursor 서브에이전트는 툴 제어와 페르소나 설정 위주로 다르게 짜여 있다.

이걸 억지로 하나의 포맷으로 추상화하려고 하면 결국 최소공배수만 남아서 어느 도구에서도 제대로 안 되는 서브에이전트가 나온다. 그래서 서브에이전트, 훅처럼 "도구의 세부 엔진에 직접 물리는" 영역은 도구별로 따로 쓰고, 대신 `README-cursor-harness.md`, `README-claude-harness.md`, `README-gemini-harness.md`로 도구별 가이드만 분리해뒀다.

## 5. 정리하면: 지식은 중앙화, 제어는 분산화

세 도구를 오가며 개발하면서 정리된 원칙은 결국 두 줄이다.

1. 프로젝트 아키텍처, 코드 스타일, PR 컨벤션처럼 "내용"에 해당하는 건 `AGENTS.md`와 공유 스킬 폴더에 중앙화한다.
2. 파일 패턴 매칭, 서브에이전트 권한, 훅처럼 "행동"에 해당하는 건 도구별 전용 폴더에 맞춤으로 둔다.

이 구분을 세워두니 도구를 바꿔 켤 때마다 규칙이 어긋나는 문제가 거의 사라졌다. 다음 편에서는 이 구조 위에서 Claude Code 서브에이전트를 실제로 6개로 나눈 기준을 다룬다.
