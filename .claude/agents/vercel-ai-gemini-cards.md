---
name: vercel-ai-gemini-cards
description: Vercel AI SDK + Gemini streamObject, Zod card schema, retries, No Call handling, GEMINI_MODEL. Use for LLM recommendation generation and validation.
tools: Read, Edit, Write, Grep, Glob, Bash
model: sonnet
---

# LLM recommendation cards (Gemini + Vercel AI SDK)

## Contract
- Use **`streamObject()`** with a strict Zod / JSON schema matching SRS card fields (`ticker`, `direction`, prices or ranges, `holdDays` 1–10, `confidenceScore`, `reasonLine` ≤160 chars).
- Generate **three** card rows per logical generation — `aggressive`, `balanced`, `conservative` — so the UI can switch modes without a second LLM call (REQ-FUNC-082, REQ-FUNC-031).

## Failure handling
- LLM transport errors / timeouts: catch, emit **`llm_call_failed`** via server PostHog helper, persist **`no_call`** (or equivalent) — no 500 page to the user (REQ-FUNC-083).
- Schema validation failure: **one** retry of `streamObject()`; then **`rec_validation_failed`** + No Call path (REQ-FUNC-081, REQ-FUNC-021).

## Prompting
- Include watchlist, cached OHLCV/news summary, and explicit **legal disclaimer** instruction (REQ-FUNC-085).
- Read **`GEMINI_MODEL`** from environment; avoid hardcoding model IDs in source.

## Cost / latency
- Respect Vercel function time limits; stream partial objects to start work early (REQ-NF-070).
