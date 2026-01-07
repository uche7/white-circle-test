# Chat Application with Streaming & PII Redaction

A Next.js chat application with server-side LLM streaming, chat persistence, and asynchronous PII redaction.

## Features

- **Streaming Chat**: Real-time token-by-token streaming from LLM
- **Chat Persistence**: SQLite database with Prisma for conversation history
- **PII Redaction**: Asynchronous detection and masking of PII (emails, phones, names)
- **Spoiler Text**: Click-to-reveal blurred PII spans
- **Conversation Management**: Create, switch, and load conversations

## Architecture

See `ARCHITECTURE.md` for detailed architecture documentation.

### Key Components

- **API Routes**:
  - `/api/chat` - Streaming LLM responses
  - `/api/pii` - Async PII detection
  - `/api/conversations` - Conversation CRUD

- **Components**:
  - `SpoilerText` - Blurred PII spans with click-to-reveal
  - `MessageBubble` - Message display with PII masking
  - `ChatSidebar` - Conversation list
  - `ChatInput` - Message input with streaming support

- **Hooks**:
  - `useChatStream` - Handles streaming responses

## Setup

1. Install dependencies:
```bash
npm install
```

2. Set up the database:
```bash
npx prisma migrate dev
```

3. Run the development server:
```bash
npm run dev
```

## Database

Uses SQLite with Prisma. Schema includes:
- `Conversation` - Chat conversations
- `Message` - Individual messages with PII metadata

## PII Detection

Currently uses regex-based detection for:
- Email addresses
- Phone numbers
- Names (simplified)

Can be swapped for LLM-based detection or external microservice.

## Future Improvements

- Real LLM integration (OpenAI, Anthropic, etc.)
- WebSocket for real-time updates
- Redis caching
- Rate limiting
- Authentication
- Message search
- More sophisticated PII detection
