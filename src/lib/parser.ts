import type { ContentBlock, Option, Question, ChartType } from './types';

/**
 * Smart-Parser: Transforms a single Markdown string into a Question[] array.
 *
 * Supported syntax:
 * - `# Q1 (PILGAN)` / `# Q2 (ESSAY)` — question delimiters
 * - `[[A]] Option text`                — MCQ options
 * - `ANSWER: A` / `ANSWER: ESSAY`      — correct answer
 * - `DISCUSSION: ...`                  — post-exam discussion
 * - `$...$` / `$$...$$`               — inline/block math (KaTeX)
 * - `[CHART:BAR] {...} [/CHART]`       — Recharts blocks
 * - `![alt](url)`                      — images
 */

const QUESTION_HEADER_RE = /^#\s*Q(\d+)\s*\((PILGAN|ESSAY)\)\s*$/i;
const OPTION_RE = /^\[\[([A-E])\]\]\s*(.*)/;
const ANSWER_RE = /^(?:Jawaban:\s*)?ANSWER:\s*(.+)$/i;
const DISCUSSION_RE = /^(?:Pembahasan:\s*)?DISCUSSION:\s*([\s\S]*)$/i;

/* ── Inline content parsers ── */

const CHART_START_RE = /\[CHART:(BAR|LINE|PIE)\]/gi;
const DIAGRAM_START_RE = /\[DIAGRAM\]/gi;
const CODE_BLOCK_RE = /```(\w*)\s*([\s\S]*?)```/g;
const MATH_BLOCK_RE = /\$\$([\s\S]*?)\$\$/g;
const MATH_INLINE_RE = /\$((?!\$)[\s\S]*?)\$/g;
const IMAGE_RE = /!\[([^\]]*)\]\(([^)]+)\)/g;

