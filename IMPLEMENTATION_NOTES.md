# Implementation Notes

## Completed Features

### 1. Streaming Chat ✅
- **API Route**: `app/api/chat/route.ts`
- **Streaming**: Uses ReadableStream with Server-Sent Events format
- **Client Hook**: `app/hooks/useChatStream.ts` handles stream consumption
- **Real-time Updates**: Messages update incrementally as tokens arrive

**Tradeoffs**:
- Currently uses mock LLM (see `app/lib/llm.ts`)
- Replace `streamLLMResponse` with actual OpenAI/Anthropic API call
- No error recovery for dropped connections

### 2. Chat Persistence ✅
- **Database**: SQLite with Prisma
- **Schema**: `Conversation` and `Message` models
- **API Routes**:
  - `GET /api/conversations` - List all
  - `POST /api/conversations` - Create new
  - `GET /api/conversations/[id]` - Get with messages
- **Features**: Auto-create conversations, update titles, load history

**Tradeoffs**:
- SQLite for simplicity (easy to migrate to PostgreSQL)
- No pagination (loads all messages)
- No message search

### 3. PII Redaction ✅
- **Detection**: Regex-based in `app/lib/pii-detector.ts`
- **Types**: Email, phone, name
- **API Route**: `app/api/pii/route.ts` for async detection
- **UI Component**: `app/components/SpoilerText.tsx` with blur effect
- **Integration**: `applyPIISpans` function masks PII in messages

**Tradeoffs**:
- Regex is fast but less accurate than LLM-based detection
- Name detection is simplified (no NER)
- Can swap detector function for microservice call

**Future Improvements**:
- LLM-based PII detection
- More PII types (SSN, credit cards, addresses)
- Configurable blur styles per type
- Batch detection for better performance

### 4. UI Components ✅
- **SpoilerText**: Click-to-reveal blurred spans
- **MessageBubble**: Renders messages with PII masking
- **ChatSidebar**: Conversation list with selection
- **ChatInput**: Input with streaming state management

## Architecture Decisions

### Server-Side Only LLM
- All LLM calls happen server-side
- Client only handles UI and streaming consumption
- Prevents API key exposure

### Async PII Detection
- Runs in parallel with streaming
- Doesn't block chat response
- Updates UI retroactively when detected

### ReadableStream
- Native browser API
- No need for WebSocket complexity
- Works with Next.js App Router

## File Structure

```
app/
├── api/
│   ├── chat/route.ts              # Streaming endpoint
│   ├── pii/route.ts               # PII detection
│   └── conversations/              # CRUD operations
├── components/
│   ├── SpoilerText.tsx            # PII blur component
│   ├── MessageBubble.tsx          # Message with masking
│   ├── ChatSidebar.tsx            # Conversation list
│   └── ...
├── hooks/
│   └── useChatStream.ts           # Streaming logic
├── lib/
│   ├── db.ts                      # Prisma client
│   ├── llm.ts                     # LLM streaming (mock)
│   └── pii-detector.ts            # PII detection
└── types/                         # TypeScript interfaces

prisma/
└── schema.prisma                  # Database schema
```

## Next Steps

1. **Replace Mock LLM**:
   ```typescript
   // In app/lib/llm.ts
   import OpenAI from 'openai';
   const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
   ```

2. **Add Environment Variables**:
   ```env
   DATABASE_URL="file:./dev.db"
   OPENAI_API_KEY="your-key-here"
   ```

3. **Improve PII Detection**:
   - Use NER model for names
   - Add more patterns
   - Consider external service

4. **Add Error Handling**:
   - Retry logic for failed streams
   - Error boundaries
   - User-friendly error messages

5. **Performance**:
   - Message pagination
   - Virtual scrolling for long conversations
   - Optimistic updates

## Testing

To test PII detection, try messages like:
- "My email is john@example.com"
- "Call me at 555-123-4567"
- "My name is John Doe"

The detected PII will appear blurred and clickable.

