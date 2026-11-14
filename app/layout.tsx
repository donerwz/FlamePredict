import type { Metadata } from "next";
import { fiveBySeven, syne } from "@/lib/fonts";
import "./globals.css";

export const metadata: Metadata = {
  title: "FlamePredict — NASA PSI microgravity combustion",
  description:
    "Summarizes, ranks and interprets 24 NASA PSI microgravity combustion investigations for fire safety on spacecraft, the Moon and Mars.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${syne.variable} ${fiveBySeven.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