function parseInlineContent(raw: string): ContentBlock[] {
  if (!raw.trim()) return [];
  const blocks: ContentBlock[] = [];
  let remaining = raw;

  // 0. Extract diagram blocks [DIAGRAM] {...} [/DIAGRAM]
  let match;
  let newRemaining = '';
  let lastIndex = 0;

  while ((match = DIAGRAM_START_RE.exec(remaining)) !== null) {
    newRemaining += remaining.slice(lastIndex, match.index);
    let start = remaining.indexOf('{', DIAGRAM_START_RE.lastIndex);
    if (start !== -1 && start - DIAGRAM_START_RE.lastIndex <= 20) {
      let depth = 0, inString = false, escape = false, endIndex = -1;
      for (let i = start; i < remaining.length; i++) {
        const char = remaining[i];
        if (escape) { escape = false; continue; }
        if (char === '\\') { escape = true; continue; }
        if (char === '"') { inString = !inString; continue; }
        if (!inString) {
          if (char === '{') depth++;
          else if (char === '}') depth--;
          if (depth === 0) { endIndex = i + 1; break; }
        }
      }
      if (endIndex !== -1) {
        const jsonStr = remaining.slice(start, endIndex);
        let endOfDiagram = endIndex;
        const afterJson = remaining.slice(endIndex);
        const closingMatch = afterJson.match(/^\s*\[\/DIAGRAM\]/i);
        if (closingMatch) endOfDiagram += closingMatch[0].length;
        try {
          const parsed = JSON.parse(jsonStr);
          blocks.push({
            type: 'diagram',
            content: jsonStr,
            diagramType: parsed.type ?? 'functionPlot',
            diagramConfig: parsed,
          });
        } catch {
          blocks.push({ type: 'text', content: `Konfigurasi diagram tidak valid: ${jsonStr.slice(0, 60)}` });
        }
        newRemaining += '\u0000DIAGRAM\u0000';
        lastIndex = endOfDiagram;
        DIAGRAM_START_RE.lastIndex = lastIndex;
        continue;
      }
    }
    newRemaining += match[0];
    lastIndex = DIAGRAM_START_RE.lastIndex;
  }
  newRemaining += remaining.slice(lastIndex);
  remaining = newRemaining;

  // 1. Extract chart blocks
  // Handle both with and without [/CHART] by matching balanced JSON braces
  newRemaining = '';
  lastIndex = 0;

  while ((match = CHART_START_RE.exec(remaining)) !== null) {
    newRemaining += remaining.slice(lastIndex, match.index);
    const type = match[1];
    
    let start = remaining.indexOf('{', CHART_START_RE.lastIndex);
    // Ignore if { is too far (e.g.,>20 chars of whitespace)
    if (start !== -1 && start - CHART_START_RE.lastIndex <= 20) {
      let depth = 0;
      let inString = false;
      let escape = false;
      let endIndex = -1;
      
      for (let i = start; i < remaining.length; i++) {
        const char = remaining[i];
        if (escape) { escape = false; continue; }
        if (char === '\\') { escape = true; continue; }
        if (char === '"') { inString = !inString; continue; }
        if (!inString) {
          if (char === '{') depth++;
          else if (char === '}') depth--;
          
          if (depth === 0) {
            endIndex = i + 1;
            break;
          }
        }
      }
      
      if (endIndex !== -1) {
        const jsonStr = remaining.slice(start, endIndex);
        
        let endOfChart = endIndex;
        const afterJson = remaining.slice(endIndex);
        const closingMatch = afterJson.match(/^\s*\[\/CHART\]/i);
        if (closingMatch) {
          endOfChart += closingMatch[0].length;
        }

        const chartType = type.toUpperCase() as ChartType;
        try {
          const parsed = JSON.parse(jsonStr);
          let datasets = parsed.datasets;
          
          if (!datasets) {
            // Find the best candidate for data if not in datasets format
            const keys = Object.keys(parsed);
            const arrayKey = keys.find(k => k !== 'labels' && Array.isArray(parsed[k])) || 'data';
            datasets = [{ 
              label: parsed.label || parsed.datasetLabel || (arrayKey !== 'data' ? arrayKey : undefined),
              data: parsed[arrayKey] ?? parsed.data ?? [] 
            }];
          }

          blocks.push({
            type: 'chart',
            content: jsonStr,
            chartType,
            chartData: {
              labels: parsed.labels ?? [],
              datasets: datasets,
            },
          });
        } catch {
          blocks.push({ type: 'text', content: `Data grafik tidak valid: ${jsonStr.slice(0, 60)}` });
        }
        
        newRemaining += '\u0000CHART\u0000';
        lastIndex = endOfChart;
        CHART_START_RE.lastIndex = lastIndex; // Update RegEx cursor
        continue;
      }
    }
    
    // Fallback if no valid JSON brace pair found
    newRemaining += match[0];
    lastIndex = CHART_START_RE.lastIndex;
  }
  newRemaining += remaining.slice(lastIndex);
  remaining = newRemaining;

  // 2. Extract block math $$...$$
  remaining = remaining.replace(MATH_BLOCK_RE, (_match, tex: string) => {
    blocks.push({ type: 'math-block', content: tex.trim() });
    return '\u0000MATH\u0000';
  });

  // 3. Extract code blocks ```...```
  remaining = remaining.replace(CODE_BLOCK_RE, (_match, lang: string, code: string) => {
    blocks.push({ type: 'code-block', content: code.trim(), language: lang.trim() });
    return '\u0000CODE\u0000';
  });

  // 4. Split on placeholders and process remaining text segments
  const segments = remaining.split('\u0000');
  const finalBlocks: ContentBlock[] = [];
  let blockIdx = 0;

  for (const seg of segments) {
    if (seg === 'CHART' || seg === 'MATH' || seg === 'CODE' || seg === 'DIAGRAM') {
      finalBlocks.push(blocks[blockIdx++]);
      continue;
    }
    if (!seg.trim()) continue;
    // Parse inline math and images within text segments
    finalBlocks.push(...parseTextSegment(seg));
  }

  return finalBlocks;
}

