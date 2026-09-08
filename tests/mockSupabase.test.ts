import { describe, it, expect, beforeEach } from 'vitest';
import { mockSupabaseClient, resetMockData } from '../src/lib/mockSupabase';

describe('Mock Supabase Client Integration', () => {
  beforeEach(() => {
    resetMockData();
  });

  it('should retrieve student by ID using single()', async () => {
    const { data, error } = await mockSupabaseClient
      .from('students')
      .select('*')
      .eq('id', 'EXA-001')
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.name).toBe('Budi Pratama');
  });

  it('should query tests with ordering and limit', async () => {
    const { data, error } = await mockSupabaseClient
      .from('tests')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(10);

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(2);
    expect(data[0].title).toBeDefined();
  });

  it('should join tests on attempts query (tests(*))', async () => {
    const { data, error } = await mockSupabaseClient
      .from('attempts')
      .select('*, tests(*)')
      .eq('student_id', 'EXA-001');

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
    expect(data.length).toBeGreaterThanOrEqual(1);
    expect(data[0].tests).toBeDefined();
    expect(data[0].tests.title).toContain('SNBT');
  });

  it('should support insert and select chaining for attempts', async () => {
    const newAttempt = {
      test_id: 'mock-test-1',
      student_id: 'EXA-001',
      responses: { '1': 'A' },
      score: 100,
      status: 'finished'
    };

    const { data, error } = await mockSupabaseClient
      .from('attempts')
      .insert(newAttempt)
      .select()
      .single();

    expect(error).toBeNull();
    expect(data).toBeDefined();
    expect(data.id).toBeDefined();
    expect(data.score).toBe(100);
  });

  it('should calculate IRT metrics via RPC', async () => {
    const { data, error } = await mockSupabaseClient.rpc('calculate_irt', {
      p_test_id: 'mock-test-1'
    });

    expect(error).toBeNull();
    expect(Array.isArray(data)).toBe(true);
    expect(data!.length).toBeGreaterThanOrEqual(1);
    expect(data![0].question_id).toBeDefined();
    expect(typeof data![0].p_score).toBe('number');
  });
});
