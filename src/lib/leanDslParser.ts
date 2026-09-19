export interface ChartParsedResult {
  labels: string[];
  datasets: { label?: string; data: number[] }[];
}

export interface DiagramParsedResult extends Record<string, unknown> {
  type: string;
  boundingBox?: [number, number, number, number];
  axis?: boolean;
  grid?: boolean;
  aspectRatio?: number;
  elements?: Array<Record<string, unknown>>;
  fn?: string;
  xRange?: [number, number];
  yRange?: [number, number];
}

function parseKeyValuePair(str: string): Record<string, string | number | boolean> {
  const result: Record<string, string | number | boolean> = {};
  const regex = /(\b[a-zA-Z_]\w*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s,;]+))/g;
  let match: RegExpExecArray | null;
  while ((match = regex.exec(str)) !== null) {
    const key = match[1];
    const valRaw = match[2] ?? match[3] ?? match[4];
    if (valRaw !== undefined) {
      const trimmed = valRaw.trim();
      const num = Number(trimmed);
      if (!Number.isNaN(num) && trimmed !== '') {
        result[key] = num;
      } else if (trimmed.toLowerCase() === 'true' || trimmed.toLowerCase() === 'on') {
        result[key] = true;
      } else if (trimmed.toLowerCase() === 'false' || trimmed.toLowerCase() === 'off') {
        result[key] = false;
      } else {
        result[key] = trimmed;
      }
    }
  }
  return result;
}

function normalizeProps(rawProps: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(rawProps)) {
    if (k === 'color' || k === 'stroke') {
      out.strokeColor = v;
    } else if (k === 'fill') {
      out.fillColor = v;
    } else if (k === 'width') {
      out.strokeWidth = v;
    } else if (k === 'opacity') {
      out.fillOpacity = v;
    } else {
      out[k] = v;
    }
  }
  return out;
}

export function parseLeanChartDSL(raw: string): ChartParsedResult {
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length === 0) {
    return { labels: [], datasets: [] };
  }

  const isTable = lines.some((l) => l.startsWith('|') && l.endsWith('|'));
  if (isTable) {
    const tableLines = lines.filter((l) => l.startsWith('|') && l.endsWith('|'));
    const contentLines = tableLines.filter((l) => !/^\|(?:\s*:?-+:?\s*\|)+$/.test(l));
    if (contentLines.length >= 2) {
      const headerCells = contentLines[0]
        .slice(1, -1)
        .split('|')
        .map((c) => c.trim());
      const rowLines = contentLines.slice(1);
      const rowTokens = rowLines.map((row) =>
        row
          .slice(1, -1)
          .split('|')
          .map((c) => c.trim())
      );

      const headerNums = headerCells.slice(1).map((c) => Number(c));
      const isHeaderAllNumeric = headerNums.length > 0 && headerNums.every((n) => !Number.isNaN(n));
      const col0Nums = rowTokens.map((r) => Number(r[0]));
      const isCol0AllNumeric = col0Nums.length > 0 && col0Nums.every((n) => !Number.isNaN(n));

      // Row-oriented table (Headers are labels, row[0] is dataset name)
      if (!isCol0AllNumeric && (isHeaderAllNumeric || rowTokens.length <= headerCells.length - 1)) {
        const labels = headerCells.slice(1);
        const datasets: { label?: string; data: number[] }[] = [];
        for (const row of rowTokens) {
          const seriesName = row[0];
          const data = row.slice(1).map((val) => {
            const num = Number(val);
            return Number.isNaN(num) ? 0 : num;
          });
          datasets.push({ label: seriesName, data });
        }
        return { labels, datasets };
      }

      // Column-oriented table (Col 0 are labels, header[1..n] are dataset names)
      const labels = rowTokens.map((r) => r[0] ?? '');
      const seriesNames = headerCells.slice(1);
      const datasets: { label?: string; data: number[] }[] = seriesNames.map((name, colIdx) => ({
        label: name,
        data: rowTokens.map((row) => {
          const val = row[colIdx + 1];
          const num = Number(val);
          return Number.isNaN(num) ? 0 : num;
        }),
      }));
      return { labels, datasets };
    }
  }

  // Key-Value or List format
  let labels: string[] = [];
  const datasets: { label?: string; data: number[] }[] = [];

  for (const line of lines) {
    const colonIdx = line.indexOf(':');
    if (colonIdx === -1) continue;
    const key = line.slice(0, colonIdx).trim().toLowerCase();
    const val = line.slice(colonIdx + 1).trim();

    if (key === 'labels' || key === 'kategori' || key === 'label' || key === 'categories') {
      labels = val.includes(',')
        ? val.split(',').map((s) => s.trim()).filter(Boolean)
        : val.split(/\s+/).map((s) => s.trim()).filter(Boolean);
    } else {
      const rawNumbers = val.includes(',') ? val.split(',') : val.split(/\s+/);
      const nums = rawNumbers.map((s) => Number(s.trim())).filter((n) => !Number.isNaN(n));
      const seriesLabel = key === 'data' ? undefined : line.slice(0, colonIdx).trim();
      datasets.push({ label: seriesLabel, data: nums });
    }
  }

  return { labels, datasets };
}

