import {
  INITIAL_STUDENTS,
  INITIAL_TESTS,
  INITIAL_QUESTIONS,
  INITIAL_ATTEMPTS,
  type MockAttemptRecord
} from './mockData';
import type { StudentRow, TestRow, QuestionRow } from './types';
import { parseMarkdown } from './parser';

const STORAGE_KEYS = {
  students: 'exaprep_mock_students',
  tests: 'exaprep_mock_tests',
  questions: 'exaprep_mock_questions',
  attempts: 'exaprep_mock_attempts',
  seeded: 'exaprep_mock_seeded_v7'
};

// In-memory fallback for SSR / non-browser environments
const memoryStore: Record<string, any[]> = {
  students: [...INITIAL_STUDENTS],
  tests: [...INITIAL_TESTS],
  questions: [...INITIAL_QUESTIONS],
  attempts: [...INITIAL_ATTEMPTS]
};

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function seedMockStorageIfEmpty(forceReset = false) {
  if (!isBrowser()) return;
  const alreadySeeded = localStorage.getItem(STORAGE_KEYS.seeded);
  if (!alreadySeeded || forceReset) {
    localStorage.setItem(STORAGE_KEYS.students, JSON.stringify(INITIAL_STUDENTS));
    localStorage.setItem(STORAGE_KEYS.tests, JSON.stringify(INITIAL_TESTS));
    localStorage.setItem(STORAGE_KEYS.questions, JSON.stringify(INITIAL_QUESTIONS));
    localStorage.setItem(STORAGE_KEYS.attempts, JSON.stringify(INITIAL_ATTEMPTS));
    localStorage.setItem(STORAGE_KEYS.seeded, 'true');
  }
}

function getTableData<T>(table: string): T[] {
  if (!isBrowser()) {
    return (memoryStore[table] || []) as T[];
  }
  seedMockStorageIfEmpty();
  const key = STORAGE_KEYS[table as keyof typeof STORAGE_KEYS];
  if (!key) return [];
  const stored = localStorage.getItem(key);
  if (!stored) return [];
  try {
    return JSON.parse(stored) as T[];
  } catch {
    return [];
  }
}

function setTableData<T>(table: string, data: T[]): void {
  if (!isBrowser()) {
    memoryStore[table] = data;
    return;
  }
  const key = STORAGE_KEYS[table as keyof typeof STORAGE_KEYS];
  if (key) {
    localStorage.setItem(key, JSON.stringify(data));
  }
}

export function resetMockData() {
  if (!isBrowser()) {
    memoryStore.students = [...INITIAL_STUDENTS];
    memoryStore.tests = [...INITIAL_TESTS];
    memoryStore.questions = [...INITIAL_QUESTIONS];
    memoryStore.attempts = [...INITIAL_ATTEMPTS];
    return;
  }
  seedMockStorageIfEmpty(true);
}

class MockQueryBuilder {
  private table: string;
  private selectedColumns = '*';
  private countOption?: 'exact';
  private filters: ((row: any) => boolean)[] = [];
  private orderColumn?: string;
  private orderAscending = true;
  private limitCount: number | null = null;
  private rangeFrom: number | null = null;
  private rangeTo: number | null = null;
  private isSingle = false;

  private mutationType: 'select' | 'insert' | 'upsert' | 'update' | 'delete' = 'select';
  private mutationData: any = null;

  constructor(table: string) {
    this.table = table;
  }

  select(columns = '*', options?: { count?: 'exact' }) {
    this.selectedColumns = columns;
    if (options?.count) this.countOption = options.count;
    return this;
  }

  eq(column: string, value: any) {
    this.filters.push(row => String(row[column]) === String(value));
    return this;
  }

  neq(column: string, value: any) {
    this.filters.push(row => String(row[column]) !== String(value));
    return this;
  }

  gte(column: string, value: any) {
    this.filters.push(row => row[column] >= value);
    return this;
  }

  lte(column: string, value: any) {
    this.filters.push(row => row[column] <= value);
    return this;
  }

