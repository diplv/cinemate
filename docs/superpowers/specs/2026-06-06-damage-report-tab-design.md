# Damage Report tab — design

Date: 2026-06-06
Status: approved (user, via chat)

## Goal

Add a 5th tab to CineMate, **Damage Report**, where a crew member fills in a
film-production **Loss & Damage Report**, attaches photos, and generates an
**editable `.docx`** that mirrors the studio's existing blank — generated
entirely in the browser (photos never leave the device), one click to download.

## Source of truth

The field set + wording come 1:1 from the user's blank
(`Faila DR_BB kopija.docx`, "LOSS AND DAMAGE REPORT").

## Tab

`app/page.tsx`: grid `grid-cols-4` → `grid-cols-5`; add a `TabsTrigger`
(`value="damage"`, icon `FileWarning`, label "Damage") + `TabsContent`
rendering `<DamageReport />`.

## Form fields (match the blank)

- Header boilerplate (static, printed in the doc): the "must be completed,
  signed and submitted within 24 hours…" + Purchase-Order paragraph.
- Name, Department, Position, Date of Loss/Damage (date input),
  Police Crime Reference # (if over £500).
- Type — two checkboxes: **Lost Property** / **Damaged** (both allowed).
- Manner in which loss and/or damage occurred (textarea).
- Location of loss and/or damage (input).
- Description of lost or damaged item(s) — brand + s/n (textarea).
- Description of damage (textarea).
- **Damage photos** (file input, multiple, image/*) — each with an optional
  caption. Remove per photo. (Placement option **A**, see below.)
- Approximate Replacement Value (input).
- Is the item(s) repairable? (input — free text; blank uses "jā/nē"/notes).
- Repair Estimate (input).
- If rented — Vendor: Name / Address / Phone-or-email / PO # (inputs).
- Signatures (printed as empty ruled lines in the doc, not form fields):
  Employee / Department Head / UPM / Producer / Financial Controller.

All fields optional — never block generation. Empty fields render as blank
lines so the printed doc still matches the blank.

## Photo placement — option A (chosen)

Photos render as a **"Damage photos"** block **immediately after the
"Description of damage"** section (the blank literally says "please attach
photos" there). Each photo: scaled to the page content width (cap ~600px,
height proportional, capped ~420px so portraits don't dominate), centered,
with a caption line beneath ("Photo 1" or the user's caption). Signatures
stay last.

## Output: editable .docx, generated client-side

- New dep: **`docx`** (npm). Built in the browser; `Packer.toBlob()` →
  anchor-click download (no `file-saver` dep, no backend, no upload).
- Image embedding: read each `File` to an `ArrayBuffer` for `ImageRun`;
  read natural dimensions via `createImageBitmap` to compute scaled
  width/height preserving aspect ratio.
- Layout recreated to match the blank: title, boilerplate, a borderless
  2-column table for the top identity fields, the tick-box line (☒/☐ text),
  labelled sections, the photos block, vendor block, ruled signature lines.
- **Footer** (every page, small, muted): `Generated with CineMate` as an
  `ExternalHyperlink` to `https://cinemate-topaz.vercel.app/`.
- Download filename: `Damage-Report_<Name-or-"report">_<date>.docx`
  (sanitised).

## Module boundaries (isolation)

- `lib/damage-report-docx.ts` — pure-ish builder: takes a typed
  `DamageReportData` (fields + `{ bytes: ArrayBuffer, width, height,
  caption }[]` for photos) and returns a `Blob`. No React, no DOM file
  reading inside — the component prepares image bytes/dims and passes them
  in, so the builder is unit-testable in Node.
- `components/calculators/damage-report.tsx` — the form, photo handling
  (read File → ArrayBuffer + dims), and the download trigger.

## Testing

- Unit test for `lib/damage-report-docx.ts`: build a report (with a tiny
  1×1 PNG photo) and assert the returned Blob is a non-empty valid `.docx`
  (PK zip magic bytes) — runnable in Node. Guards the builder against
  runtime errors.
- Manual: fill the form locally, generate, open the `.docx` in Word/Pages.

## Out of scope (YAGNI)

- No persistence / accounts / server storage.
- No repeatable structured "item rows" — items stay free-text like the blank.
- No PDF export (docx is the editable target the user asked for).
- No photo reordering (add/remove + caption only).
