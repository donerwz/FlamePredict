import pagesData from "@/data/pages.json";
import { experiments } from "./experiments";
import { PagesFileSchema, type PagesFile } from "./schema";

/**
 * data/pages.json parsed through zod at build time. Every cited PSI ID must
 * exist in the dataset, so a page can never cite an investigation we don't
 * have (or link a DOI that isn't in experiments.json).
 */
export const pages: PagesFile = PagesFileSchema.parse(pagesData);

export interface Citation {
  acc: string;
  acronym: string;
  doi: string;
}

const byAcc = new Map(experiments.map((e) => [e.acc, e]));

for (const page of [pages.moon, pages.learned, pages.next]) {
  for (const section of page.sections) {
    for (const item of section.items) {
      if (item.cites.length === 0 && !item.brief) {
        throw new Error(`pages.json: "${item.title}" cites no source`);
      }
      for (const acc of item.cites) {
        if (!byAcc.has(acc)) {
          throw new Error(`pages.json: "${item.title}" cites unknown ${acc}`);
        }
      }
    }
  }
}

export function resolveCitations(accs: string[]): Citation[] {
  return accs.map((acc) => {
    const e = byAcc.get(acc)!;
    return { acc, acronym: e.acronym, doi: e.doi };
  });
}
