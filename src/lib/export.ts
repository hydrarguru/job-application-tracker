import { importColumns } from '@/lib/import';
import type { StoredJob } from '@/utils/db';

export type ExportFormat = 'csv' | 'xlsx' | 'pdf';

/* Labels for the PDF, already translated by the caller. */
export type PdfLabels = {
    title: string;
    subtitle: string;
    columns: Record<(typeof importColumns)[number], string>;
    employment: { full: string; part: string };
    page: string;
};

function sorted(jobs: StoredJob[]) {
    return [...jobs].sort((a, b) => b.appliedDate.localeCompare(a.appliedDate));
}

/* Same columns and values the importer reads, so an exported file can be imported again. */
function toRows(jobs: StoredJob[]) {
    return sorted(jobs).map((job) => importColumns.map((column) => job[column] ?? ''));
}

function csvCell(value: string) {
    return /[",\r\n;]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
}

export function buildCsv(jobs: StoredJob[]): Blob {
    const lines = [importColumns as readonly string[], ...toRows(jobs)].map((row) => row.map(csvCell).join(','));
    /* The byte order mark makes Excel read the file as UTF-8, so å, ä and ö survive. */
    return new Blob(['﻿' + lines.join('\r\n') + '\r\n'], { type: 'text/csv;charset=utf-8' });
}

export async function buildXlsx(jobs: StoredJob[]): Promise<Blob> {
    const { default: writeXlsxFile } = await import('write-excel-file/universal');
    const widths = [28, 28, 16, 22, 48, 14];
    const header = importColumns.map((column) => ({ value: column, fontWeight: 'bold' as const }));
    const data = [header, ...toRows(jobs).map((row) => row.map((value) => ({ value, type: String })))];
    return writeXlsxFile(data, { columns: widths.map((width) => ({ width })), stickyRowsCount: 1 }).toBlob();
}

export async function buildPdf(jobs: StoredJob[], labels: PdfLabels): Promise<Blob> {
    const [{ jsPDF }, { default: autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
    const lapis: [number, number, number] = [51, 101, 138];
    const ink: [number, number, number] = [19, 32, 43];
    const tint: [number, number, number] = [243, 248, 251];

    const doc = new jsPDF({ orientation: 'landscape', unit: 'pt', format: 'a4' });
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    doc.setFillColor(...lapis);
    doc.rect(0, 0, width, 70, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(20);
    doc.text(labels.title, 40, 36);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(labels.subtitle, 40, 54);

    const columns = importColumns.map((column) => labels.columns[column]);
    const body = sorted(jobs).map((job) => [
        job.companyName,
        job.jobRole,
        job.employmentType ? labels.employment[job.employmentType] : '',
        job.jobArea,
        job.applicationLink,
        job.appliedDate,
    ]);

    autoTable(doc, {
        head: [columns],
        body,
        startY: 90,
        margin: { left: 40, right: 40, bottom: 40 },
        styles: { font: 'helvetica', fontSize: 9, textColor: ink, cellPadding: 6, overflow: 'linebreak' },
        headStyles: { fillColor: lapis, textColor: 255, fontStyle: 'bold' },
        alternateRowStyles: { fillColor: tint },
        columnStyles: { 4: { textColor: lapis, cellWidth: 190 }, 5: { cellWidth: 62 } },
        didDrawPage: ({ pageNumber }) => {
            doc.setFontSize(8);
            doc.setTextColor(91, 107, 120);
            doc.text(`${labels.page} ${pageNumber}`, width - 40, height - 20, { align: 'right' });
        },
    });
    return doc.output('blob');
}

/* Saves a blob through a temporary link, which works in extension pages without extra permissions. */
export function downloadBlob(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
}
