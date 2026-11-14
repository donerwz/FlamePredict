import Landing from "@/components/story/Landing";
import { experiments, experimentsFile } from "@/lib/experiments";

// Server component: stats come from the zod-validated dataset at build time,
// so the landing numbers can never drift from data/experiments.json.
export default function Home() {
  const flight = experiments.filter((e) => e.type === "Flight").length;

  return (
    <Landing
      count={experimentsFile.count}
      totalTb={experimentsFile.total_size_tb}
      flight={flight}
      ground={experimentsFile.count - flight}
    />
  );
}
