import type { Metadata } from "next";
import ContentPage from "@/components/content/ContentPage";
import { pages } from "@/lib/pages";

export const metadata: Metadata = {
  title: "What we learned — FlamePredict",
  description:
    "What NASA's microgravity combustion investigations say about preventing, detecting and suppressing fires in space, each claim cited to its PSI DOI.",
};

export default function LearnedPage() {
  const { title, lede, sections } = pages.learned;
  return (
    <ContentPage route="/learned" title={title} lede={lede} sections={sections} />
  );
}