export function parseLeanDiagramDSL(raw: string, tagType?: string): DiagramParsedResult {
  const lines = raw.split(/\r?\n/).map((l) => l.trim()).filter((l) => l.length > 0);

  let diagramType = (tagType && tagType.toLowerCase() === '3d') ? '3d' : 'geometry';
  let boundingBox: [number, number, number, number] = [-10, 10, 10, -10];
  let axis = true;
  let grid = true;
  let aspectRatio: number | undefined;
  let fn3d: string | undefined;
  let xRange: [number, number] | undefined;
  let yRange: [number, number] | undefined;
  const elements: Array<Record<string, unknown>> = [];

  for (const line of lines) {
    if (line.startsWith('//') || line.startsWith('#')) continue;

    // Directives
    const boundsMatch = line.match(/^(?:bounds|boundingbox)\s*:\s*\[?([^\]]+)\]?/i);
    if (boundsMatch) {
      const parts = boundsMatch[1].split(',').map((p) => Number(p.trim()));
      if (parts.length === 4 && parts.every((n) => !Number.isNaN(n))) {
        boundingBox = parts as [number, number, number, number];
      }
      continue;
    }

    const gridMatch = line.match(/^grid\s*:\s*(on|off|true|false)/i);
    if (gridMatch) {
      grid = gridMatch[1].toLowerCase() === 'on' || gridMatch[1].toLowerCase() === 'true';
      continue;
    }

    const axisMatch = line.match(/^axis\s*:\s*(on|off|true|false)/i);
    if (axisMatch) {
      axis = axisMatch[1].toLowerCase() === 'on' || axisMatch[1].toLowerCase() === 'true';
      continue;
    }

    const aspectMatch = line.match(/^aspect(?:ratio)?\s*:\s*([0-9.]+)/i);
    if (aspectMatch) {
      const num = Number(aspectMatch[1]);
      if (!Number.isNaN(num)) aspectRatio = num;
      continue;
    }

    // 3D directives or indicators
    if (line.toLowerCase() === '3d' || line.toLowerCase().startsWith('type: 3d') || line.toLowerCase().startsWith('type:3d')) {
      diagramType = '3d';
      continue;
    }

    if (diagramType === '3d' || line.toLowerCase().startsWith('fn3d') || line.toLowerCase().startsWith('z =') || line.toLowerCase().startsWith('z=')) {
      const zMatch = line.match(/^(?:fn3d|fn|z)\s*(?:=|:)\s*([^,;]+)(?:,\s*x\s*=\s*\[?([^,\]]+)\.\.([^,\]]+)\]?)?(?:,\s*y\s*=\s*\[?([^,\]]+)\.\.([^,\]]+)\]?)?/i);
      if (zMatch) {
        diagramType = '3d';
        fn3d = zMatch[1].trim();
        if (zMatch[2] !== undefined && zMatch[3] !== undefined) {
          xRange = [Number(zMatch[2]), Number(zMatch[3])];
        }
        if (zMatch[4] !== undefined && zMatch[5] !== undefined) {
          yRange = [Number(zMatch[4]), Number(zMatch[5])];
        }
        continue;
      }
    }

    // 2D Primitives:
    // 1. Point: A = point(0, 3, size=4, color=red) or point A(0, 3) or point A: 0, 3
    const ptMatch1 = line.match(/^([a-zA-Z_]\w*)\s*=\s*point\s*\(\s*(-?[0-9.]+)\s*,\s*(-?[0-9.]+)(.*)\)/i);
    if (ptMatch1) {
      const name = ptMatch1[1];
      const coords = [Number(ptMatch1[2]), Number(ptMatch1[3])];
      const props = normalizeProps(parseKeyValuePair(ptMatch1[4] || ''));
      elements.push({ type: 'point', name, coords, ...props });
      continue;
    }

    const ptMatch2 = line.match(/^point\s+([a-zA-Z_]\w*)\s*\(\s*(-?[0-9.]+)\s*,\s*(-?[0-9.]+)(.*)\)/i);
    if (ptMatch2) {
      const name = ptMatch2[1];
      const coords = [Number(ptMatch2[2]), Number(ptMatch2[3])];
      const props = normalizeProps(parseKeyValuePair(ptMatch2[4] || ''));
      elements.push({ type: 'point', name, coords, ...props });
      continue;
    }

    const ptMatch3 = line.match(/^point\s+([a-zA-Z_]\w*)\s*:\s*(-?[0-9.]+)\s*,\s*(-?[0-9.]+)(.*)/i);
    if (ptMatch3) {
      const name = ptMatch3[1];
      const coords = [Number(ptMatch3[2]), Number(ptMatch3[3])];
      const props = normalizeProps(parseKeyValuePair(ptMatch3[4] || ''));
      elements.push({ type: 'point', name, coords, ...props });
      continue;
    }

    // 2. Line: line A, B, stroke=blue, width=2 or line A -> B
    const lineMatch = line.match(/^line(?:\s+([a-zA-Z_]\w*)\s*[:=])?\s+([a-zA-Z_]\w*)\s*(?:->|,)\s*([a-zA-Z_]\w*)(.*)/i);
    if (lineMatch) {
      const explicitName = lineMatch[1];
      const p1 = lineMatch[2];
      const p2 = lineMatch[3];
      const props = normalizeProps(parseKeyValuePair(lineMatch[4] || ''));
      elements.push({
        type: 'line',
        name: explicitName || `line_${p1}_${p2}`,
        p1,
        p2,
        ...props,
      });
      continue;
    }

    // 3. Fn: fn f = x*x, stroke=blue or f(x) = x*x or fn: x*x
    const fnMatch1 = line.match(/^fn(?:\s+([a-zA-Z_]\w*))?\s*=\s*([^,]+)(.*)/i);
    if (fnMatch1) {
      const name = fnMatch1[1] || 'fn';
      const fnExpr = fnMatch1[2].trim();
      const props = normalizeProps(parseKeyValuePair(fnMatch1[3] || ''));
      elements.push({ type: 'functionGraph', name, fn: fnExpr, ...props });
      continue;
    }

    const fnMatch2 = line.match(/^([a-zA-Z_]\w*)\s*\(\s*x\s*\)\s*=\s*([^,]+)(.*)/i);
    if (fnMatch2) {
      const name = fnMatch2[1];
      const fnExpr = fnMatch2[2].trim();
      const props = normalizeProps(parseKeyValuePair(fnMatch2[3] || ''));
      elements.push({ type: 'functionGraph', name, fn: fnExpr, ...props });
      continue;
    }

    // 4. Integral: integral g, f, -1..3, fill=purple, opacity=0.35
    const intMatch = line.match(/^integral\s+([a-zA-Z_]\w*|\d+(?:\.\d+)?)\s*,\s*([a-zA-Z_]\w*|\d+(?:\.\d+)?)\s*,\s*(-?[0-9.]+)\s*\.\.\s*(-?[0-9.]+)(.*)/i);
    if (intMatch) {
      const curve1 = Number.isNaN(Number(intMatch[1])) ? intMatch[1] : Number(intMatch[1]);
      const curve2 = Number.isNaN(Number(intMatch[2])) ? intMatch[2] : Number(intMatch[2]);
      const range = [Number(intMatch[3]), Number(intMatch[4])];
      const props = normalizeProps(parseKeyValuePair(intMatch[5] || ''));
      elements.push({
        type: 'integral',
        name: `integral_${intMatch[1]}_${intMatch[2]}`,
        curve1,
        curve2,
        range,
        ...props,
      });
      continue;
    }

    // 5. Circle: circle A, 3, stroke=green or circle (name)?
    const circleMatch = line.match(/^circle(?:\s+([a-zA-Z_]\w*)\s*[:=])?\s+([a-zA-Z_]\w*)\s*,\s*([0-9.]+)(.*)/i);
    if (circleMatch) {
      const explicitName = circleMatch[1];
      const center = circleMatch[2];
      const radius = Number(circleMatch[3]);
      const props = normalizeProps(parseKeyValuePair(circleMatch[4] || ''));
      elements.push({
        type: 'circle',
        name: explicitName || `circle_${center}`,
        center,
        radius,
        ...props,
      });
      continue;
    }

    // 6. Polygon: polygon A, B, C, fill=yellow or poly A, B, C
    const polyMatch = line.match(/^(?:polygon|poly)(?:\s+([a-zA-Z_]\w*)\s*[:=])?\s+(.+)/i);
    if (polyMatch) {
      const explicitName = polyMatch[1];
      const remainder = polyMatch[2];
      const props = normalizeProps(parseKeyValuePair(remainder));
      const withoutProps = remainder.replace(/(\b[a-zA-Z_]\w*)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s,;]+)/g, '');
      const vertices = withoutProps
        .split(/[,\s]+/)
        .map((v) => v.trim())
        .filter((v) => /^[a-zA-Z_]\w*$/.test(v));
      if (vertices.length >= 3) {
        elements.push({
          type: 'polygon',
          name: explicitName || `poly_${vertices.join('_')}`,
          vertices,
          ...props,
        });
        continue;
      }
    }

    // 7. Angle: angle A, B, C, radius=1
    const angleMatch = line.match(/^angle\s+([a-zA-Z_]\w*)\s*,\s*([a-zA-Z_]\w*)\s*,\s*([a-zA-Z_]\w*)(.*)/i);
    if (angleMatch) {
      const p1 = angleMatch[1];
      const p2 = angleMatch[2];
      const p3 = angleMatch[3];
      const props = normalizeProps(parseKeyValuePair(angleMatch[4] || ''));
      elements.push({
        type: 'angle',
        name: `angle_${p1}_${p2}_${p3}`,
        p1,
        p2,
        p3,
        ...props,
      });
      continue;
    }

    // 8. Sector: sector O, A, B, fill=blue
    const sectorMatch = line.match(/^sector\s+([a-zA-Z_]\w*)\s*,\s*([a-zA-Z_]\w*)\s*,\s*([a-zA-Z_]\w*)(.*)/i);
    if (sectorMatch) {
      const p1 = sectorMatch[1];
      const p2 = sectorMatch[2];
      const p3 = sectorMatch[3];
      const props = normalizeProps(parseKeyValuePair(sectorMatch[4] || ''));
      elements.push({
        type: 'sector',
        name: `sector_${p1}_${p2}_${p3}`,
        p1,
        p2,
        p3,
        ...props,
      });
      continue;
    }

    // 9. Text: text "Label", 1, 2, color=red
    const textMatch = line.match(/^text\s+(?:"([^"]*)"|'([^']*)')\s*,\s*(-?[0-9.]+)\s*,\s*(-?[0-9.]+)(.*)/i);
    if (textMatch) {
      const textContent = textMatch[1] ?? textMatch[2];
      const coords = [Number(textMatch[3]), Number(textMatch[4])];
      const props = normalizeProps(parseKeyValuePair(textMatch[5] || ''));
      elements.push({
        type: 'text',
        name: `text_${coords.join('_')}`,
        text: textContent,
        coords,
        ...props,
      });
      continue;
    }
  }

  const result: DiagramParsedResult = {
    type: diagramType,
    boundingBox,
    axis,
    grid,
    elements,
  };

  if (aspectRatio !== undefined) result.aspectRatio = aspectRatio;
  if (fn3d !== undefined) result.fn = fn3d;
  if (xRange !== undefined) result.xRange = xRange;
  if (yRange !== undefined) result.yRange = yRange;

  return result;
}
