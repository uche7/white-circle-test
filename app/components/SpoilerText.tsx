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

  return (
    <span
      className={`inline-block cursor-pointer select-none transition-all duration-200 ${
        isRevealed
          ? "blur-0 bg-transparent text-white"
          : "blur-md bg-black/80 text-black rounded px-1.5 py-0.5"
      }`}
      onClick={(e) => {
        e.stopPropagation();
        setIsRevealed(!isRevealed);
      }}
      title={`${type} - Click to ${isRevealed ? "hide" : "reveal"}`}
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
  if (spans.length === 0) return [text];

  const segments: (string | React.JSX.Element)[] = [];
  let lastIndex = 0;

  // Sort spans by start position
  const sortedSpans = [...spans].sort((a, b) => a.start - b.start);

  sortedSpans.forEach((span, index) => {
    // Add text before PII span
    if (span.start > lastIndex) {
      segments.push(text.slice(lastIndex, span.start));
    }

    // Add PII span as SpoilerText
    const piiText = text.slice(span.start, span.end);
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
    segments.push(text.slice(lastIndex));
  }

  return segments;
}
