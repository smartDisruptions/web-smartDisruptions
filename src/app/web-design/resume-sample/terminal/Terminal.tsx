'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  identity,
  roles,
  projects,
  skills,
  education,
  elsewhere,
  disclosure,
} from '@/data/resume';
import s from './terminal.module.css';

/**
 * A working command line over the résumé.
 *
 * Local commands answer instantly from the record. Anything the parser does
 * not recognise is treated as a question and goes to the model — so the
 * terminal is the ask panel rather than having one bolted to its side, which
 * is what the world would actually do.
 */

type Line = {
  id: number;
  text: string;
  kind?: 'echo' | 'heading' | 'rule' | 'warn';
  href?: string;
};

/* The rule is drawn by CSS (see .lineRule) rather than typed, so it carries no
   text — 56 box-drawing characters overflow the field and get read aloud. */
const RULE = '';

const COMMANDS = [
  'help',
  'whoami',
  'history',
  'projects',
  'skills',
  'contact',
  'clear',
];

export default function Terminal({ modelEnabled }: { modelEnabled: boolean }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [value, setValue] = useState('');
  const [busy, setBusy] = useState(false);

  const nextId = useRef(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  const push = useCallback((incoming: Omit<Line, 'id'>[]) => {
    setLines((prev) => [
      ...prev,
      ...incoming.map((l) => ({ ...l, id: nextId.current++ })),
    ]);
  }, []);

  // Boot sequence. Runs once; the record prints itself before any input.
  useEffect(() => {
    push([
      { text: `SMARTDISRUPTIONS TERMINAL  ·  REC/1  ·  READY`, kind: 'heading' },
      { text: RULE, kind: 'rule' },
      { text: '' },
      { text: identity.name.toUpperCase(), kind: 'heading' },
      { text: identity.role },
      { text: identity.place },
      { text: '' },
      { text: wrap(identity.summary) },
      { text: '' },
      {
        text: modelEnabled
          ? "Type a command, or just ask a question in plain English."
          : "Type a command. The live model is not connected on this deployment, so questions cannot be answered here.",
        kind: modelEnabled ? undefined : 'warn',
      },
      { text: `Commands: ${COMMANDS.join('  ')}` },
    ]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keep the newest output in view without yanking the whole page.
  useEffect(() => {
    endRef.current?.scrollIntoView({ block: 'nearest' });
  }, [lines]);

  const run = useCallback(
    async (raw: string) => {
      const input = raw.trim();
      if (!input) return;

      push([{ text: `> ${input}`, kind: 'echo' }]);
      setValue('');

      const cmd = input.toLowerCase();

      if (cmd === 'clear') {
        setLines([]);
        return;
      }

      if (cmd === 'help') {
        push([
          { text: '' },
          { text: 'COMMANDS', kind: 'heading' },
          { text: RULE, kind: 'rule' },
          { text: '  whoami     the one-paragraph version' },
          { text: '  history    every role, newest first' },
          { text: '  projects   things that shipped' },
          { text: '  skills     what he works in' },
          { text: '  contact    where to find him' },
          { text: '  clear      wipe the screen' },
          { text: '' },
          {
            text: 'Anything else is treated as a question and sent to the model.',
          },
        ]);
        return;
      }

      if (cmd === 'whoami') {
        push([
          { text: '' },
          { text: identity.name.toUpperCase(), kind: 'heading' },
          { text: RULE, kind: 'rule' },
          { text: wrap(identity.summary) },
          { text: '' },
          {
            text: `  ${education.degree}, ${education.school}`,
          },
          { text: wrap(education.note, '  ') },
        ]);
        return;
      }

      if (cmd === 'history') {
        const out: Omit<Line, 'id'>[] = [
          { text: '' },
          { text: 'HISTORY', kind: 'heading' },
          { text: RULE, kind: 'rule' },
        ];
        roles.forEach((r) => {
          out.push({ text: '' });
          out.push({
            text: `${(r.start + '–' + r.end).padEnd(14)}${r.title}`,
            kind: 'heading',
          });
          out.push({ text: `${' '.repeat(14)}${r.org}` });
          r.notes.forEach((n) => out.push({ text: wrap(n, '              ') }));
          if (r.stack) {
            out.push({ text: `${' '.repeat(14)}[ ${r.stack.join('  ')} ]` });
          }
        });
        push(out);
        return;
      }

      if (cmd === 'projects' || cmd === 'ls') {
        const out: Omit<Line, 'id'>[] = [
          { text: '' },
          { text: 'PROJECTS', kind: 'heading' },
          { text: RULE, kind: 'rule' },
        ];
        projects.forEach((p) => {
          out.push({ text: '' });
          out.push({ text: `${p.name}  (${p.kind})`, kind: 'heading' });
          out.push({ text: `  → ${p.result}` });
          out.push({ text: wrap(p.detail, '  ') });
          if (p.href) out.push({ text: `  ${p.href}`, href: p.href });
        });
        push(out);
        return;
      }

      if (cmd === 'skills') {
        const out: Omit<Line, 'id'>[] = [
          { text: '' },
          { text: 'SKILLS', kind: 'heading' },
          { text: RULE, kind: 'rule' },
        ];
        skills.forEach((g) => {
          out.push({ text: '' });
          out.push({ text: g.group.toUpperCase(), kind: 'heading' });
          out.push({ text: `  ${g.items.join('  ·  ')}` });
        });
        out.push({ text: '' });
        elsewhere.forEach((e) => {
          out.push({ text: e.label.toUpperCase(), kind: 'heading' });
          out.push({ text: wrap(e.detail, '  ') });
          out.push({ text: '' });
        });
        push(out);
        return;
      }

      if (cmd === 'contact') {
        push([
          { text: '' },
          { text: 'CONTACT', kind: 'heading' },
          { text: RULE, kind: 'rule' },
          { text: `  ${identity.linkedinLabel}`, href: identity.linkedin },
          { text: `  ${identity.siteLabel}`, href: identity.site },
          { text: '' },
          {
            text: '  No email or phone is published on this page, on purpose.',
          },
        ]);
        return;
      }

      // Anything else is a question for the model.
      if (!modelEnabled) {
        push([
          { text: '' },
          {
            text: wrap(
              'The live model is not connected on this deployment, so there is no real answer to give. It will not invent one. Try: help',
            ),
            kind: 'warn',
          },
        ]);
        return;
      }

      setBusy(true);
      try {
        const res = await fetch('/api/resume-ask', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ question: input }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          push([
            { text: '' },
            {
              text: wrap(
                typeof data?.message === 'string'
                  ? data.message
                  : 'That did not go through.',
              ),
              kind: 'warn',
            },
          ]);
        } else {
          push([{ text: '' }, { text: wrap(String(data.answer ?? '')) }]);
        }
      } catch {
        push([
          { text: '' },
          { text: wrap('The connection dropped. Try again.'), kind: 'warn' },
        ]);
      } finally {
        setBusy(false);
      }
    },
    [modelEnabled, push],
  );

  return (
    <div
      className={s.world}
      onClick={() => inputRef.current?.focus()}
      role="presentation"
    >
      <div className={s.screen}>
        <div className={s.head}>
          <span>REC/1</span>
          <span>{identity.name}</span>
          <span>{modelEnabled ? 'MODEL ONLINE' : 'MODEL OFFLINE'}</span>
        </div>

        <div className={s.transcript} role="log" aria-live="polite">
          {lines.map((l, i) => {
            const cls = [
              s.line,
              i < lines.length - 14 ? s.lineOld : '',
              l.kind === 'echo' ? s.lineEcho : '',
              l.kind === 'heading' ? s.lineHeading : '',
              l.kind === 'rule' ? s.lineRule : '',
              l.kind === 'warn' ? s.lineWarn : '',
            ]
              .filter(Boolean)
              .join(' ');

            if (l.href) {
              return (
                <p key={l.id} className={cls}>
                  <a
                    className={s.lineLink}
                    href={l.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {l.text}
                  </a>
                </p>
              );
            }
            return (
              <p key={l.id} className={cls}>
                {l.text || ' '}
              </p>
            );
          })}
          <div ref={endRef} />
        </div>

        {busy && <p className={s.busy}>… reading the record</p>}

        <form
          className={s.promptRow}
          onSubmit={(e) => {
            e.preventDefault();
            void run(value);
          }}
        >
          <span className={s.sigil} aria-hidden="true">
            &gt;
          </span>
          <span className={s.inputWrap}>
            <label htmlFor="crt-input" className="sr-only">
              Enter a command or a question
            </label>
            <input
              id="crt-input"
              ref={inputRef}
              className={s.input}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={busy ? '' : 'help'}
              maxLength={300}
              disabled={busy}
              autoComplete="off"
              spellCheck={false}
            />
            {!busy && <span className={s.cursor} aria-hidden="true" />}
          </span>
        </form>

        <div className={s.hints}>
          {COMMANDS.map((c) => (
            <button
              key={c}
              type="button"
              className={s.hint}
              onClick={() => void run(c)}
              disabled={busy}
            >
              {c}
            </button>
          ))}
        </div>

        <p className={s.footNote}>
          {disclosure}
          {'\n'}
          <a className={s.lineLink} href="/web-design/resume-sample">
            ← all four samples
          </a>
        </p>
      </div>
    </div>
  );
}

/** Soft-wrap prose to the 56-column field, preserving an optional indent. */
function wrap(text: string, indent = ''): string {
  const width = 56 - indent.length;
  const words = text.split(/\s+/);
  const out: string[] = [];
  let line = '';
  for (const w of words) {
    if (line && line.length + 1 + w.length > width) {
      out.push(indent + line);
      line = w;
    } else {
      line = line ? `${line} ${w}` : w;
    }
  }
  if (line) out.push(indent + line);
  return out.join('\n');
}
