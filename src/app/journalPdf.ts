import type { Entry } from "./useEntries";

// Exports the user's dream journal as a print-ready document and opens the
// browser's print dialog (where "Save as PDF" produces the file). No deps —
// we render a styled, self-contained HTML document into a new window.

function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function entryHtml(e: Entry): string {
  const a = e.analysis || ({} as Entry["analysis"]);
  const mood = a.mood?.label ? `${esc(a.mood.label)}` : "—";
  const color = a.mood?.color || "#7c5cff";
  const symbols = (a.symbols ?? [])
    .map(
      (s) =>
        `<li><strong>${esc(s.name)}</strong> — <span class="muted">${esc(s.meaning)}</span></li>`
    )
    .join("");
  const themes = (a.themes ?? []).map((t) => `<span class="tag">${esc(t)}</span>`).join("");

  return `<article class="entry">
    <header>
      <span class="date">${esc(e.date)}</span>
      <span class="mood" style="color:${esc(color)}">${mood}${
    a.mood?.score != null ? ` · ${Math.round(a.mood.score)}%` : ""
  }</span>
    </header>
    <p class="dream">“${esc(e.text)}”</p>
    ${a.summary ? `<p class="summary">${esc(a.summary)}</p>` : ""}
    ${themes ? `<div class="tags">${themes}</div>` : ""}
    ${symbols ? `<ul class="symbols">${symbols}</ul>` : ""}
    ${a.tip ? `<p class="tip"><strong>Tip · </strong>${esc(a.tip)}</p>` : ""}
  </article>`;
}

export function exportJournalPdf(entries: Entry[], userName?: string): void {
  const w = window.open("", "_blank", "noopener,noreferrer,width=900,height=1000");
  if (!w) {
    alert("Please allow pop-ups to export your journal.");
    return;
  }

  const today = new Date().toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const title = userName ? `${userName}'s Dream Journal` : "Dream Journal";

  const doc = `<!doctype html><html><head><meta charset="utf-8"/>
<title>${esc(title)}</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: Inter, system-ui, -apple-system, sans-serif; color: #1c1633; margin: 0; padding: 48px 56px; }
  .cover { border-bottom: 3px solid #7c5cff; padding-bottom: 18px; margin-bottom: 28px; }
  .brand { color: #7c3aed; font-weight: 800; letter-spacing: .03em; font-size: 13px; }
  h1 { font-size: 30px; margin: 8px 0 4px; }
  .meta { color: #6b6390; font-size: 13px; }
  .entry { break-inside: avoid; page-break-inside: avoid; border: 1px solid #e7e3f5; border-radius: 14px; padding: 18px 20px; margin-bottom: 16px; }
  .entry header { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 8px; }
  .date { color: #8a82ad; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: .04em; }
  .mood { font-weight: 700; font-size: 13px; }
  .dream { font-style: italic; color: #3a3357; margin: 0 0 8px; }
  .summary { color: #2a2444; font-size: 14px; line-height: 1.6; margin: 0 0 10px; }
  .tags { margin-bottom: 10px; }
  .tag { display: inline-block; background: #f1edff; color: #6d3bdb; border-radius: 999px; padding: 3px 10px; font-size: 11px; font-weight: 600; margin: 0 6px 6px 0; }
  .symbols { margin: 0 0 10px; padding-left: 18px; font-size: 13px; line-height: 1.6; }
  .muted { color: #6b6390; }
  .tip { background: #faf5ff; border-left: 3px solid #a78bfa; padding: 8px 12px; border-radius: 6px; font-size: 13px; color: #3a3357; margin: 0; }
  footer { margin-top: 26px; color: #9a93b8; font-size: 11px; text-align: center; }
  @media print { body { padding: 24px 28px; } @page { margin: 16mm; } }
</style></head>
<body>
  <div class="cover">
    <div class="brand">✦ SLEEPSCRIBE</div>
    <h1>${esc(title)}</h1>
    <div class="meta">${entries.length} dream${entries.length === 1 ? "" : "s"} · exported ${esc(today)}</div>
  </div>
  ${entries.map(entryHtml).join("")}
  <footer>Decoded with SleepScribe — for personal reflection, not medical advice.</footer>
  <script>window.onload = function(){ setTimeout(function(){ window.print(); }, 300); };</script>
</body></html>`;

  w.document.open();
  w.document.write(doc);
  w.document.close();
}
