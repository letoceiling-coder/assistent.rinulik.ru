# ASSISTENT — architecture and delivery record

2026-09-24: empty local workspace. Audited root@93.189.229.117 read-only. Ubuntu, Docker, existing shared nginx on 80/443, host nginx on 8080. 3.1 GiB available memory, 51 GiB free disk. DNS resolves to the requested server. Existing nginx configuration validates (pre-existing deprecation warnings). Other projects must remain untouched.

Laravel 12 / PHP 8.3, React + TypeScript via Vite, same-origin session-authenticated JSON API, PostgreSQL 16 + pgvector, Redis queues. REST instead of Inertia keeps webhooks and frontend independent. Domain services own AI, retrieval, ledger, document processing and channel transport. Tenant ownership is enforced before every object operation. Money uses integer kopecks and decimal USD strings.

Deployment: isolated Compose project `assistent`, private PostgreSQL and Redis, PHP FPM + dedicated nginx, workers and scheduler. No production demo seed. Admin bootstraps only when ADMIN_INITIAL_PASSWORD is supplied. Encrypted database settings never serialize credentials to clients.

The incoming event is persisted before dispatch. A scheduler recovers pending events. Conversation locks serialize responses. Provider delivery cannot be claimed exactly-once: a network timeout after provider acceptance is ambiguous and must be reconciled, not blindly retried. Ledger deduplication is enforced by database unique keys.

RAG stores independently embedded chunks with source metadata. Retrieval is tenant- and attachment-scoped, model-version-scoped and thresholded. Retrieved text is untrusted data. Grounding validation fails closed. Embedding model changes require reindexing. Unknown information produces an explicit clarification/handoff response.

External acceptance is pending owner credentials: OpenRouter, Selectel, Telegram, MAX, Avito and initial administrator password. No mock provider response qualifies as production E2E acceptance.
