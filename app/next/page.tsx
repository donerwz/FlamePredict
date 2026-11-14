import type { Metadata } from "next";
import StubPage from "@/components/StubPage";

export const metadata: Metadata = {
  title: "What we need to do next — FlamePredict",
};

export default function NextStepsPage() {
  return (
    <StubPage
      route="/next"
      title="What we need to do next"
      lede="The gaps the data can't yet close: partial-gravity combustion, elevated oxygen on real solids, smoke versus lunar dust, and the cool-flame re-ignition hazard."
      phase={7}
    />
  );
}
