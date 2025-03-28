import jsPDF from 'jspdf';
import QRCode from 'qrcode';

/**
 * Generate PDF for 1x2-inch labels with the QR code alone on the left and all text on the right.
 * @param {Array} data - Parsed data from the Excel file.
 */
export async function generatePDF(data) {
  const pdf = new jsPDF({
    unit: 'in',
    format: [2, 1], // 2 inches wide by 1 inch tall
    orientation: 'landscape',
  });

  // Get current date and time for the file name
  const now = new Date();
  const day = String(now.getDate()).padStart(2, '0');
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const hour = String(now.getHours()).padStart(2, '0');
  const minute = String(now.getMinutes()).padStart(2, '0');
  const second = String(now.getSeconds()).padStart(2, '0');
  const fileName = `labels_${day}${month}_${hour}${minute}${second}.pdf`;

  // Group data by model
  const groupedData = data.reduce((acc, item) => {
    acc[item.model] = acc[item.model] || [];
    acc[item.model].push(item);
    return acc;
  }, {});

  for (const [model, items] of Object.entries(groupedData)) {
    let labelCount = 1;

    for (const item of items) {
      const serialString = String(item.serial);
      const serialPrefix = serialString.slice(0, -2); // Extract all but the last two digits
      const serialSuffix = serialString.slice(-2);   // Extract the last two digits

      const qrURL = `https://auto.gs1ni.org/01/${item.gtin}/11/${item['production date']}/21/${serialString}`;
      const qrCode = await QRCode.toDataURL(qrURL);

      // First label: Display model name and count prominently
      if (labelCount === 1) {
        pdf.setFontSize(11);
        pdf.text(`${model.toUpperCase()} - TOTAL: ${items.length}`, 0.5, 0.5);
        pdf.addPage();
      }

      // Add the QR code centered horizontally on the left half
      const qrSize = 0.7 * 1.03; // 3% larger than original 0.7 inches
      const leftEdge = 0.5 - (qrSize / 2); // Center of left half (0.5) minus half the QR code width
      pdf.addImage(qrCode, 'PNG', leftEdge, 0.15, qrSize, qrSize);

      // Use consistent font size (7pt) for all data
      const standardFontSize = 7;
      pdf.setFontSize(standardFontSize);
      
      // Add text on the right, all in uppercase
      pdf.text(`MODEL: ${model.toUpperCase()}`, 0.9, 0.3);
      pdf.text(`GTIN: ${item.gtin}`, 0.9, 0.45);
      pdf.text(`DATE: ${item['production date']}`, 0.9, 0.6);

      // Serial number with prefix in standard font and suffix in larger font
      const serialPrefixText = `S/N: ${serialPrefix}`;
      const serialTextWidth = pdf.getTextWidth(serialPrefixText);
      pdf.text(serialPrefixText.toUpperCase(), 0.9, 0.75);
      
      // Use larger font size for the suffix (last two digits)
      pdf.setFontSize(10); // Oversized suffix for easy reading
      pdf.text(serialSuffix, 0.9 + serialTextWidth + 0.02, 0.75);
      
      // Add warranty text at the bottom of the label
      pdf.setFontSize(5); // Smaller font for warranty text
      pdf.text("GARANTÍA ANULADA SI SE REMUEVE", 1, 0.95, { align: "center" });

      pdf.addPage(); // Add a new page for the next label
      labelCount++;
    }
  }

  // Save the PDF with the dynamically generated file name
  pdf.save(fileName);
}