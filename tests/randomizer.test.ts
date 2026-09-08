import { describe, it, expect } from 'vitest';
import { groupAwareRandomizer } from '../src/lib/randomizer';
import type { Question } from '../src/lib/types';

describe('Group-Aware Randomizer', () => {
  it('should maintain stimulus grouping and chain index ordering', () => {
    const questions: Question[] = [
      { id: 1, type: 'MCQ', body: [], stimulus_id: 'case-A', chain_index: 2 },
      { id: 2, type: 'MCQ', body: [], stimulus_id: 'case-A', chain_index: 1 },
      { id: 3, type: 'MCQ', body: [] }, // independent
      { id: 4, type: 'MCQ', body: [], stimulus_id: 'case-B', chain_index: 1 },
      { id: 5, type: 'MCQ', body: [], stimulus_id: 'case-B', chain_index: 2 },
    ];

    const randomized = groupAwareRandomizer(questions);
    expect(randomized).toHaveLength(5);

    // Verify questions in case-A are adjacent and chain_index is sorted 1 -> 2
    const idxCaseA1 = randomized.findIndex(q => q.id === 2);
    const idxCaseA2 = randomized.findIndex(q => q.id === 1);
    expect(idxCaseA2).toBe(idxCaseA1 + 1);

    // Verify questions in case-B are adjacent and chain_index is sorted 1 -> 2
    const idxCaseB1 = randomized.findIndex(q => q.id === 4);
    const idxCaseB2 = randomized.findIndex(q => q.id === 5);
    expect(idxCaseB2).toBe(idxCaseB1 + 1);
  });

  it('should return empty array when input is empty', () => {
    expect(groupAwareRandomizer([])).toEqual([]);
  });
});
