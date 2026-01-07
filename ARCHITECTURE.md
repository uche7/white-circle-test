# Chat Application Architecture

## Overview
Server-side streaming chat with async PII redaction and chat persistence.

## File Structure
```
app/
├── api/
│   ├── chat/
│   │   └── route.ts          # Streaming LLM endpoint
│   └── pii/
│       └── route.ts           # Async PII detection endpoint
├── components/
│   ├── ChatSidebar.tsx
│   ├── ChatItem.tsx
│   ├── MessageList.tsx
│   ├── MessageBubble.tsx
│   ├── ChatInput.tsx
│   └── SpoilerText.tsx        # Blurred PII spans
├── lib/
│   ├── db.ts                  # Prisma client
│   ├── llm.ts                 # LLM streaming logic
│   └── pii-detector.ts        # PII detection (regex/LLM)
├── types/
│   └── ...
└── page.tsx                   # Main chat page

prisma/
└── schema.prisma
```

## Data Flow

1. **User sends message** → POST to `/api/chat`
2. **Server starts streaming** → LLM response streams via ReadableStream
3. **Parallel PII scan** → POST to `/api/pii` (async, non-blocking)
4. **Client renders tokens** → Incremental updates as stream arrives
5. **PII masking** → When PII detected, retroactively mask spans
6. **Persistence** → Save conversation and messages to SQLite

## Tradeoffs

- **PII Detection**: Regex-based for speed (can swap to LLM/microservice later)
- **Streaming**: Server-Sent Events or ReadableStream (using ReadableStream for simplicity)
- **Database**: SQLite for simplicity, easy to migrate to PostgreSQL
- **State Management**: React state for now, could add Zustand/Redux if needed

## Future Improvements

- WebSocket for real-time updates
- Redis for caching conversations
- Separate PII microservice
- Rate limiting
- Authentication
- Message search

