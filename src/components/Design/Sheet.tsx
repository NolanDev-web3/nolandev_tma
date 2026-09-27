import { useEffect, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { useKeepAliveContext } from 'keepalive-for-react';
import { useInRouterContext } from 'react-router-dom';
import { X } from 'lucide-react';
export function Sheet({ title, children, onClose, busy = false }: { title: string; children: ReactNode; onClose: () => void; busy?: boolean }) {
  const ref = useRef<HTMLDialogElement>(null);
  const { active } = useKeepAliveContext();
  const inRouter = useInRouterContext();
  const close = useRef(onClose); close.current = onClose;
  const locked = useRef(busy); locked.current = busy;
  useEffect(() => { const dialog = ref.current; dialog?.showModal(); return () => dialog?.close(); }, []);
  useEffect(() => {
    const handler = (event: Event) => { event.preventDefault(); if (!locked.current) close.current(); };
    window.addEventListener('nolandev:back', handler);
    return () => window.removeEventListener('nolandev:back', handler);
  }, []);
  // Cached route sheets must not remain in the top layer after navigating away.
  const wasActive = useRef(active);
  useEffect(() => { if (inRouter && wasActive.current && !active) close.current(); wasActive.current = active; }, [active, inRouter]);
  return createPortal(<dialog ref={ref} className="nd-sheet-dialog nd-theme" aria-label={title} onCancel={event => { event.preventDefault(); if (!busy) onClose(); }} onClick={event => { if (event.target === event.currentTarget && !busy) onClose(); }}>
    <div className="nd-sheet-inner"><header><h2>{title}</h2><button className="nd-icon-button" aria-label="Close dialog" disabled={busy} onClick={onClose}><X size={19} /></button></header><div className="nd-sheet-body">{children}</div></div>
  </dialog>, document.body);
}
