import jsPDF from "jspdf";

/**
 * Export data rows as a PDF table (RTL-friendly, Arabic text)
 */
export function exportTablePdf(
  title: string,
  headers: string[],
  rows: string[][],
  filename: string = "export.pdf"
) {
  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  
  // Title
  doc.setFontSize(16);
  doc.text(title, doc.internal.pageSize.width / 2, 15, { align: "center" });
  doc.setFontSize(8);
  doc.text(`Generated: ${new Date().toLocaleDateString("ar-EG")}`, doc.internal.pageSize.width / 2, 21, { align: "center" });
  
  // Table setup
  const startY = 28;
  const marginX = 10;
  const pageW = doc.internal.pageSize.width - marginX * 2;
  const colW = pageW / headers.length;
  const rowH = 8;
  const headerH = 10;
  
  let y = startY;
  
  // Header
  doc.setFillColor(41, 128, 185);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.rect(marginX, y, pageW, headerH, "F");
  headers.forEach((h, i) => {
    doc.text(h, marginX + i * colW + colW / 2, y + headerH / 2 + 2, { align: "center" });
  });
  y += headerH;
  
  // Rows
  doc.setTextColor(51, 51, 51);
  doc.setFontSize(8);
  
  rows.forEach((row, ri) => {
    if (y + rowH > doc.internal.pageSize.height - 15) {
      doc.addPage();
      y = 15;
      // Re-draw header on new page
      doc.setFillColor(41, 128, 185);
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.rect(marginX, y, pageW, headerH, "F");
      headers.forEach((h, i) => {
        doc.text(h, marginX + i * colW + colW / 2, y + headerH / 2 + 2, { align: "center" });
      });
      y += headerH;
      doc.setTextColor(51, 51, 51);
      doc.setFontSize(8);
    }
    
    if (ri % 2 === 0) {
      doc.setFillColor(245, 247, 250);
      doc.rect(marginX, y, pageW, rowH, "F");
    }
    
    row.forEach((cell, ci) => {
      const truncated = cell.length > 30 ? cell.slice(0, 30) + ".." : cell;
      doc.text(truncated, marginX + ci * colW + colW / 2, y + rowH / 2 + 2, { align: "center" });
    });
    y += rowH;
  });
  
  // Footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text(`Page ${i} / ${pageCount}`, doc.internal.pageSize.width / 2, doc.internal.pageSize.height - 5, { align: "center" });
  }
  
  doc.save(filename);
}

/**
 * Export data as CSV download
 */
export function exportTableCsv(
  headers: string[],
  rows: string[][],
  filename: string = "export.csv"
) {
  const bom = "\uFEFF"; // UTF-8 BOM for Arabic
  const csv = [headers.join(","), ...rows.map(r => r.map(c => `"${c.replace(/"/g, '""')}"`).join(","))].join("\n");
  const blob = new Blob([bom + csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = filename;
  link.click();
}
