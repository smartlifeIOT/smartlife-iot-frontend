import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface DeviceItemExport {
  id: string;
  name?: string;
  type?: string;
  status?: string;
  dataGeneratedBytes?: number;
  lastSeenAt?: string;
  uptimePercentage?: number;
  activeAlarms?: number;
  alarmCount?: number;
}

export interface ExportPdfParams {
  timeRange: string;
  deviceType?: string;
  status?: string;
  devices: DeviceItemExport[];
  topGenerators?: { name?: string; dataGeneratedBytes?: number }[];
  statusDistribution?: { online?: number; offline?: number; maintenance?: number };
  totalDevices: number;
}

export const exportDeviceAnalyticsPdf = ({
  timeRange,
  deviceType,
  status,
  devices,
  topGenerators = [],
  statusDistribution = { online: 0, offline: 0, maintenance: 0 },
  totalDevices,
}: ExportPdfParams) => {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  const pageWidth = doc.internal.pageSize.getWidth();
  const generatedAt = new Date().toLocaleString();

  // Primary Theme Colors
  const primaryColor: [number, number, number] = [67, 56, 202]; // #4338ca
  const secondaryColor: [number, number, number] = [192, 38, 211]; // #c026d3
  const darkTextColor: [number, number, number] = [31, 41, 55]; // #1f2937

  // Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, pageWidth, 28, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('IoT Smart Life - Devices Analytics Report', 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(`Generated: ${generatedAt}`, pageWidth - 14, 18, { align: 'right' });

  // Filter Parameters Section
  doc.setTextColor(...darkTextColor);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('Report Filters & Summary', 14, 36);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text(
    `Time Range: ${timeRange || 'Last 24h'} | Device Type: ${deviceType || 'All Types'} | Status Filter: ${status || 'All Statuses'}`,
    14,
    42
  );

  // Executive Summary Metrics (Key Indicators Grid)
  const onlineCount = statusDistribution.online || 0;
  const offlineCount = statusDistribution.offline || 0;
  const maintCount = statusDistribution.maintenance || 0;
  const totalDataBytes = devices.reduce((sum, d) => sum + (d.dataGeneratedBytes || 0), 0);

  autoTable(doc, {
    startY: 47,
    head: [['Total Devices', 'Online Devices', 'Offline Devices', 'Maintenance', 'Total Data Generated']],
    body: [
      [
        `${totalDevices}`,
        `${onlineCount}`,
        `${offlineCount}`,
        `${maintCount}`,
        `${totalDataBytes.toFixed(2)} MB`,
      ],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 9,
      halign: 'center',
    },
    bodyStyles: {
      fontSize: 10,
      fontStyle: 'bold',
      textColor: darkTextColor,
      halign: 'center',
    },
    margin: { left: 14, right: 14 },
  });

  // Comprehensive Devices Inventory Table
  let currentY = (doc as any).lastAutoTable.finalY + 10;

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...darkTextColor);
  doc.text('Detailed Devices Metadata & Operating Status', 14, currentY);

  const deviceRows = devices.map((dev, idx) => {
    const isOnline = dev.status === 'active' || dev.status === 'online';
    const statusText = isOnline
      ? 'Online'
      : dev.status === 'maintenance'
      ? 'Maintenance'
      : 'Offline';
    const lastActiveText = dev.lastSeenAt
      ? new Date(dev.lastSeenAt).toLocaleString()
      : 'N/A';
    const dataGen = `${dev.dataGeneratedBytes || 0} MB`;
    const uptime = `${dev.uptimePercentage || 0}%`;
    const alerts = (dev.activeAlarms || dev.alarmCount || 0).toString();

    return [
      (idx + 1).toString(),
      dev.name || 'Unknown',
      dev.id || 'N/A',
      dev.type || 'N/A',
      statusText,
      dataGen,
      uptime,
      alerts,
      lastActiveText,
    ];
  });

  autoTable(doc, {
    startY: currentY + 4,
    head: [
      [
        '#',
        'Device Name',
        'Device ID',
        'Type',
        'Status',
        'Data (MB)',
        'Uptime',
        'Alerts',
        'Last Active',
      ],
    ],
    body:
      deviceRows.length > 0
        ? deviceRows
        : [['-', 'No device data available', '-', '-', '-', '-', '-', '-', '-']],
    theme: 'striped',
    headStyles: {
      fillColor: secondaryColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8,
    },
    bodyStyles: { fontSize: 8, textColor: darkTextColor },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 45, fontStyle: 'bold' },
      2: { cellWidth: 65, fontSize: 7 },
      3: { cellWidth: 30 },
      4: { cellWidth: 25, halign: 'center' },
      5: { cellWidth: 25, halign: 'right' },
      6: { cellWidth: 20, halign: 'right' },
      7: { cellWidth: 18, halign: 'center' },
      8: { cellWidth: 38, fontSize: 7 },
    },
    margin: { left: 14, right: 14 },
  });

  // Top Data Generators Summary Table
  if (topGenerators.length > 0) {
    currentY = (doc as any).lastAutoTable.finalY + 10;

    if (currentY > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...darkTextColor);
    doc.text('Top Data Generating Devices', 14, currentY);

    const topGenRows = topGenerators.map((gen, idx) => [
      `#${idx + 1}`,
      gen.name || 'Unknown',
      `${gen.dataGeneratedBytes || 0} MB`,
    ]);

    autoTable(doc, {
      startY: currentY + 4,
      head: [['Rank', 'Device Name', 'Data Volume']],
      body: topGenRows,
      theme: 'grid',
      headStyles: {
        fillColor: primaryColor,
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        fontSize: 8,
      },
      bodyStyles: { fontSize: 8, textColor: darkTextColor },
      margin: { left: 14, right: 14 },
    });
  }

  // Footer on all pages
  const totalPages = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(150, 150, 150);
    doc.text(
      `IoT Smart Life Platform - Confidential Devices Analytics Report`,
      14,
      doc.internal.pageSize.getHeight() - 8
    );
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth - 14,
      doc.internal.pageSize.getHeight() - 8,
      { align: 'right' }
    );
  }

  // Save the PDF file
  const fileName = `Device_Analytics_Report_${new Date().toISOString().slice(0, 10)}.pdf`;
  doc.save(fileName);
};
