import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export async function exportPDF(elementId: string, filename = 'myqi-resultado.pdf') {
  const el = document.getElementById(elementId);
  if (!el) return;
  const canvas = await html2canvas(el, { backgroundColor: getComputedStyle(document.body).backgroundColor, scale: 2 });
  const img = canvas.toDataURL('image/png');
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
  const pageW = pdf.internal.pageSize.getWidth();
  const pageH = pdf.internal.pageSize.getHeight();
  const ratio = Math.min(pageW / canvas.width, pageH / canvas.height);
  const w = canvas.width * ratio;
  const h = canvas.height * ratio;
  pdf.addImage(img, 'PNG', (pageW - w) / 2, 20, w, h);
  pdf.save(filename);
}
