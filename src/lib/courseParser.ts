import type { ContentBlock } from './types';
import { parseInlineContent } from './parser';

export type CalloutType = 'NOTE' | 'TIP' | 'WARNING' | 'IMPORTANT';

const CALLOUT_HEADER_RE = /^>\s*\[!(NOTE|TIP|WARNING|IMPORTANT)\](?:\s+(.*))?$/i;

/**
 * Parses course/curriculum markdown into ContentBlock[] AST.
 * Handles GitHub-style pedagogical callouts (> [!NOTE], > [!TIP], etc.)
 * alongside standard inline KaTeX math ($...$, $$...$$), charts ([CHART]...[/CHART]),
 * diagrams ([DIAGRAM]...[/DIAGRAM]), images, and code blocks via parseInlineContent.
 */
export function parseCourseMarkdown(markdown: string): ContentBlock[] {
  if (!markdown || !markdown.trim()) return [];

  const lines = markdown.split(/\r?\n/);
  const blocks: ContentBlock[] = [];
  let rawBuffer: string[] = [];
  let inCallout = false;
  let currentCalloutType: CalloutType = 'NOTE';
  let currentCalloutTitle: string | undefined = undefined;
  let calloutBuffer: string[] = [];
  let inCodeFence = false;

  function flushRawBuffer() {
    if (rawBuffer.length === 0) return;
    const text = rawBuffer.join('\n');
    rawBuffer = [];
    const parsed = parseInlineContent(text);
    blocks.push(...parsed);
  }

  function flushCalloutBuffer() {
    if (!inCallout) return;
    const contentText = calloutBuffer.join('\n').trim();
    blocks.push({
      type: 'callout',
      content: contentText,
      calloutType: currentCalloutType,
      calloutTitle: currentCalloutTitle || undefined,
    });
    inCallout = false;
    currentCalloutTitle = undefined;
    calloutBuffer = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Check code fence to avoid interpreting callouts inside code blocks
    if (line.trim().startsWith('```')) {
      inCodeFence = !inCodeFence;
      if (inCallout) {
        calloutBuffer.push(line.replace(/^>\s?/, ''));
        continue;
      }
      rawBuffer.push(line);
      continue;
    }

    if (inCodeFence) {
      if (inCallout) {
        calloutBuffer.push(line.replace(/^>\s?/, ''));
      } else {
        rawBuffer.push(line);
      }
      continue;
    }

    // Callout detection
    const calloutMatch = line.match(CALLOUT_HEADER_RE);
    if (calloutMatch) {
      flushRawBuffer();
      if (inCallout) flushCalloutBuffer();

      inCallout = true;
      currentCalloutType = calloutMatch[1].toUpperCase() as CalloutType;
      currentCalloutTitle = calloutMatch[2]?.trim() || undefined;
      continue;
    }

    if (inCallout) {
      if (line.startsWith('>')) {
        // Line belongs to current callout body
        calloutBuffer.push(line.replace(/^>\s?/, ''));
      } else if (line.trim() === '') {
        // Lookahead: check if next non-empty line continues callout
        let nextLineContinues = false;
        for (let j = i + 1; j < lines.length; j++) {
          const ahead = lines[j];
          if (ahead.trim() === '') continue;
          if (ahead.startsWith('>')) {
            nextLineContinues = true;
          }
          break;
        }
        if (nextLineContinues) {
          calloutBuffer.push('');
        } else {
          flushCalloutBuffer();
          rawBuffer.push(line);
        }
      } else {
        // Callout ended
        flushCalloutBuffer();
        rawBuffer.push(line);
      }
      continue;
    }

    rawBuffer.push(line);
  }

  if (inCallout) flushCalloutBuffer();
  flushRawBuffer();

  return blocks;
}

/**
 * Calculates estimated reading duration in minutes based on ~200 words/minute.
 * Minimum is 1 minute for non-empty content.
 */
export function extractReadingTimeMinutes(markdown: string): number {
  if (!markdown || !markdown.trim()) return 0;
  // Clean markup / tags to accurately count words
  const cleanText = markdown
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/\[\/?(?:CHART|DIAGRAM)[^\]]*\]/gi, ' ')
    .replace(/!\[.*?\]\(.*?\)/g, ' ')
    .replace(/[#*`_~>\[\]()$-]/g, ' ')
    .trim();

  const words = cleanText.split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  if (wordCount === 0) return 0;

  return Math.max(1, Math.ceil(wordCount / 200));
}

/**
 * Formats a pedagogical callout block into Markdown following standard format.
 * Adheres to STRICT_ZERO_EMOJI_DOCTRINE (clean textual markers without emoji).
 */
export function formatCourseCallout(type: string, title: string, text: string): string {
  const normType = type.toUpperCase().trim() as CalloutType;
  const validTypes: CalloutType[] = ['NOTE', 'TIP', 'WARNING', 'IMPORTANT'];
  const resolvedType = validTypes.includes(normType) ? normType : 'NOTE';

  const header = title && title.trim()
    ? `> [!${resolvedType}] ${title.trim()}`
    : `> [!${resolvedType}]`;

  const bodyLines = text
    .split(/\r?\n/)
    .map(line => `> ${line}`)
    .join('\n');

  return `${header}\n${bodyLines}`;
}
