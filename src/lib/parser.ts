import type { ContentBlock, Option, Question, ChartType } from './types';
import { z } from 'zod';
import { parseLeanChartDSL, parseLeanDiagramDSL } from './leanDslParser';
import { scanMathDelimiters } from './mathLexer';

const DiagramConfigSchema = z.record(z.string(), z.unknown());
const ChartConfigSchema = z.record(z.string(), z.unknown());

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
const TIPS_THEORY_RE = /^TIPS?_(?:THEORY|TEORI):\s*([\s\S]*)$/i;
const TIPS_PRACTICE_RE = /^TIPS?_(?:PRACTICE|PRAKTIK):\s*([\s\S]*)$/i;
const LABELS_RE = /^LABELS:\s*(.+)$/i;
const STIMULUS_START_RE = /^(?:#\s*)?STIMULUS(?::\s*(.+))?$/i;
const STIMULUS_END_RE = /^(?:#\s*)?(?:END_STIMULUS|ENDSTIMULUS)$/i;
const CLEAR_STIMULUS_RE = /^(?:#\s*)?CLEAR_STIMULUS$/i;

/* ── Inline content parsers ── */

const CHART_START_RE = /\[CHART:(BAR|LINE|PIE)\]/gi;
const DIAGRAM_START_RE = /\[DIAGRAM(?::([a-zA-Z0-9_-]+))?\]/gi;
const CODE_BLOCK_RE = /```(\w*)\s*([\s\S]*?)```/g;

export function parseInlineContent(raw: string): ContentBlock[] {
  if (!raw.trim()) return [];
  const blocks: ContentBlock[] = [];
  let remaining = raw;

  // 0. Extract diagram blocks [DIAGRAM] / [DIAGRAM:type] ... [/DIAGRAM]
  let match;
  let newRemaining = '';
  let lastIndex = 0;

  while ((match = DIAGRAM_START_RE.exec(remaining)) !== null) {
    newRemaining += remaining.slice(lastIndex, match.index);
    const diagramTagType = match[1];
    const afterTag = remaining.slice(DIAGRAM_START_RE.lastIndex);
    const trimmedAfter = afterTag.trimStart();

    if (trimmedAfter.startsWith('{')) {
      // Legacy JSON diagram block
      const start = remaining.indexOf('{', DIAGRAM_START_RE.lastIndex);
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
            const rawParsed = JSON.parse(jsonStr);
            const validated = DiagramConfigSchema.safeParse(rawParsed);
            if (validated.success) {
              const parsed = validated.data as Record<string, unknown>;
              const resolvedDiagramType: 'functionPlot' | 'geometry' | '3d' =
                parsed.type === 'geometry' || parsed.type === '3d' || parsed.type === 'functionPlot'
                  ? parsed.type
                  : diagramTagType === 'geometry' || diagramTagType === '3d'
                  ? diagramTagType
                  : 'functionPlot';
              blocks.push({
                type: 'diagram',
                content: jsonStr,
                diagramType: resolvedDiagramType,
                diagramConfig: parsed,
              });
            } else {
              blocks.push({ type: 'text', content: `Skema diagram tidak valid: ${validated.error.message.slice(0, 60)}` });
            }
          } catch {
            blocks.push({ type: 'text', content: `Konfigurasi diagram bukan JSON valid: ${jsonStr.slice(0, 60)}` });
          }
          newRemaining += '\u0000DIAGRAM\u0000';
          lastIndex = endOfDiagram;
          DIAGRAM_START_RE.lastIndex = lastIndex;
          continue;
        }
      }
    } else {
      // Lean DSL diagram block
      const closeMatch = afterTag.match(/\[\/DIAGRAM\]/i);
      if (closeMatch && closeMatch.index !== undefined) {
        const dslContent = afterTag.slice(0, closeMatch.index).trim();
        const endOfDiagram = DIAGRAM_START_RE.lastIndex + closeMatch.index + closeMatch[0].length;
        const parsed = parseLeanDiagramDSL(dslContent, diagramTagType);
        blocks.push({
          type: 'diagram',
          content: dslContent,
          diagramType: parsed.type === '3d' ? '3d' : 'geometry',
          diagramConfig: parsed,
        });
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

  // 1. Extract chart blocks [CHART:BAR|LINE|PIE] ... [/CHART]
  newRemaining = '';
  lastIndex = 0;

  while ((match = CHART_START_RE.exec(remaining)) !== null) {
    newRemaining += remaining.slice(lastIndex, match.index);
    const type = match[1];
    const chartType = type.toUpperCase() as ChartType;
    const afterTag = remaining.slice(CHART_START_RE.lastIndex);
    const trimmedAfter = afterTag.trimStart();

    if (trimmedAfter.startsWith('{')) {
      // Legacy JSON chart block
      const start = remaining.indexOf('{', CHART_START_RE.lastIndex);
      if (start !== -1 && start - CHART_START_RE.lastIndex <= 20) {
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
          let endOfChart = endIndex;
          const afterJson = remaining.slice(endIndex);
          const closingMatch = afterJson.match(/^\s*\[\/CHART\]/i);
          if (closingMatch) endOfChart += closingMatch[0].length;

          try {
            const rawParsed = JSON.parse(jsonStr);
            const validated = ChartConfigSchema.safeParse(rawParsed);
            if (!validated.success) {
              blocks.push({ type: 'text', content: `Skema grafik tidak valid: ${validated.error.message.slice(0, 60)}` });
            } else {
              const parsed = validated.data as {
                labels?: string[];
                datasets?: { label?: string; data: number[] }[];
                label?: string;
                datasetLabel?: string;
                data?: number[];
                [key: string]: unknown;
              };
              let datasets = parsed.datasets;
              if (!datasets) {
                const keys = Object.keys(parsed);
                const arrayKey = keys.find(k => k !== 'labels' && Array.isArray(parsed[k])) || 'data';
                const rawArr = parsed[arrayKey];
                const dataArr = Array.isArray(rawArr) ? (rawArr as number[]) : (parsed.data ?? []);
                datasets = [{
                  label: parsed.label || parsed.datasetLabel || (arrayKey !== 'data' ? arrayKey : undefined),
                  data: dataArr,
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
            }
          } catch {
            blocks.push({ type: 'text', content: `Data grafik bukan JSON valid: ${jsonStr.slice(0, 60)}` });
          }

          newRemaining += '\u0000CHART\u0000';
          lastIndex = endOfChart;
          CHART_START_RE.lastIndex = lastIndex;
          continue;
        }
      }
    } else {
      // Lean DSL chart block
      const closeMatch = afterTag.match(/\[\/CHART\]/i);
      if (closeMatch && closeMatch.index !== undefined) {
        const dslContent = afterTag.slice(0, closeMatch.index).trim();
        const endOfChart = CHART_START_RE.lastIndex + closeMatch.index + closeMatch[0].length;
        const parsed = parseLeanChartDSL(dslContent);
        blocks.push({
          type: 'chart',
          content: dslContent,
          chartType,
          chartData: parsed,
        });
        newRemaining += '\u0000CHART\u0000';
        lastIndex = endOfChart;
        CHART_START_RE.lastIndex = lastIndex;
        continue;
      }
    }

    newRemaining += match[0];
    lastIndex = CHART_START_RE.lastIndex;
  }
  newRemaining += remaining.slice(lastIndex);
  remaining = newRemaining;

  // 2. Extract code blocks ```...``` (protects code contents from math parsing)
  remaining = remaining.replace(CODE_BLOCK_RE, (_match, lang: string, code: string) => {
    blocks.push({ type: 'code-block', content: code.trim(), language: lang.trim() });
    return '\u0000CODE\u0000';
  });

  // 3. Process remaining text segments with scanMathDelimiters & images
  const segments = remaining.split('\u0000');
  const finalBlocks: ContentBlock[] = [];
  let blockIdx = 0;

  for (const seg of segments) {
    if (seg === 'CHART' || seg === 'CODE' || seg === 'DIAGRAM') {
      finalBlocks.push(blocks[blockIdx++]);
      continue;
    }
    if (!seg.trim()) continue;
    finalBlocks.push(...parseTextSegment(seg));
  }

  return finalBlocks;
}

function parseTextSegment(text: string): ContentBlock[] {
  const result: ContentBlock[] = [];
  const mathTokens = scanMathDelimiters(text);
  const IMAGE_RE = /!\[([^\]]*)\]\(([^)]+)\)/g;

  for (const token of mathTokens) {
    if (token.type === 'math-block') {
      result.push({ type: 'math-block', content: token.content.trim() });
    } else if (token.type === 'math-inline') {
      result.push({ type: 'math-inline', content: token.content.trim() });
    } else {
      // Plain text: extract images if present
      let lastIndex = 0;
      let match: RegExpExecArray | null;
      IMAGE_RE.lastIndex = 0;

      while ((match = IMAGE_RE.exec(token.content)) !== null) {
        if (match.index > lastIndex) {
          const preceding = token.content.slice(lastIndex, match.index);
          if (preceding) result.push({ type: 'text', content: preceding });
        }
        result.push({ type: 'image', content: match[2] });
        lastIndex = match.index + match[0].length;
      }

      if (lastIndex < token.content.length) {
        const trailing = token.content.slice(lastIndex);
        if (trailing) result.push({ type: 'text', content: trailing });
      }
    }
  }

  return result;
}

/* ── Main parser ── */

export function parseMarkdown(markdown: string): Question[] {
  if (!markdown || !markdown.trim()) return [];

  const lines = markdown.split(/\r?\n/);
  const questions: Question[] = [];
  let activeStimulusId: string | undefined = undefined;
  let activeStimulusLines: string[] = [];
  let isCollectingStimulus = false;

  let current: {
    id: number;
    type: 'MCQ' | 'ESSAY';
    bodyLines: string[];
    options: { key: string; textLines: string[] }[];
    answerRaw: string;
    labelsRaw: string[];
    discussionLines: string[];
    tipsList: { type: 'THEORY' | 'PRACTICE'; lines: string[] }[];
  } | null = null;
  let section: 'body' | 'options' | 'discussion' | 'tip_theory' | 'tip_practice' | 'labels' = 'body';
  let inChartBlock = false;
  let inDiagramBlock = false;

  function flushQuestion() {
    if (!current) return;
    const bodyText = current.bodyLines
      .filter(line => !line.trim().toLowerCase().match(/^opsi\s*(?:\(.*\))?\s*:$/))
      .join('\n').trim();
    const options: Option[] = current.options.map((o) => ({
      key: o.key,
      body: parseInlineContent(o.textLines.join('\n').trim()),
    }));
    const discussionText = current.discussionLines.join('\n').trim();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const tips: any[] = current.tipsList.map(t => ({
      type: t.type,
      content: parseInlineContent(t.lines.join('\n').trim()),
    })).filter(t => t.content.length > 0);

    const extractedLabels = current.labelsRaw.join(' ').trim();
    let labelsArray: string[] | undefined = undefined;
    if (extractedLabels) {
      labelsArray = extractedLabels.split(',').map(s => s.trim()).filter(Boolean);
    }

    const stimulusContent = activeStimulusLines.join('\n').trim();

    questions.push({
      id: current.id,
      stimulus_id: stimulusContent ? (activeStimulusId || `stim-${current.id}`) : undefined,
      stimulus_content: stimulusContent || undefined,
      type: current.type,
      labels: labelsArray,
      body: parseInlineContent(bodyText),
      options: current.type === 'MCQ' ? options : undefined,
      correctAnswer: current.answerRaw || undefined,
      discussion: discussionText ? parseInlineContent(discussionText) : undefined,
      tips: tips.length > 0 ? tips : undefined,
    });
    current = null;
  }

  for (const line of lines) {
    // Check for stimulus block
    const stimulusStartMatch = line.match(STIMULUS_START_RE);
    if (stimulusStartMatch) {
      flushQuestion();
      activeStimulusLines = [];
      activeStimulusId = stimulusStartMatch[1]?.trim() || `stimulus-${questions.length + 1}`;
      isCollectingStimulus = true;
      continue;
    }

    if (isCollectingStimulus) {
      if (STIMULUS_END_RE.test(line)) {
        isCollectingStimulus = false;
        continue;
      }
      activeStimulusLines.push(line);
      continue;
    }

    if (CLEAR_STIMULUS_RE.test(line)) {
      flushQuestion();
      activeStimulusId = undefined;
      activeStimulusLines = [];
      continue;
    }

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
        labelsRaw: [],
        discussionLines: [],
        tipsList: [],
      };
      section = 'body';
      continue;
    }

    if (!current) continue;

    // Track chart and diagram block boundaries to prevent nested keywords (like labels:) from escaping
    if (/\[CHART:(?:BAR|LINE|PIE)\]/i.test(line)) {
      inChartBlock = true;
    }
    if (/\[\/CHART\]/i.test(line)) {
      inChartBlock = false;
    }
    if (/\[DIAGRAM(?::[a-zA-Z0-9_-]+)?\]/i.test(line)) {
      inDiagramBlock = true;
    }
    if (/\[\/DIAGRAM\]/i.test(line)) {
      inDiagramBlock = false;
    }

    // Check for ANSWER line
    const answerMatch = !inChartBlock && !inDiagramBlock ? line.match(ANSWER_RE) : null;
    if (answerMatch) {
      current.answerRaw = answerMatch[1].trim();
      continue;
    }

    // Check for DISCUSSION line (can be multi-line, collects until next header)
    const discussionMatch = !inChartBlock && !inDiagramBlock ? line.match(DISCUSSION_RE) : null;
    if (discussionMatch) {
      section = 'discussion';
      const initialContent = discussionMatch[1].trim();
      if (initialContent) current.discussionLines.push(initialContent);
      continue;
    }

    const tipsTheoryMatch = !inChartBlock && !inDiagramBlock ? line.match(TIPS_THEORY_RE) : null;
    if (tipsTheoryMatch) {
      section = 'tip_theory';
      current.tipsList.push({ type: 'THEORY', lines: [] });
      const initialContent = tipsTheoryMatch[1].trim();
      if (initialContent) current.tipsList[current.tipsList.length - 1].lines.push(initialContent);
      continue;
    }

    const tipsPracticeMatch = !inChartBlock && !inDiagramBlock ? line.match(TIPS_PRACTICE_RE) : null;
    if (tipsPracticeMatch) {
      section = 'tip_practice';
      current.tipsList.push({ type: 'PRACTICE', lines: [] });
      const initialContent = tipsPracticeMatch[1].trim();
      if (initialContent) current.tipsList[current.tipsList.length - 1].lines.push(initialContent);
      continue;
    }

    const labelsMatch = !inChartBlock && !inDiagramBlock ? line.match(LABELS_RE) : null;
    if (labelsMatch) {
      section = 'labels';
      current.labelsRaw.push(labelsMatch[1].trim());
      continue;
    }

    if (section === 'discussion') {
      current.discussionLines.push(line);
      continue;
    }

    if (section === 'labels') {
      current.labelsRaw.push(line);
      continue;
    }

    if (section === 'tip_theory' || section === 'tip_practice') {
      current.tipsList[current.tipsList.length - 1].lines.push(line);
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
      if (!/^(?:ANSWER|Jawaban|DISCUSSION|Pembahasan|TIPS?_|LABELS?:|#)/i.test(line.trim())) {
        current.options[current.options.length - 1].textLines.push(line);
        continue;
      }
    }

    // Default: append to body
    current.bodyLines.push(line);
  }

  flushQuestion();
  return questions;
}

export const parseMarkdownQuestion = parseMarkdown;

/**
 * Parses a penalty config string like "10, 15, 20, ..." or "10, 15"
 * Returns the penalty for the N-th tip (1-indexed).
 */
export function getPenaltyForTip(configStr: string, tipIndex: number): number {
  if (!configStr || !configStr.trim() || tipIndex <= 0) return 0;

  const parts = configStr.split(',').map(s => s.trim()).filter(Boolean);
  if (parts.length === 0) return 0;

  const hasEllipsis = parts[parts.length - 1] === '...';
  const numParts = hasEllipsis ? parts.slice(0, -1) : parts;

  const numbers = numParts.map(s => parseFloat(s)).filter(n => !isNaN(n));
  if (numbers.length === 0) return 0;

  if (tipIndex <= numbers.length) {
    return numbers[tipIndex - 1];
  }

  if (!hasEllipsis) {
    return 0; // No penalty after the last one if no ellipsis
  }

  // Extrapolate
  if (numbers.length === 1) {
    return numbers[0]; // Constant if only 1 number
  }

  const lastNum = numbers[numbers.length - 1];
  const prevNum = numbers[numbers.length - 2];
  const diff = lastNum - prevNum;

  const extraSteps = tipIndex - numbers.length;
  return lastNum + (diff * extraSteps);
}
