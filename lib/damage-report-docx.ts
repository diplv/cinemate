// Builds an editable Loss & Damage Report .docx from typed form data, in the
// browser. Pure-ish: takes already-decoded photo bytes + dimensions so it has
// no DOM/File dependency and is unit-testable in Node. Layout mirrors the
// studio blank (Faila DR_BB). See docs/superpowers/specs/2026-06-06-…
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  BorderStyle,
  ImageRun,
  ExternalHyperlink,
  AlignmentType,
  Footer,
} from "docx";

export const CINEMATE_URL = "https://cinemate-topaz.vercel.app/";

export type PhotoFileType = "png" | "jpg" | "gif" | "bmp";

export interface DamagePhoto {
  data: ArrayBuffer | Uint8Array;
  /** Scaled display size in px (aspect-correct), computed by the caller. */
  width: number;
  height: number;
  caption: string;
  type: PhotoFileType;
}

export interface DamageReportData {
  name: string;
  department: string;
  position: string;
  dateOfDamage: string;
  policeRef: string;
  lost: boolean;
  damaged: boolean;
  manner: string;
  location: string;
  itemsDescription: string;
  damageDescription: string;
  replacementValue: string;
  repairable: string;
  repairEstimate: string;
  vendorName: string;
  vendorAddress: string;
  vendorContact: string;
  vendorPo: string;
  photos: DamagePhoto[];
}

const INK = "1A1612";
const MUTED = "6E6155";

function labelValue(label: string, value: string): Paragraph {
  return new Paragraph({
    spacing: { after: 120 },
    children: [
      new TextRun({ text: `${label}: `, bold: true, color: INK }),
      new TextRun({ text: value || "", color: INK }),
    ],
  });
}

function sectionLabel(label: string): Paragraph {
  return new Paragraph({
    spacing: { before: 160, after: 40 },
    children: [new TextRun({ text: label, bold: true, color: INK })],
  });
}

function bodyText(value: string): Paragraph {
  return new Paragraph({
    spacing: { after: 80 },
    children: [new TextRun({ text: value || "", color: INK })],
  });
}

function signatureLine(label: string): Paragraph {
  return new Paragraph({
    spacing: { before: 200 },
    children: [
      new TextRun({ text: `${label}  `, bold: true, color: INK }),
      new TextRun({ text: "_".repeat(45), color: MUTED }),
    ],
  });
}

const NO_BORDER = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" } as const;
const CELL_BORDERS = {
  top: NO_BORDER,
  bottom: NO_BORDER,
  left: NO_BORDER,
  right: NO_BORDER,
};

function identityRow(label: string, value: string): TableRow {
  return new TableRow({
    children: [
      new TableCell({
        width: { size: 32, type: WidthType.PERCENTAGE },
        borders: CELL_BORDERS,
        children: [
          new Paragraph({ children: [new TextRun({ text: label, bold: true, color: INK })] }),
        ],
      }),
      new TableCell({
        width: { size: 68, type: WidthType.PERCENTAGE },
        borders: CELL_BORDERS,
        children: [new Paragraph({ children: [new TextRun({ text: value || "", color: INK })] })],
      }),
    ],
  });
}

function photoBlock(photos: DamagePhoto[]): Paragraph[] {
  if (photos.length === 0) return [];
  const out: Paragraph[] = [sectionLabel("Damage photos")];
  photos.forEach((p, i) => {
    out.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 40 },
        children: [
          new ImageRun({
            type: p.type,
            data: p.data,
            transformation: { width: p.width, height: p.height },
          }),
        ],
      }),
    );
    out.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: p.caption ? `Photo ${i + 1} — ${p.caption}` : `Photo ${i + 1}`,
            italics: true,
            color: MUTED,
            size: 18,
          }),
        ],
      }),
    );
  });
  return out;
}

function tick(on: boolean): string {
  return on ? "☒" : "☐";
}

