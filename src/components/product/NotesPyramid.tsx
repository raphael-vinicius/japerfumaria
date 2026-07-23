import type { FragranceNotes } from "@/lib/types";

const tiers: { key: keyof FragranceNotes; label: string; hint: string }[] = [
  { key: "top", label: "Saída", hint: "As primeiras impressões" },
  { key: "heart", label: "Corpo", hint: "O coração da fragrância" },
  { key: "base", label: "Fundo", hint: "O rastro que permanece" },
];

export function NotesPyramid({ notes }: { notes: FragranceNotes }) {
  return (
    <div className="grid gap-4">
      {tiers.map((tier) => (
        <div key={tier.key} className="flex gap-4">
          <div className="w-20 shrink-0 pt-0.5">
            <p className="text-sm font-semibold text-ink">{tier.label}</p>
            <p className="text-xs text-ink-500">{tier.hint}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {notes[tier.key].map((note) => (
              <span
                key={note}
                className="rounded-full border border-champagne/30 bg-champagne-soft/30 px-3 py-1.5 text-xs font-medium text-ink-700"
              >
                {note}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