function parseTextSegment(text: string): ContentBlock[] {
  const result: ContentBlock[] = [];
  // Unified regex to capture inline math or images in order of appearance
  const INLINE_RE = /\$((?!\$)[\s\S]*?)\$|!\[([^\]]*)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = INLINE_RE.exec(text)) !== null) {
    // Push preceding plain text
    if (match.index > lastIndex) {
      const preceding = text.slice(lastIndex, match.index);
      if (preceding) result.push({ type: 'text', content: preceding });
    }
    if (match[1] !== undefined) {
      // Inline math
      result.push({ type: 'math-inline', content: match[1].trim() });
    } else if (match[3] !== undefined) {
      // Image
      result.push({ type: 'image', content: match[3] });
    }
    lastIndex = match.index + match[0].length;
  }

  // Trailing text
  if (lastIndex < text.length) {
    const trailing = text.slice(lastIndex);
    if (trailing) result.push({ type: 'text', content: trailing });
  }

  return result;
}

/* ── Main parser ── */

export function parseMarkdown(markdown: string): Question[] {
  if (!markdown || !markdown.trim()) return [];

  const lines = markdown.split(/\r?\n/);
  const questions: Question[] = [];
  let current: {
    id: number;
    type: 'MCQ' | 'ESSAY';
    bodyLines: string[];
    options: { key: string; textLines: string[] }[];
    answerRaw: string;
    discussionLines: string[];
  } | null = null;
  let section: 'body' | 'options' | 'discussion' = 'body';

  function flushQuestion() {
    if (!current) return;
    const bodyText = current.bodyLines
      .filter(line => !line.trim().toLowerCase().match(/^opsi\s*(?:\(.*\))?\s*:$/))
      .join('\n').trim();
    const options: Option[] = current.options.map((o) => ({
      key: o.key,
      body: parseInlineContent(o.textLines.join('\n')),
    }));
    const discussionText = current.discussionLines.join('\n').trim();

    questions.push({
      id: current.id,
      type: current.type,
      body: parseInlineContent(bodyText),
      options: current.type === 'MCQ' ? options : undefined,
      correctAnswer: current.answerRaw || undefined,
      discussion: discussionText ? parseInlineContent(discussionText) : undefined,
    });
    current = null;
  }

  for (const line of lines) {
    // Check for question header
    const headerMatch = line.match(QUESTION_HEADER_RE);
    if (headerMatch) {
      flushQuestion();
      current = {
        id: parseInt(headerMatch[1], 10),
        type: headerMatch[2].toUpperCase() === 'PILGAN' ? 'MCQ' : 'ESSAY',
        bodyLines: [],
        options: [],
        answerRaw: '',
        discussionLines: [],
      };
      section = 'body';
      continue;
    }

    if (!current) continue;

    // Check for ANSWER line
    const answerMatch = line.match(ANSWER_RE);
    if (answerMatch) {
      current.answerRaw = answerMatch[1].trim();
      continue;
    }

    // Check for DISCUSSION line (can be multi-line, collects until next header)
    const discussionMatch = line.match(DISCUSSION_RE);
    if (discussionMatch) {
      section = 'discussion';
      const initialContent = discussionMatch[1].trim();
      if (initialContent) current.discussionLines.push(initialContent);
      continue;
    }

    if (section === 'discussion') {
      current.discussionLines.push(line);
      continue;
    }

    // Check for option line [[A]]
    const optionMatch = line.match(OPTION_RE);
    if (optionMatch && current.type === 'MCQ') {
      section = 'options';
      current.options.push({ key: optionMatch[1], textLines: [optionMatch[2]] });
      continue;
    }

    // If we're in options section and line doesn't start a new option, append to last option
    if (section === 'options' && current.options.length > 0 && !optionMatch) {
      current.options[current.options.length - 1].textLines.push(line);
      continue;
    }

    // Default: append to body
    current.bodyLines.push(line);
  }

  flushQuestion();
  return questions;
}
