import type { Metadata } from "next";
import StubPage from "@/components/StubPage";

export const metadata: Metadata = {
  title: "What we learned — FlamePredict",
};

export default function LearnedPage() {
  return (
    <StubPage
      route="/learned"
      title="What we learned"
      lede="The synthesis of two decades of microgravity combustion research, grouped by prevention, detection and suppression — each claim cited to its PSI investigation."
      phase={7}
    />
  );
}
