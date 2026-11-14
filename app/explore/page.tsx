import type { Metadata } from "next";
import StubPage from "@/components/StubPage";
import { experimentsFile } from "@/lib/experiments";

export const metadata: Metadata = {
  title: "Explore the experiments — FlamePredict",
};

export default function ExplorePage() {
  return (
    <StubPage
      route="/explore"
      title="Explore the experiments"
      lede={`Data overview, the ranked list of all ${experimentsFile.count} investigations, visualizations, and the Flames in Freefall simulation.`}
      phase={3}
    />
  );
}