  ilike(column: string, pattern: string) {
    const cleanPattern = pattern.replace(/%/g, '').toLowerCase();
    this.filters.push(row => {
      const val = String(row[column] || '').toLowerCase();
      return val.includes(cleanPattern);
    });
    return this;
  }

  contains(column: string, value: any) {
    this.filters.push(row => {
      const rowVal = row[column];
      if (!rowVal || typeof rowVal !== 'object') return false;
      if (Array.isArray(value)) {
        if (!Array.isArray(rowVal)) return false;
        return value.some(val => rowVal.some(r => String(r).toLowerCase() === String(val).toLowerCase()));
      }
      for (const k of Object.keys(value)) {
        const requiredVal = value[k];
        const currentVal = rowVal[k];
        if (!currentVal) return false;
        if (Array.isArray(requiredVal) && Array.isArray(currentVal)) {
          const hasMatch = requiredVal.some(item =>
            currentVal.some(c => String(c).trim().toLowerCase() === String(item).trim().toLowerCase())
          );
          if (!hasMatch) return false;
        } else if (Array.isArray(currentVal)) {
          const hasMatch = currentVal.some(c => String(c).trim().toLowerCase() === String(requiredVal).trim().toLowerCase());
          if (!hasMatch) return false;
        } else if (Array.isArray(requiredVal)) {
          const hasMatch = requiredVal.some(item => String(item).trim().toLowerCase() === String(currentVal).trim().toLowerCase());
          if (!hasMatch) return false;
        } else {
          if (String(currentVal).trim().toLowerCase() !== String(requiredVal).trim().toLowerCase()) {
            return false;
          }
        }
      }
      return true;
    });
    return this;
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.orderColumn = column;
    this.orderAscending = options?.ascending !== false;
    return this;
  }

  limit(n: number) {
    this.limitCount = n;
    return this;
  }

  range(from: number, to: number) {
    this.rangeFrom = from;
    this.rangeTo = to;
    return this;
  }

  single() {
    this.isSingle = true;
    return this;
  }

  insert(data: any | any[]) {
    this.mutationType = 'insert';
    this.mutationData = data;
    return this;
  }

  upsert(data: any | any[]) {
    this.mutationType = 'upsert';
    this.mutationData = data;
    return this;
  }

  update(fields: Record<string, any>) {
    this.mutationType = 'update';
    this.mutationData = fields;
    return this;
  }

  delete() {
    this.mutationType = 'delete';
    return this;
  }

