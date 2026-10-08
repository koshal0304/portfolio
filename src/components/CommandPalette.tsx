import React, { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Copy, CornerDownLeft, Github, Hash, Linkedin, Mail, ScanSearch, Search, Sparkles } from 'lucide-react';
import { getIndex } from '../data/knowledge';
import { askLab, PALETTE_EVENT } from '../lib/askLab';

type Group = 'Ask the AI Lab' | 'Semantic matches' | 'Navigate' | 'Actions';

interface Item {
  id: string;
  group: Group;
  label: string;
  hint?: string;
  icon: React.ReactNode;
  run: () => void;
}

const EMAIL = 'koshalkumar0304@gmail.com';

const SECTIONS: [string, string][] = [
  ['About', '#hero'],
  ['AI Lab', '#ai-sandbox'],
  ['Experience', '#experience'],
  ['Skills', '#skills'],
  ['Projects', '#projects'],
  ['Achievements', '#achievements'],
  ['Education', '#education'],
  ['Contact', '#contact'],
];

const go = (href: string) => document.querySelector(href)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

const isTyping = (el: EventTarget | null) =>
  el instanceof HTMLElement && (el.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName));

const CommandPalette: React.FC = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [active, setActive] = useState(0);
  const [flash, setFlash] = useState<string | null>(null);
  const restoreFocus = useRef<HTMLElement | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    // Remember the trigger before autoFocus moves focus into the dialog.
    const toggle = (next?: boolean) =>
      setOpen((o) => {
        const v = next ?? !o;
        if (v && !o) restoreFocus.current = document.activeElement as HTMLElement | null;
        return v;
      });
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggle();
      } else if (e.key === '/' && !isTyping(e.target)) {
        e.preventDefault();
        toggle(true);
      }
    };
    const onOpen = () => toggle(true);
    window.addEventListener('keydown', onKey);
    window.addEventListener(PALETTE_EVENT, onOpen);
    return () => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener(PALETTE_EVENT, onOpen);
    };
  }, []);

  useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = overflow;
      restoreFocus.current?.focus?.();
      setQuery('');
      setFlash(null);
    };
  }, [open]);

  const close = () => setOpen(false);

  const items = useMemo<Item[]>(() => {
    const q = query.trim();
    const matches = (label: string) => !q || label.toLowerCase().includes(q.toLowerCase());
    const out: Item[] = [];

    if (q) {
      out.push({
        id: 'ask',
        group: 'Ask the AI Lab',
        label: `“${q}”`,
        hint: 'Grounded, cited answer',
        icon: <Sparkles className="w-4 h-4 text-emerald-300" />,
        run: () => {
          close();
          askLab(q);
        },
      });
      for (const h of getIndex().search(q, 4).hits) {
        out.push({
          id: `hit-${h.chunk.id}`,
          group: 'Semantic matches',
          label: h.chunk.title,
          hint: `${h.chunk.meta ?? h.chunk.section} · ${h.score.toFixed(2)}`,
          icon: <ScanSearch className="w-4 h-4 text-sky-300" />,
          run: () => {
            close();
            go(h.chunk.href);
          },
        });
      }
    }

    for (const [label, href] of SECTIONS) {
      if (matches(label))
        out.push({
          id: `nav-${href}`,
          group: 'Navigate',
          label,
          icon: <Hash className="w-4 h-4 text-slate-400" />,
          run: () => {
            close();
            go(href);
          },
        });
    }

    const actions: Item[] = [
      {
        id: 'copy-email',
        group: 'Actions',
        label: 'Copy email address',
        hint: EMAIL,
        icon: <Copy className="w-4 h-4 text-slate-400" />,
        run: () => {
          if (!navigator.clipboard) return setFlash(EMAIL);
          navigator.clipboard.writeText(EMAIL).then(
            () => setFlash('Email copied to clipboard'),
            () => setFlash(EMAIL)
          );
        },
      },
      {
        id: 'email',
        group: 'Actions',
        label: 'Send an email',
        icon: <Mail className="w-4 h-4 text-slate-400" />,
        run: () => {
          window.location.href = `mailto:${EMAIL}`;
        },
      },
      {
        id: 'github',
        group: 'Actions',
        label: 'Open GitHub',
        hint: 'github.com/koshal0304',
        icon: <Github className="w-4 h-4 text-slate-400" />,
        run: () => window.open('https://github.com/koshal0304', '_blank', 'noopener,noreferrer'),
      },
      {
        id: 'linkedin',
        group: 'Actions',
        label: 'Open LinkedIn',
        icon: <Linkedin className="w-4 h-4 text-slate-400" />,
        run: () => window.open('https://linkedin.com/in/koshal-kumar-970233240', '_blank', 'noopener,noreferrer'),
      },
    ];
    out.push(...actions.filter((a) => matches(a.label)));
    return out;
  }, [query]);

  useEffect(() => setActive(0), [query]);
  useEffect(() => {
    listRef.current?.querySelector(`[data-idx="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  const onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      const d = e.key === 'ArrowDown' ? 1 : -1;
      setActive((a) => (a + d + items.length) % Math.max(items.length, 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      items[active]?.run();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    } else if (e.key === 'Tab') {
      // Single focusable control: keep focus inside the dialog.
      e.preventDefault();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="fixed inset-0 z-[90] flex items-start justify-center px-4 pt-[12vh] bg-black/60 backdrop-blur-sm"
          onMouseDown={(e) => e.target === e.currentTarget && close()}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Command palette"
            initial={{ opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="w-full max-w-xl rounded-2xl bg-[#0a0e16]/95 border border-white/10 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9),0_0_40px_rgba(56,189,248,0.08)] overflow-hidden"
          >
            <div className="flex items-center gap-3 px-4 border-b border-white/[0.07]">
              <Search className="w-4 h-4 text-slate-500 shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onInputKey}
                placeholder="Search my experience, or jump anywhere…"
                role="combobox"
                aria-expanded="true"
                aria-controls="palette-list"
                aria-activedescendant={items[active] ? `palette-${items[active].id}` : undefined}
                aria-label="Search"
                className="flex-1 bg-transparent py-4 text-[15px] text-slate-100 placeholder-slate-500 focus:outline-none"
              />
              <kbd className="font-mono text-[10px] text-slate-500 border border-white/10 rounded px-1.5 py-0.5">esc</kbd>
            </div>

            <ul id="palette-list" ref={listRef} role="listbox" className="max-h-[55vh] overflow-y-auto py-2">
              {items.map((item, i) => (
                <React.Fragment key={item.id}>
                  {item.group !== items[i - 1]?.group && (
                    <li role="presentation" className="px-4 pt-2.5 pb-1 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                      {item.group}
                    </li>
                  )}
                  <li
                    id={`palette-${item.id}`}
                    role="option"
                    aria-selected={i === active}
                    data-idx={i}
                    onMouseMove={() => setActive(i)}
                    onClick={item.run}
                    className={`mx-2 px-3 py-2.5 rounded-lg flex items-center gap-3 cursor-pointer transition-colors [&>svg]:shrink-0 ${
                      i === active ? 'bg-white/[0.07]' : ''
                    }`}
                  >
                    {item.icon}
                    <span className="text-sm text-slate-100 truncate">{item.label}</span>
                    {item.hint && <span className="hidden sm:inline ml-auto pl-3 font-mono text-[11px] text-slate-500 truncate">{item.hint}</span>}
                    {i === active &&
                      (item.group === 'Semantic matches' ? (
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      ) : (
                        <CornerDownLeft className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      ))}
                  </li>
                </React.Fragment>
              ))}
              {items.length === 0 && <li className="px-4 py-6 text-center text-sm text-slate-500">No matches.</li>}
            </ul>

            <div className="flex items-center justify-between gap-3 px-4 py-2.5 border-t border-white/[0.07] font-mono text-[10px] text-slate-500">
              <span>{flash ?? '↑↓ navigate · ↵ select'}</span>
              <span className="hidden sm:inline">semantic search runs locally in your browser</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CommandPalette;
