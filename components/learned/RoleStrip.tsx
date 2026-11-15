import {
  countWithoutRoles,
  experimentCount,
  learnedVisuals,
  membersOfRole,
} from "@/lib/learnedVisuals";
import type { PageSection, Role } from "@/lib/schema";
import { sectionId } from "@/components/content/sectionId";

const STAGES: Role[] = ["Prevention", "Detection", "Suppression"];

/**
 * Prevent → Detect → Suppress: the three fire-safety roles in order, each
 * with the investigations tagged for it in experiments.json. Doubles as a
 * jump menu to the page sections of the same names.
 */
export default function RoleStrip({ sections }: { sections: PageSection[] }) {
  const { note, remainderLabel } = learnedVisuals.roles;
  const rest = countWithoutRoles(STAGES);

  return (
    <nav aria-label="Fire-safety roles" className="mt-14">
      <ol className="grid gap-y-8 md:grid-cols-3">
        {STAGES.map((role, i) => {
          const members = membersOfRole(role);
          const section = sections.find((s) => s.heading === role);
          return (
            <li
              key={role}
              className="border-t border-flame/20 pt-5 md:border-l md:border-t-0 md:pl-6 md:pt-0 md:first:border-l-0 md:first:pl-0"
            >
              <p className="font-data text-[0.68rem] tracking-[0.14em] text-slate">
                STAGE {i + 1} OF {STAGES.length}
              </p>
              <a
                href={`#${sectionId(role)}`}
                className="mt-2 inline-block text-2xl font-bold tracking-tight text-icewhite transition-colors duration-300 hover:text-flame"
              >
                {role}
              </a>
              {section?.intro && (
                <p className="mt-1 max-w-xs text-sm leading-relaxed text-slate">
                  {section.intro}
                </p>
              )}

              {/* Share of the dataset tagged with this role. */}
              <div
                className="mt-4 h-1 w-full max-w-xs bg-flame/15"
                aria-hidden="true"
              >
                <div
                  className="h-full bg-flame"
                  style={{ width: `${(members.length / experimentCount) * 100}%` }}
                />
              </div>
              <p className="mt-2 font-data text-[0.72rem] tracking-[0.12em] tabular-nums text-flame">
                {members.length} OF {experimentCount} INVESTIGATIONS
              </p>

              <ul className="mt-3 flex max-w-xs flex-wrap gap-x-3 gap-y-1 font-data text-[0.68rem] tracking-[0.08em]">
                {members.map((m) => (
                  <li key={m.acc}>
                    <a
                      href={`https://doi.org/${m.doi}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-fog transition-colors duration-300 hover:text-flame hover:underline"
                      aria-label={`${m.acronym}, ${m.acc}, DOI ${m.doi}`}
                    >
                      {m.acronym} {m.acc}
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          );
        })}
      </ol>
      <p className="mt-6 max-w-2xl text-sm leading-relaxed text-slate">
        {note} {rest} {remainderLabel}
      </p>
    </nav>
  );
}
