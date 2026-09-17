import { flushSync } from 'react-dom';

/**
 * Focuses a question card element with WCAG 2.4.3 compliant focus routing.
 */
export function focusQuestionCard(questionId: string | number): void {
  if (typeof document === 'undefined') return;
  const el = document.getElementById(`question-card-${questionId}`);
  if (el) {
    el.tabIndex = -1;
    el.focus({ preventScroll: true });
  }
}

/**
 * Executes a state update wrapped in document.startViewTransition with React flushSync,
 * falling back gracefully if unsupported or if an error occurs.
 */
export function runSafeViewTransition(
  updateFn: () => void,
  onFinished?: () => void
): void {
  if (
    typeof document !== 'undefined' &&
    'startViewTransition' in document &&
    typeof (document as unknown as { startViewTransition: unknown }).startViewTransition === 'function'
  ) {
    try {
      const transition = (document as unknown as {
        startViewTransition: (cb: () => void) => { finished: Promise<void> };
      }).startViewTransition(() => {
        try {
          flushSync(() => {
            updateFn();
          });
        } catch {
          updateFn();
        }
      });

      if (transition?.finished) {
        if (typeof transition.finished.finally === 'function') {
          const p = transition.finished.finally(() => {
            onFinished?.();
          });
          if (typeof p?.catch === 'function') {
            p.catch(() => {
              // Silently swallow abort/cancellation when transitions are superseded or skipped
            });
          }
          if (typeof transition.finished.catch === 'function') {
            transition.finished.catch(() => {
              // Silently swallow abort/cancellation when transitions are superseded or skipped
            });
          }
        } else if (typeof transition.finished.then === 'function') {
          transition.finished.then(
            () => onFinished?.(),
            () => onFinished?.()
          );
        } else {
          onFinished?.();
        }
      } else {
        onFinished?.();
      }
      return;
    } catch {
      // Resilient fallback if startViewTransition throws or flushSync cannot be batched
      try {
        updateFn();
      } catch {
        // preserve exception safety
      }
      onFinished?.();
      return;
    }
  }

  // Immediate fallback for non-supporting browsers or SSR
  updateFn();
  onFinished?.();
}
