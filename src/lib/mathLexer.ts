export interface MathToken {
  type: 'math-block' | 'math-inline' | 'text';
  content: string;
}

/**
 * Scans text and extracts math block ($$...$$) and math inline ($...$) tokens
 * with strict KaTeX whitespace guard, currency symbol immunity, and escaped dollar handling.
 */
export function scanMathDelimiters(text: string): MathToken[] {
  if (!text) return [];

  const tokens: MathToken[] = [];
  const len = text.length;
  let i = 0;
  let textBuffer = '';

  const flushTextBuffer = () => {
    if (textBuffer.length > 0) {
      tokens.push({ type: 'text', content: textBuffer });
      textBuffer = '';
    }
  };

  while (i < len) {
    // Check for escaped dollar: \$
    if (text[i] === '\\' && i + 1 < len && text[i + 1] === '$') {
      textBuffer += '$';
      i += 2;
      continue;
    }

    // Check for block math: $$...$$
    if (text[i] === '$' && i + 1 < len && text[i + 1] === '$') {
      let closeIdx = -1;
      let j = i + 2;
      while (j < len) {
        if (text[j] === '\\' && j + 1 < len && text[j + 1] === '$') {
          j += 2;
          continue;
        }
        if (text[j] === '$' && j + 1 < len && text[j + 1] === '$') {
          closeIdx = j;
          break;
        }
        j++;
      }

      if (closeIdx !== -1) {
        flushTextBuffer();
        const content = text.slice(i + 2, closeIdx);
        tokens.push({ type: 'math-block', content });
        i = closeIdx + 2;
        continue;
      }
    }

    // Check for inline math: $...$ with KaTeX whitespace guard
    if (text[i] === '$') {
      // Opening delimiter rule: next char must NOT be whitespace, EOF, or another $
      const nextChar = i + 1 < len ? text[i + 1] : '';
      if (nextChar !== '' && !/\s/.test(nextChar) && nextChar !== '$') {
        let closeIdx = -1;
        let j = i + 1;
        while (j < len) {
          if (text[j] === '\\' && j + 1 < len && text[j + 1] === '$') {
            j += 2;
            continue;
          }
          if (text[j] === '\n' || text[j] === '\r') {
            // Inline math typically does not span multiple lines
            break;
          }
          if (text[j] === '$') {
            // Closing delimiter rule: preceding char must NOT be whitespace
            const prevChar = text[j - 1];
            if (!/\s/.test(prevChar)) {
              closeIdx = j;
              break;
            }
          }
          j++;
        }

        if (closeIdx !== -1) {
          flushTextBuffer();
          const content = text.slice(i + 1, closeIdx);
          tokens.push({ type: 'math-inline', content });
          i = closeIdx + 1;
          continue;
        }
      }
    }

    // Normal character fallback
    textBuffer += text[i];
    i++;
  }

  flushTextBuffer();
  return tokens;
}
