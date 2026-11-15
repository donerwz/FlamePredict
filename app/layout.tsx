import type { Metadata } from "next";
import { fiveBySeven, syne } from "@/lib/fonts";
import Starfield from "@/components/story/Starfield";
import SelectionFeedback from "@/components/feedback/SelectionFeedback";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlamePredict - A Way to Understand Microgravity Combustion",
  description:
    "Summarizes, ranks and interprets 24 NASA PSI microgravity combustion investigations for fire safety on spacecraft, the Moon and Mars.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${fiveBySeven.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Site-wide background; stays mounted across client navigations. */}
        <Starfield />
        {children}
        <SelectionFeedback />
      </body>
    </html>
  );
}