export function buildDamageReportDoc(data: DamageReportData): Document {
  const children: (Paragraph | Table)[] = [
    new Paragraph({
      spacing: { after: 120 },
      children: [new TextRun({ text: "LOSS AND DAMAGE REPORT", bold: true, size: 32, color: INK })],
    }),
    new Paragraph({
      spacing: { after: 80 },
      children: [
        new TextRun({
          text: "This Loss & Damage report must be completed, signed and submitted to the Production Office within 24 hours of the loss and/or damage.",
          color: MUTED,
          size: 18,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 160 },
      children: [
        new TextRun({
          text: "If there will be an anticipated cost involved in the repair/replacement of the item(s) listed below, a Purchase Order must also be completed and returned along with a copy of this report attached. Thank you.",
          color: MUTED,
          size: 18,
        }),
      ],
    }),
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: NO_BORDER,
        bottom: NO_BORDER,
        left: NO_BORDER,
        right: NO_BORDER,
        insideHorizontal: NO_BORDER,
        insideVertical: NO_BORDER,
      },
      rows: [
        identityRow("Name", data.name),
        identityRow("Department", data.department),
        identityRow("Position", data.position),
        identityRow("Date of Loss/Damage", data.dateOfDamage),
        identityRow("Police Crime Reference # (if over £500)", data.policeRef),
      ],
    }),
    new Paragraph({
      spacing: { before: 160, after: 80 },
      children: [
        new TextRun({ text: "Please indicate:  ", bold: true, color: INK }),
        new TextRun({ text: `${tick(data.lost)} Lost Property      `, color: INK }),
        new TextRun({ text: `${tick(data.damaged)} Damaged`, color: INK }),
      ],
    }),
    sectionLabel("Manner in which loss and/or damage occurred:"),
    bodyText(data.manner),
    labelValue("Location of loss and/or damage", data.location),
    sectionLabel(
      "Description of lost or damaged item(s) (include brand name / specific identifying information):",
    ),
    bodyText(data.itemsDescription),
    sectionLabel("Description of damage:"),
    bodyText(data.damageDescription),
    ...photoBlock(data.photos),
    labelValue("Approximate Replacement Value", data.replacementValue),
    labelValue("Is the item(s) repairable?", data.repairable),
    labelValue("Repair Estimate (if applicable)", data.repairEstimate),
    sectionLabel("If rented, Vendor information:"),
    labelValue("Name", data.vendorName),
    labelValue("Address", data.vendorAddress),
    labelValue("Phone number and/or email", data.vendorContact),
    labelValue("PO # (if applicable)", data.vendorPo),
    signatureLine("EMPLOYEE"),
    signatureLine("DEPARTMENT HEAD"),
    signatureLine("UPM"),
    signatureLine("PRODUCER"),
    signatureLine("FINANCIAL CONTROLLER"),
  ];

  return new Document({
    sections: [
      {
        properties: {},
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new ExternalHyperlink({
                    link: CINEMATE_URL,
                    children: [
                      new TextRun({ text: "Generated with CineMate", color: MUTED, size: 14 }),
                    ],
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });
}

/** Browser entry point: build the doc and return a downloadable Blob. */
export async function buildDamageReportBlob(data: DamageReportData): Promise<Blob> {
  const doc = buildDamageReportDoc(data);
  return Packer.toBlob(doc);
}

/** Node/test entry point: build the doc and return the raw bytes. */
export async function buildDamageReportBuffer(data: DamageReportData): Promise<Buffer> {
  const doc = buildDamageReportDoc(data);
  return Packer.toBuffer(doc);
}

export function damageReportFilename(name: string, date: string): string {
  const who = (name || "report").trim().replace(/[^a-zA-Z0-9-]+/g, "-").replace(/^-+|-+$/g, "");
  const when = (date || "").trim().replace(/[^0-9.\-]/g, "") || "undated";
  return `Damage-Report_${who || "report"}_${when}.docx`;
}