  private execute() {
    if (this.mutationType === 'insert') {
      const rows = Array.isArray(this.mutationData) ? this.mutationData : [this.mutationData];
      const current = getTableData<any>(this.table);
      const now = new Date().toISOString();

      const insertedRows = rows.map((r, idx) => ({
        id: r.id || `${this.table.slice(0, 3)}-${Date.now()}-${idx}`,
        created_at: r.created_at || now,
        ...r
      }));

      const updated = [...insertedRows, ...current];
      setTableData(this.table, updated);

      return {
        data: this.isSingle ? insertedRows[0] : (Array.isArray(this.mutationData) ? insertedRows : insertedRows[0]),
        error: null
      };
    }

    if (this.mutationType === 'upsert') {
      const rows = Array.isArray(this.mutationData) ? this.mutationData : [this.mutationData];
      const current = getTableData<any>(this.table);
      const now = new Date().toISOString();

      const result = [...current];
      for (const item of rows) {
        const existingIdx = result.findIndex(r => r.id === item.id);
        if (existingIdx >= 0) {
          result[existingIdx] = { ...result[existingIdx], ...item };
        } else {
          result.unshift({
            id: item.id || `${this.table.slice(0, 3)}-${Date.now()}`,
            created_at: item.created_at || now,
            ...item
          });
        }
      }

      setTableData(this.table, result);
      return { data: Array.isArray(this.mutationData) ? rows : rows[0], error: null };
    }

    if (this.mutationType === 'update') {
      const current = getTableData<any>(this.table);
      const updated = current.map(row => {
        const match = this.filters.every(fn => fn(row));
        return match ? { ...row, ...this.mutationData } : row;
      });
      setTableData(this.table, updated);
      return { data: this.mutationData, error: null };
    }

    if (this.mutationType === 'delete') {
      const current = getTableData<any>(this.table);
      const kept = current.filter(row => !this.filters.every(fn => fn(row)));
      setTableData(this.table, kept);
      return { data: null, error: null };
    }

    // Default: SELECT
    let rows = [...getTableData<any>(this.table)];

    // 1. Filter
    for (const filterFn of this.filters) {
      rows = rows.filter(filterFn);
    }

    const totalCount = rows.length;

    // 2. Sort
    if (this.orderColumn) {
      const col = this.orderColumn;
      const asc = this.orderAscending;
      rows.sort((a, b) => {
        const valA = a[col];
        const valB = b[col];
        if (valA === valB) return 0;
        if (valA === undefined || valA === null) return 1;
        if (valB === undefined || valB === null) return -1;
        if (asc) {
          return valA > valB ? 1 : -1;
        } else {
          return valA < valB ? 1 : -1;
        }
      });
    }

    // 3. Range / Limit
    if (this.rangeFrom !== null && this.rangeTo !== null) {
      rows = rows.slice(this.rangeFrom, this.rangeTo + 1);
    } else if (this.limitCount !== null) {
      rows = rows.slice(0, this.limitCount);
    }

    // 4. Resolve Joined Relations (e.g. tests(*), tests(title))
    if (this.table === 'attempts') {
      const tests = getTableData<TestRow>('tests');
      rows = rows.map(att => {
        const matchingTest = tests.find(t => t.id === att.test_id);
        return {
          ...att,
          tests: matchingTest ? (this.selectedColumns.includes('tests(title)') ? { title: matchingTest.title } : matchingTest) : null
        };
      });
    }

    // 5. Single Check
    if (this.isSingle) {
      if (rows.length === 0) {
        return { data: null, error: { message: 'Row not found in mock store' }, count: 0 };
      }
      return { data: rows[0], error: null, count: 1 };
    }

    return {
      data: rows,
      error: null,
      count: this.countOption === 'exact' ? totalCount : undefined
    };
  }

  // Thenable for await support
  then(onfulfilled?: (value: any) => any, onrejected?: (reason: any) => any) {
    try {
      const result = this.execute();
      return Promise.resolve(result).then(onfulfilled, onrejected);
    } catch (err) {
      return Promise.reject(err).then(onfulfilled, onrejected);
    }
  }
}

export const mockSupabaseClient = {
  from(table: string) {
    return new MockQueryBuilder(table);
  },

  async rpc(fnName: string, params?: Record<string, any>) {
    if (fnName === 'calculate_irt') {
      const testId = params?.p_test_id || params?.test_id_param;
      const tests = getTableData<TestRow>('tests');
      const attempts = getTableData<MockAttemptRecord>('attempts');

      const targetTest = tests.find(t => t.id === testId);
      if (!targetTest) {
        return { data: [], error: null };
      }

      const questions = parseMarkdown(targetTest.raw_markdown);
      const finishedAttempts = attempts.filter(a => a.test_id === testId && a.status === 'finished');

      if (finishedAttempts.length === 0) {
        return { data: [], error: null };
      }

      const irtResults = questions.map(q => {
        const qId = String(q.id);
        const total = finishedAttempts.length;
        const correct = finishedAttempts.filter(a => a.responses && a.responses[qId] === q.correctAnswer).length;
        const pScore = total > 0 ? Number((correct / total).toFixed(2)) : 0;
        return {
          question_id: qId,
          p_score: pScore,
          correct_count: correct,
          total_count: total
        };
      });

      return { data: irtResults, error: null };
    }

    return { data: null, error: { message: `RPC ${fnName} not implemented in mock` } };
  }
};
