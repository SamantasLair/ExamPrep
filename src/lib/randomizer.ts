import type { Question } from './types';

/**
 * Randomizes questions while respecting Stimulus Groups (Case Studies)
 * and Chain Index (ordered questions within a case study).
 */
export function groupAwareRandomizer(questions: Question[]): Question[] {
  // 1. Group questions by stimulus_id
  // Questions without stimulus_id get a unique pseudo-id to be treated as independent blocks
  const groups = new Map<string, Question[]>();
  
  questions.forEach(q => {
    const groupId = q.stimulus_id || `indep-${q.id}`;
    if (!groups.has(groupId)) {
      groups.set(groupId, []);
    }
    groups.get(groupId)!.push(q);
  });

  // 2. Sort questions within each group by chain_index (if applicable)
  // If chain_index is not defined, we can optionally randomize inside the group, 
  // but usually chain questions have absolute ordering.
  for (const [groupId, groupQuestions] of groups.entries()) {
    if (!groupId.startsWith('indep-')) {
      groupQuestions.sort((a, b) => {
        const aIndex = a.chain_index ?? 9999;
        const bIndex = b.chain_index ?? 9999;
        return aIndex - bIndex;
      });
    }
  }

  // 3. Shuffle the groups themselves
  const groupKeys = Array.from(groups.keys());
  for (let i = groupKeys.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [groupKeys[i], groupKeys[j]] = [groupKeys[j], groupKeys[i]];
  }

  // 4. Flatten the groups back into a single array
  const randomizedQuestions: Question[] = [];
  for (const key of groupKeys) {
    randomizedQuestions.push(...(groups.get(key) || []));
  }

  return randomizedQuestions;
}
