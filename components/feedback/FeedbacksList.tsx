"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getFeedbacks, type Feedback } from "@/lib/feedbacks";

export default function FeedbacksList() {
  const [items, setItems] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getFeedbacks()
      .then(setItems)
      .catch((cause: unknown) => setError(cause instanceof Error ? cause.message : "Could not load feedback."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mt-10">
      {loading && <p role="status" className="text-sm text-slate">Loading feedback…</p>}
      {!loading && error && (
        <div role="alert" className="border border-flame/30 p-5 text-sm leading-relaxed text-slate">
          <p>{error}</p>
          <p className="mt-2">Once shared feedback storage is configured, comments from all visitors will appear here.</p>
        </div>
      )}
      {!loading && !error && items.length === 0 && <p className="border-t border-flame/20 py-6 text-sm text-slate">No feedback yet. Select a passage on any page and leave the first comment.</p>}
      {!loading && !error && items.length > 0 && (
        <ol className="divide-y divide-flame/20 border-t border-flame/20">
          {items.map((item) => (
            <li key={item.id} className="grid gap-4 py-6 md:grid-cols-[minmax(0,1fr)_14rem] md:gap-10">
              <div>
                <blockquote className="border-l-2 border-ember pl-4 text-sm leading-relaxed text-slate">“{item.selected_text}”</blockquote>
                <p className="mt-4 whitespace-pre-wrap text-[1rem] leading-relaxed text-icewhite">{item.comment}</p>
              </div>
              <div className="font-data text-[0.68rem] tracking-[0.08em] text-slate">
                <p>{item.display_name || "Anonymous"}</p>
                <time className="mt-2 block" dateTime={item.created_at}>{new Date(item.created_at).toLocaleString()}</time>
                <Link className="mt-2 inline-block text-flame hover:underline" href={item.page_path || "/"}>OPEN PAGE ↗</Link>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
