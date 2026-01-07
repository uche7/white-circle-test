// PII Detection Module
// Currently uses regex patterns - can be swapped for LLM or microservice

export interface PIISpan {
  start: number;
  end: number;
  type: "email" | "phone" | "name" | "ssn" | "credit_card";
}

/**
 * Detects PII in text using regex patterns
 * Returns array of spans with start/end positions and type
 * 
 * Tradeoff: Regex is fast but less accurate than LLM-based detection
 * Future: Can swap this function to call an LLM or external microservice
 */
export function detectPII(text: string): PIISpan[] {
  const spans: PIISpan[] = [];

  // Email pattern
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
  let match;
  while ((match = emailRegex.exec(text)) !== null) {
    spans.push({
      start: match.index,
      end: match.index + match[0].length,
      type: "email",
    });
  }

  // Phone number patterns (US format)
  const phoneRegex = /\b(\+?1[-.\s]?)?\(?([0-9]{3})\)?[-.\s]?([0-9]{3})[-.\s]?([0-9]{4})\b/g;
  while ((match = phoneRegex.exec(text)) !== null) {
    spans.push({
      start: match.index,
      end: match.index + match[0].length,
      type: "phone",
    });
  }

  // Name patterns (simple - matches capitalized words that look like names)
  // This is a simplified version - real implementation would use NER
  const nameRegex = /\b([A-Z][a-z]+)\s+([A-Z][a-z]+)\b/g;
  while ((match = nameRegex.exec(text)) !== null) {
    // Filter out common false positives
    const commonWords = ["The", "This", "That", "There", "They", "Then"];
    if (!commonWords.includes(match[1])) {
      spans.push({
        start: match.index,
        end: match.index + match[0].length,
        type: "name",
      });
    }
  }

  // Remove overlapping spans (keep the first one)
  return spans.sort((a, b) => a.start - b.start).filter((span, index, arr) => {
    if (index === 0) return true;
    const prev = arr[index - 1];
    return span.start >= prev.end;
  });
}

/**
 * Async version for non-blocking PII detection
 * Can be called in parallel with streaming
 */
export async function detectPIIAsync(text: string): Promise<PIISpan[]> {
  // Simulate async processing (in real app, this might call an external service)
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(detectPII(text));
    }, 100); // Small delay to simulate async processing
  });
}

