"use client";

import React, { useState } from "react";

interface SpoilerTextProps {
  text: string;
  start: number;
  end: number;
  type: string;
}

/**
 * SpoilerText Component
 * 
 * Displays PII text with iMessage-style spoiler effect
 * - Blurred by default with dark background
 * - Click to reveal, click again to hide
 * - Smooth transitions
 */
export default function SpoilerText({
  text,
  start,
  end,
  type,
}: SpoilerTextProps) {
  const [isRevealed, setIsRevealed] = useState(false);

  console.log("SpoilerText rendering:", { text, isRevealed, type });

  if (isRevealed) {
    return (
      <span
        className="inline-block cursor-pointer text-white"
        onClick={(e) => {
          e.stopPropagation();
          setIsRevealed(false);
        }}
        title="Click to hide"
      >
        {text}
      </span>
    );
  }

  return (
    <span
      className="inline-block cursor-pointer select-none rounded px-1.5 py-0.5 font-mono"
      style={{ 
        filter: 'blur(12px)',
        WebkitFilter: 'blur(12px)',
        backgroundColor: 'rgba(128, 128, 128, 0.3)',
        color: 'rgba(255, 255, 255, 0.2)',
        textShadow: '0 0 8px rgba(200, 200, 200, 0.6), 0 0 12px rgba(150, 150, 150, 0.4)',
        boxShadow: '0 0 10px rgba(200, 200, 200, 0.3), inset 0 0 10px rgba(150, 150, 150, 0.2)',
        userSelect: 'none',
        display: 'inline-block',
        padding: '2px 6px',
        borderRadius: '4px',
        border: '1px solid rgba(200, 200, 200, 0.2)'
      }}
      onClick={(e) => {
        e.stopPropagation();
        setIsRevealed(true);
      }}
      title={`${type} - Click to reveal`}
    >
      {text}
    </span>
  );
}

/**
 * applyPIISpans
 *
 * Takes text and PII spans, returns array of text segments
 * with SpoilerText components for PII sections
 */
export function applyPIISpans(
  text: string,
  spans: Array<{ start: number; end: number; type: string }>
): (string | React.JSX.Element)[] {
  console.log("applyPIISpans called with:", { textLength: text.length, spansCount: spans.length, spans });
  
  if (spans.length === 0) {
    console.log("applyPIISpans - No spans, returning text as-is");
    return [text];
  }

  const segments: (string | React.JSX.Element)[] = [];
  let lastIndex = 0;

  // Sort spans by start position
  const sortedSpans = [...spans].sort((a, b) => a.start - b.start);
  console.log("applyPIISpans - Sorted spans:", sortedSpans);

  sortedSpans.forEach((span, index) => {
    // Add text before PII span
    if (span.start > lastIndex) {
      const beforeText = text.slice(lastIndex, span.start);
      segments.push(beforeText);
      console.log(`applyPIISpans - Added text before span ${index}:`, beforeText);
    }

    // Add PII span as SpoilerText
    const piiText = text.slice(span.start, span.end);
    console.log(`applyPIISpans - Creating SpoilerText for span ${index}:`, { piiText, start: span.start, end: span.end });
    segments.push(
      <SpoilerText
        key={`pii-${span.start}-${span.end}-${index}`}
        text={piiText}
        start={span.start}
        end={span.end}
        type={span.type}
      />
    );

    lastIndex = span.end;
  });

  // Add remaining text
  if (lastIndex < text.length) {
    const remainingText = text.slice(lastIndex);
    segments.push(remainingText);
    console.log("applyPIISpans - Added remaining text:", remainingText);
  }

  console.log("applyPIISpans - Returning segments:", segments.length, "segments");
  return segments;
}
