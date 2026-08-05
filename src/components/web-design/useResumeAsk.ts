'use client';

import { useCallback, useRef, useState } from 'react';

/**
 * Headless state for the ask-the-résumé panel.
 *
 * Deliberately headless: each sample renders the panel in its own world's
 * vocabulary — a field notebook, a colour pass, a command line. A shared
 * widget dropped into four committed designs would be the one stock component
 * that gives the whole set away.
 */

export type AskStatus = 'idle' | 'asking' | 'answered' | 'error';

export type AskState = {
  status: AskStatus;
  question: string;
  answer: string;
  error: string;
  /** The question that produced the current answer, for transcript display. */
  asked: string;
};

export function useResumeAsk(enabled: boolean) {
  const [state, setState] = useState<AskState>({
    status: 'idle',
    question: '',
    answer: '',
    error: '',
    asked: '',
  });

  // Guards against a slow first answer overwriting a faster second one.
  const requestId = useRef(0);

  const setQuestion = useCallback((question: string) => {
    setState((s) => ({ ...s, question }));
  }, []);

  const ask = useCallback(
    async (override?: string) => {
      const question = (override ?? '').trim() || state.question.trim();
      if (!question) return;

      if (!enabled) {
        setState((s) => ({
          ...s,
          status: 'error',
          asked: question,
          answer: '',
          error:
            'The live model is not connected on this deployment, so there is nothing real to answer with. It will not fake one.',
        }));
        return;
      }

      const id = ++requestId.current;
      setState((s) => ({
        ...s,
        status: 'asking',
        asked: question,
        answer: '',
        error: '',
      }));

      try {
        const res = await fetch('/api/resume-ask', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ question }),
        });
        const data = await res.json().catch(() => ({}));
        if (id !== requestId.current) return;

        if (!res.ok) {
          setState((s) => ({
            ...s,
            status: 'error',
            error:
              typeof data?.message === 'string'
                ? data.message
                : 'That did not go through.',
          }));
          return;
        }

        setState((s) => ({
          ...s,
          status: 'answered',
          answer: String(data.answer ?? ''),
          question: '',
        }));
      } catch {
        if (id !== requestId.current) return;
        setState((s) => ({
          ...s,
          status: 'error',
          error: 'The connection dropped. Try again.',
        }));
      }
    },
    [enabled, state.question],
  );

  return { ...state, setQuestion, ask };
}

/** Starter questions, phrased the way a real reader would ask them. */
export const SUGGESTED = [
  'What does he actually do at the University of Idaho?',
  'Has he built anything for a real client?',
  'Does he have a computer science degree?',
];
