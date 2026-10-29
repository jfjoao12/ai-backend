
# Project Agent Instructions

This project uses NestJS, TypeScript, LangChain, and LangGraph.

## General Rules

- Inspect the existing architecture before making changes.
- Follow established naming conventions and project structure.
- Prefer maintainable, type-safe, modular solutions.
- Challenge architectural decisions when a simpler or more scalable solution exists.
- Avoid unnecessary abstractions, dependencies, and breaking changes.
- Verify framework APIs against installed package versions.
- Never assume deprecated APIs are supported.
- Explain significant architectural trade-offs.

## NestJS

Official documentation:
https://docs.nestjs.com/

Installed skill:
`.agents/skills/nestjs-best-practices/SKILL.md`

Rules:
- Use the `nestjs-best-practices` skill for relevant NestJS implementation, refactoring, and code review tasks.
- Read its `SKILL.md` and consult applicable rules when needed.
- Consult official NestJS documentation for framework-specific changes.
- Respect NestJS module boundaries and dependency injection patterns.
- Prefer DTO validation, explicit contracts, and proper error handling.
- Keep controllers thin and business logic in appropriate providers.
- Preserve OpenAPI compatibility when changing API contracts.

## LangChain and LangGraph

Official documentation index:
https://docs.langchain.com/llms.txt

TypeScript documentation index:
https://docs.langchain.com/_llms/agent-development-lifecycle/build/type-script.txt

Rules:
- Consult official documentation before implementing LangChain, LangGraph, or Deep Agents features.
- Follow relevant documentation links from the indexes.
- Prefer TypeScript examples.
- Verify APIs against installed package versions.
- Never assume deprecated APIs are supported.
- Prefer framework-supported agent patterns over custom implementations when appropriate.
- Keep agent orchestration separate from HTTP transport and controllers.

## API and Streaming

- Preserve existing request, response, and streaming contracts unless changes are explicitly required.
- Define explicit types for streaming events and their payloads.
- Consider errors, cancellation, and connection termination.
- Keep OpenAPI schemas consistent with actual runtime behavior.
- Do not assume OpenAPI alone can fully describe streaming event semantics.

## Verification

- Run relevant existing tests, linting, and type checks after changes when possible.
- Report any checks that could not be executed.
- Explain what changed and why.
