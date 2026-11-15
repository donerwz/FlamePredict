"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { createFeedback } from "@/lib/feedbacks";

interface PendingSelection {
  text: string;
  x: number;
  y: number;
}

const MAX_SELECTION = 5000;

export default function SelectionFeedback() {
  const [selection, setSelection] = useState<PendingSelection | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [comment, setComment] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const dialogOpenRef = useRef(false);

  const openDialog = () => {
    dialogOpenRef.current = true;
    setDialogOpen(true);
    setError("");
  };

  const closeDialog = () => {
    dialogOpenRef.current = false;
    setDialogOpen(false);
  };

  useEffect(() => {
    const updateSelection = () => {
      // Clicking into the form may clear the browser selection. Keep the
      // captured quote while the dialog is open instead of unmounting it.
      if (dialogOpenRef.current) return;
      const active = window.getSelection();
      const text = active?.toString().replace(/\s+/g, " ").trim() ?? "";
      if (!text || text.length > MAX_SELECTION || !active?.rangeCount) {
        setSelection(null);
        return;
      }
      const anchor = active.anchorNode instanceof Element
        ? active.anchorNode
        : active.anchorNode?.parentElement;
      if (anchor?.closest("[data-feedback-ui], input, textarea, select, [contenteditable='true']")) {
        setSelection(null);
        return;
      }
      const rect = active.getRangeAt(0).getBoundingClientRect();
      if (!rect.width && !rect.height) return;
      setSelection({ text, x: Math.max(12, Math.min(rect.left, window.innerWidth - 210)), y: Math.max(12, rect.top - 48) });
    };
    document.addEventListener("mouseup", updateSelection);
    document.addEventListener("keyup", updateSelection);
    document.addEventListener("selectionchange", updateSelection);
    return () => {
      document.removeEventListener("mouseup", updateSelection);
      document.removeEventListener("keyup", updateSelection);
      document.removeEventListener("selectionchange", updateSelection);
    };
  }, []);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!selection || !comment.trim()) return;
    setBusy(true);
    setError("");
    try {
      await createFeedback({
        page_path: `${window.location.pathname}${window.location.search}${window.location.hash}`,
        selected_text: selection.text,
        comment: comment.trim(),
        display_name: name.trim() || "Anonymous",
      });
      closeDialog();
      setSelection(null);
      setComment("");
      setName("");
      setSaved(true);
      window.setTimeout(() => setSaved(false), 6000);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not save feedback.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      {selection && !dialogOpen && (
        <button
          data-feedback-ui
          type="button"
          onMouseDown={(event) => event.preventDefault()}
          onClick={openDialog}
          style={{ left: selection.x, top: selection.y }}
          className="fixed z-[70] rounded-md border border-flame/50 bg-void px-3 py-2 text-xs font-semibold text-icewhite shadow-xl hover:border-ember"
        >
          Comment on selection
        </button>
      )}

      {dialogOpen && selection && (
        <div data-feedback-ui className="fixed inset-0 z-[80] grid place-items-center bg-void/80 p-4 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) closeDialog(); }}>
          <form onSubmit={submit} className="w-full max-w-xl border border-flame/30 bg-void p-6 shadow-2xl md:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="readout readout--dim">SHARE FEEDBACK</p>
                <h2 className="mt-2 text-xl font-semibold text-icewhite">Comment on this passage</h2>
              </div>
              <button type="button" onClick={closeDialog} className="text-slate hover:text-icewhite" aria-label="Close feedback form">✕</button>
            </div>
            <blockquote className="mt-5 max-h-32 overflow-auto border-l-2 border-ember pl-4 text-sm leading-relaxed text-slate">“{selection.text}”</blockquote>
            <label className="mt-5 block text-sm font-semibold text-icewhite">
              Your comment
              <textarea required maxLength={3000} value={comment} onChange={(event) => setComment(event.target.value)} rows={4} className="mt-2 w-full resize-y border border-flame/30 bg-slate-950/60 p-3 font-normal text-fog outline-none focus:border-ember" placeholder="What would you like to add?" />
            </label>
            <label className="mt-4 block text-sm font-semibold text-icewhite">
              Name <span className="font-normal text-slate">(optional)</span>
              <input maxLength={80} value={name} onChange={(event) => setName(event.target.value)} className="mt-2 w-full border border-flame/30 bg-slate-950/60 p-3 font-normal text-fog outline-none focus:border-ember" placeholder="Anonymous" />
            </label>
            {error && <p role="alert" className="mt-4 text-sm text-rose-300">{error}</p>}
            <div className="mt-6 flex items-center justify-between gap-4">
              <Link href="/feedbacks" className="text-sm text-flame hover:underline">View feedbacks</Link>
              <button disabled={busy || !comment.trim()} className="border border-ember bg-ember/10 px-4 py-2 text-sm font-semibold text-icewhite hover:bg-ember/20 disabled:opacity-50">{busy ? "Saving…" : "Submit feedback"}</button>
            </div>
          </form>
        </div>
      )}

      {saved && <div data-feedback-ui role="status" className="fixed bottom-5 right-5 z-[70] border border-flame/30 bg-void px-4 py-3 text-sm text-icewhite shadow-xl">Feedback saved. <Link href="/feedbacks" className="text-flame underline">View feedbacks</Link></div>}
    </>
  );
}
