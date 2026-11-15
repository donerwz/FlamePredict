import type { Metadata } from "next";
import ContentPage from "@/components/content/ContentPage";
import CoolFlameTimeline from "@/components/learned/CoolFlameTimeline";
import RoleStrip from "@/components/learned/RoleStrip";
import SuppressantMatrix from "@/components/learned/SuppressantMatrix";
import { learnedVisuals } from "@/lib/learnedVisuals";
import { pages, resolveCitations } from "@/lib/pages";

export const metadata: Metadata = {
  title: "What we learned — FlamePredict",
  description:
    "What NASA's microgravity combustion investigations say about preventing, detecting and suppressing fires in space, each claim cited to its PSI DOI.",
};

export default function LearnedPage() {
  const { title, lede, sections } = pages.learned;
  const { coolFlame } = learnedVisuals;
  return (
    <ContentPage
      route="/learned"
      title={title}
      lede={lede}
      sections={sections}
      sectionExtras={{
        Suppression: (
          <>
            <SuppressantMatrix />
            <CoolFlameTimeline
              copy={coolFlame}
              cites={resolveCitations(coolFlame.cites)}
            />
          </>
        ),
      }}
    >
      <RoleStrip sections={sections} />
    </ContentPage>
  );
}
