import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// ─────────────────────────────────────────────────────────────────────────────
// Types mirroring the API response shape
// ─────────────────────────────────────────────────────────────────────────────
export interface DeviceDetailExportParams {
  device: {
    id: string;
    name?: string | null;
    type?: string | null;
    status?: string | null;
    lastSeenAt?: string | null;
    firmwareVersion?: string | null;
    location?: string | null;
    latitude?: number | null;
    longitude?: number | null;
    deviceKey?: string | null;
    deviceProfileName?: string | null;
  };
  stats: {
    uptimePercentage?: number;
    dataRate?: string;
    messagesInWindow?: number;
    totalMessages?: number;
    errorCount?: number;
    activeAlarms?: number;
    lastSeenAgo?: string;
  };
  telemetryTrend?: Array<{ key?: string; value?: number | string | boolean; timestamp?: string; bucket?: string }>;
  telemetrySummary?: Array<{
    key?: string;
    avg?: number | null;
    min?: number | null;
    max?: number | null;
    latest?: number | string | null;
    unit?: string;
  }>;
  alarmHistory?: Array<{
    id?: string;
    name?: string;
    message?: string;
    severity?: string;
    status?: string;
    triggeredAt?: string;
  }>;
  hourlyActivity?: Array<{ hour?: string | number; count?: number }>;
  period?: {
    since?: string;
    until?: string;
    days?: number;
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Theme palette
// ─────────────────────────────────────────────────────────────────────────────
const PRIMARY: [number, number, number] = [67, 56, 202]; // #4338ca
const ACCENT: [number, number, number] = [192, 38, 211]; // #c026d3
const SUCCESS: [number, number, number] = [16, 185, 129]; // #10b981
const DANGER: [number, number, number] = [239, 68, 68]; // #ef4444
const WARNING: [number, number, number] = [245, 158, 11]; // #f59e0b
const DARK: [number, number, number] = [31, 41, 55]; // #1f2937
const MUTED: [number, number, number] = [107, 114, 128]; // #6b7280

function statusColor(status: string | null | undefined): [number, number, number] {
  const s = (status || '').toLowerCase();
  if (s === 'online' || s === 'active') return SUCCESS;
  if (s === 'maintenance') return WARNING;
  return DANGER;
}

function severityColor(severity: string | null | undefined): [number, number, number] {
  const s = (severity || '').toLowerCase();
  if (s === 'critical') return DANGER;
  if (s === 'error') return [249, 115, 22]; // orange
  if (s === 'warning') return WARNING;
  return [59, 130, 246]; // blue / info
}

// ─────────────────────────────────────────────────────────────────────────────
// Main export function
// ─────────────────────────────────────────────────────────────────────────────
export const exportDeviceDetailsPdf = ({
  device,
  stats,
  telemetrySummary = [],
  alarmHistory = [],
  period,
}: DeviceDetailExportParams) => {
  const doc = new jsPDF('portrait', 'mm', 'a4');
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const generatedAt = new Date().toLocaleString();
  const margin = 14;

  // ── Helper: advance to new page if needed ──────────────────────────────────
  const ensureSpace = (neededMm: number, currentY: number): number => {
    if (currentY + neededMm > pageH - 20) {
      doc.addPage();
      return 24; // top of new page with a small gap
    }
    return currentY;
  };

  // ── 1. Header banner ──────────────────────────────────────────────────────
  doc.setFillColor(...PRIMARY);
  doc.rect(0, 0, pageW, 32, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('IoT Smart Life — Device Analytics Report', margin, 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${generatedAt}`, pageW - margin, 14, { align: 'right' });
  doc.text(
    `Period: ${period?.since ? new Date(period.since).toLocaleDateString() : 'N/A'} → ${period?.until ? new Date(period.until).toLocaleDateString() : 'N/A'} (${period?.days ?? '?'} day${(period?.days ?? 1) !== 1 ? 's' : ''})`,
    margin,
    22
  );

  // ── 2. Device Identity Card ───────────────────────────────────────────────
  let y = 44;

  doc.setTextColor(...DARK);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('Device Identity', margin, y);
  y += 6;

  const statusCol = statusColor(device.status);
  autoTable(doc, {
    startY: y,
    head: [['Field', 'Value']],
    body: [
      ['Device Name', device.name || 'N/A'],
      ['Device ID', device.id || 'N/A'],
      ['Device Key', device.deviceKey || 'N/A'],
      ['Type', device.type || 'N/A'],
      ['Status', device.status?.toUpperCase() || 'UNKNOWN'],
      ['Location', device.location || 'Unassigned'],
      ['Coordinates', device.latitude != null && device.longitude != null ? `${device.latitude}, ${device.longitude}` : 'N/A'],
      ['Firmware Version', device.firmwareVersion || 'N/A'],
      ['Profile', device.deviceProfileName || 'N/A'],
      ['Last Seen At', device.lastSeenAt ? new Date(device.lastSeenAt).toLocaleString() : 'N/A'],
    ],
    theme: 'grid',
    headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
    bodyStyles: { fontSize: 9, textColor: DARK },
    didDrawCell: (data) => {
      // Highlight status row
      if (data.section === 'body' && data.row.index === 4 && data.column.index === 1) {
        doc.setTextColor(...statusCol);
        doc.setFont('helvetica', 'bold');
        doc.text(
          device.status?.toUpperCase() || 'UNKNOWN',
          data.cell.x + 2,
          data.cell.y + data.cell.height / 2 + 1
        );
        doc.setTextColor(...DARK);
        doc.setFont('helvetica', 'normal');
      }
    },
    margin: { left: margin, right: margin },
  });

  // ── 3. Operational Statistics ─────────────────────────────────────────────
  y = (doc as any).lastAutoTable.finalY + 10;
  y = ensureSpace(45, y);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  doc.text('Operational Statistics', margin, y);
  y += 6;

  autoTable(doc, {
    startY: y,
    head: [['Uptime', 'Data Rate', 'Messages (Window)', 'Total Messages', 'Error Count', 'Active Alarms', 'Last Seen']],
    body: [[
      `${stats.uptimePercentage ?? 0}%`,
      stats.dataRate || 'N/A',
      (stats.messagesInWindow ?? 0).toLocaleString(),
      (stats.totalMessages ?? 0).toLocaleString(),
      (stats.errorCount ?? 0).toString(),
      (stats.activeAlarms ?? 0).toString(),
      stats.lastSeenAgo || 'N/A',
    ]],
    theme: 'grid',
    headStyles: { fillColor: ACCENT, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8, halign: 'center' },
    bodyStyles: { fontSize: 10, fontStyle: 'bold', textColor: DARK, halign: 'center' },
    margin: { left: margin, right: margin },
  });

  // ── 4. Telemetry Summary ───────────────────────────────────────────────────
  if (telemetrySummary.length > 0) {
    y = (doc as any).lastAutoTable.finalY + 10;
    y = ensureSpace(50, y);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...DARK);
    doc.text('Telemetry Summary (per metric)', margin, y);
    y += 6;

    const summaryRows = telemetrySummary.map((s) => {
      const unit = s.unit || '';
      const fmt = (v: number | string | null | undefined) =>
        v != null ? `${isNaN(Number(v)) ? v : Number(v).toFixed(2)}${unit}` : 'N/A';
      return [
        s.key || 'N/A',
        fmt(s.avg),
        fmt(s.min),
        fmt(s.max),
        fmt(s.latest),
      ];
    });

    autoTable(doc, {
      startY: y,
      head: [['Metric', 'Average', 'Minimum', 'Maximum', 'Latest']],
      body: summaryRows,
      theme: 'striped',
      headStyles: { fillColor: PRIMARY, textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 9 },
      bodyStyles: { fontSize: 9, textColor: DARK },
      columnStyles: {
        0: { fontStyle: 'bold' },
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center', fontStyle: 'bold' },
      },
      margin: { left: margin, right: margin },
    });
  } else {
    y = (doc as any).lastAutoTable.finalY + 10;
    y = ensureSpace(18, y);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...MUTED);
    doc.text('No telemetry data available for the selected period.', margin, y);
    y += 10;
  }

  // ── 5. Alarm History ──────────────────────────────────────────────────────
  y = (doc as any).lastAutoTable?.finalY ?? y;
  y += 10;
  y = ensureSpace(50, y);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...DARK);
  doc.text('Alarm History', margin, y);
  y += 6;

  if (alarmHistory.length > 0) {
    const alarmRows = alarmHistory.map((alarm, idx) => [
      (idx + 1).toString(),
      alarm.name || 'N/A',
      alarm.severity?.toUpperCase() || 'N/A',
      alarm.status?.toUpperCase() || 'N/A',
      alarm.triggeredAt ? new Date(alarm.triggeredAt).toLocaleString() : 'N/A',
      alarm.message || '',
    ]);

    autoTable(doc, {
      startY: y,
      head: [['#', 'Name', 'Severity', 'Status', 'Triggered At', 'Message']],
      body: alarmRows,
      theme: 'striped',
      headStyles: { fillColor: [239, 68, 68], textColor: [255, 255, 255], fontStyle: 'bold', fontSize: 8 },
      bodyStyles: { fontSize: 8, textColor: DARK },
      didDrawCell: (data) => {
        if (data.section === 'body' && data.column.index === 2) {
          const sev = alarmHistory[data.row.index]?.severity || '';
          doc.setTextColor(...severityColor(sev));
          doc.setFont('helvetica', 'bold');
          const cellText = sev.toUpperCase();
          doc.text(
            cellText,
            data.cell.x + 2,
            data.cell.y + data.cell.height / 2 + 1
          );
          doc.setTextColor(...DARK);
          doc.setFont('helvetica', 'normal');
        }
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 40, fontStyle: 'bold' },
        2: { cellWidth: 22, halign: 'center' },
        3: { cellWidth: 22, halign: 'center' },
        4: { cellWidth: 42 },
        5: { cellWidth: 'auto', fontSize: 7 },
      },
      margin: { left: margin, right: margin },
    });
  } else {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(...MUTED);
    doc.text('No alarms recorded for this period.', margin, y);
    y += 10;
  }

  // ── 6. Footer on every page ───────────────────────────────────────────────
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);

    // Bottom rule
    doc.setDrawColor(...MUTED);
    doc.setLineWidth(0.3);
    doc.line(margin, pageH - 14, pageW - margin, pageH - 14);

    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MUTED);
    doc.text(
      `IoT Smart Life Platform — Device Detail Report | ${device.name || device.id}`,
      margin,
      pageH - 8
    );
    doc.text(`Page ${i} of ${totalPages}`, pageW - margin, pageH - 8, { align: 'right' });
  }

  // ── Save ──────────────────────────────────────────────────────────────────
  const safeName = (device.name || device.id || 'device').replace(/[^a-z0-9]/gi, '_');
  const date = new Date().toISOString().slice(0, 10);
  doc.save(`Device_Analytics_${safeName}_${date}.pdf`);
};
