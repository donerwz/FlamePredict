import type { Metadata } from "next";
import StubPage from "@/components/StubPage";

export const metadata: Metadata = {
  title: "Flames on a Moon base — FlamePredict",
};

export default function MoonPage() {
  return (
    <StubPage
      route="/moon"
      title="Flames on a Moon base"
      lede="How exploration atmospheres — more oxygen at lower pressure — change fire behaviour, and which PSI experiments bound the risk."
      phase={7}
    />
  );
}
