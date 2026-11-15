/** Anchor id for a content-page section heading ("What's next" → "whats-next"). */
export function sectionId(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
