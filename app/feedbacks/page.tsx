import type { Metadata } from "next";
import Link from "next/link";
import FeedbacksList from "@/components/feedback/FeedbacksList";

export const metadata: Metadata = {
  title: "Feedbacks — FlamePredict",
  description: "Comments and feedback shared by FlamePredict readers.",
};

export default function FeedbacksPage() {
  return (
    <main className="mx-auto min-h-svh w-full px-[clamp(1rem,3vw,3rem)] pb-24 pt-8 md:pt-12">
      <Link href="/" className="text-lg font-bold tracking-tight text-icewhite">FlamePredict</Link>
      <nav className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm font-semibold" aria-label="Sections">
        <Link href="/explore" className="text-slate hover:text-fog">Explore</Link>
        <Link href="/moon" className="text-slate hover:text-fog">Moon base</Link>
        <Link href="/learned" className="text-slate hover:text-fog">What we learned</Link>
        <Link href="/next" className="text-slate hover:text-fog">What's next</Link>
        <span aria-current="page" className="text-icewhite">Feedbacks</span>
      </nav>
      <h1 className="mt-16 text-[clamp(2rem,5vw,3.3rem)] font-bold leading-tight tracking-tight text-icewhite">Feedbacks</h1>
      <p className="mt-4 max-w-2xl leading-relaxed text-slate">Reader comments on passages across the site. Select any text to leave feedback.</p>
      <FeedbacksList />
    </main>
  );
}
