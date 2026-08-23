# Agentic AI Backend

A modular RAG backend for an interactive developer portfolio. It streams stateful, tool-using AI responses and grounds them in a PostgreSQL/pgvector knowledge base.

**Stack:** TypeScript · NestJS · LangGraph · LangChain · Gemini · Ollama · PostgreSQL · pgvector · Docker

## Highlights

- Real-time chat over Server-Sent Events (SSE), with backpressure and stream error handling
- Stateful conversations using reusable thread IDs and LangGraph memory
- Agent tools for semantic retrieval, server time, and frontend navigation
- RAG pipeline for loading, chunking, embedding, and retrieving local text documents
- Gemini chat and embeddings, with an Ollama-compatible model adapter
- Modular NestJS services, dependency injection, lifecycle management, and DTO validation

## Architecture

```text
Client --SSE--> NestJS API --> LangGraph agent --> Gemini / Ollama
                              `--> tools --> PostgreSQL + pgvector
```

Controllers handle transport, the agent service owns orchestration and memory, and injected tools isolate retrieval and application actions.

## Local development

### Requirements

- Node.js 20+
- Docker with Compose
- Google AI API key

### 1. Install dependencies

```bash
npm ci
```

### 2. Configure the environment

Create `.env` in the project root:

```env
GOOGLE_API_KEY=your_google_api_key
VECTORDB_USER=postgres
VECTORDB_PASSWORD=postgres
VECTORDB_NAME=ai_backend

# Optional
PORT=3000
OLLAMA_URL=http://localhost:11434
OLLAMA_CHAT_MODEL=qwen3:30b-a3b
```

### 3. Start the database and API

```bash
docker compose up -d
npm run start:dev
```

The API runs at `http://localhost:3000` by default.

### 4. Seed the knowledge base

```bash
mkdir -p src/ai/agent/knowledge/documents
# Add .txt files to this directory
curl -X POST http://localhost:3000/ingestion/ingest
```

### 5. Stream a chat response

```bash
curl -N http://localhost:3000/ai/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"What has João built?"}'
```

The response returns an `X-Thread-Id` header. Send it as `threadId` in later requests to continue the conversation.

## API

| Method | Route               | Purpose                                        |
| ------ | ------------------- | ---------------------------------------------- |
| `POST` | `/ai/chat`          | Stream a validated agent response              |
| `POST` | `/ingestion/ingest` | Rebuild the vector index from local text files |

## Developer scripts

| Command             | Purpose                      |
| ------------------- | ---------------------------- |
| `npm run start:dev` | Run with hot reload          |
| `npm run build`     | Compile the production build |
| `npm test`          | Run unit tests               |
| `npm run test:e2e`  | Run end-to-end tests         |
| `npm run lint`      | Lint and format source files |

## Roadmap

### Product

- [ ] Add secure TXT, Markdown, and PDF uploads with validation, metadata, deduplication, deletion, and re-indexing
- [ ] Model workflows as explicit LangGraph nodes with conditional routing and specialist-agent delegation
- [ ] Create a versioned prompt registry with personalities selectable per conversation
- [ ] Add a modular Gmail service with OAuth, thread sync, search, summaries, drafts, replies, labels, and approval-gated sending

### Engineering

- [ ] Persist LangGraph checkpoints in PostgreSQL instead of process memory
- [ ] Move ingestion to background jobs with progress, retries, and idempotency
- [ ] Add authentication, rate limiting, and per-user thread/document isolation
- [ ] Return RAG citations and add retrieval-quality evaluations
- [ ] Consolidate database and environment configuration; replace schema sync with migrations
- [ ] Add structured logging, safe error filters, health checks, OpenAPI docs, and CI coverage
