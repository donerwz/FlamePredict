import type { Metadata } from "next";
import ContentPage from "@/components/content/ContentPage";
import { pages } from "@/lib/pages";

export const metadata: Metadata = {
  title: "What we need to do next — FlamePredict",
  description:
    "The gaps the data can't yet close: partial-gravity combustion, real solids at elevated oxygen, smoke versus lunar dust, and the cool-flame re-ignition hazard.",
};

export default function NextStepsPage() {
  const { title, lede, sections } = pages.next;
  return <ContentPage route="/next" title={title} lede={lede} sections={sections} />;
}
