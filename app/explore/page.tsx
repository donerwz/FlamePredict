import type { Metadata } from "next";
import ExploreHub from "@/components/tabs/ExploreHub";
import { experimentsByRank } from "@/lib/experiments";
import {
  hardwareFamily,
  overviewStats,
  type ExperimentWithFamily,
} from "@/lib/stats";
import { vizExperiments } from "@/lib/conditions";

export const metadata: Metadata = {
  title: "Explore the experiments — FlamePredict",
  description:
    "Data overview, ranked experiments, visualizations and the Flames in Freefall simulation — 24 NASA PSI microgravity combustion investigations.",
};

// All data is derived server-side from the zod-validated dataset at build time
// and handed to the client as props, so client bundles never import the JSON.
export default function ExplorePage() {
  const all: ExperimentWithFamily[] = experimentsByRank.map((e) => ({
    ...e,
    family: hardwareFamily(e) ?? "Other",
  }));

  return (
    <ExploreHub
      stats={overviewStats()}
      top={experimentsByRank.slice(0, 5)}
      all={all}
      viz={vizExperiments()}
    />
  );
}
