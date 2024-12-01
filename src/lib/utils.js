import jsPDF from 'jspdf';
import QRCode from 'qrcode';

/**
 * Generate PDF for 4x2-inch labels with the QR code alone on the left and all text on the right.
 * @param {Array} data - Parsed data from the Excel file.
 */
export async function generatePDF(data) {
  const pdf = new jsPDF({
    unit: 'in',
    format: [2, 4], // 4 inches wide by 2 inches tall
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

      const qrURL = `https://id.automaster.com.ni/01/${item.gtin}/11/${item['production date']}/21/${serialString}`;
      const qrCode = await QRCode.toDataURL(qrURL);

      // First label: Display model name and count prominently
      if (labelCount === 1) {
        pdf.setFontSize(16); // Larger font size for model and count
        pdf.text(`${model} - Total: ${items.length}`, 1, 1); // Centered top text
        pdf.addPage();
      }

      // Add the QR code alone on the left
      pdf.addImage(qrCode, 'PNG', 0.5, 0.25, 1.5, 1.5); // Position and size: 1.5 x 1.5 inches

      // Add all text on the right
      pdf.setFontSize(12); // Standard font for model and other details
      pdf.text(`Model: ${model}`, 2.2, 0.6); // Model
      pdf.setFontSize(10); // Smaller font for details
      pdf.text(`GTIN: ${item.gtin}`, 2.2, 0.9); // GTIN
      pdf.text(`Production Date: ${item['production date']}`, 2.2, 1.2); // Production Date

      // Serial number with emphasized last two digits
      const serialTextWidth = pdf.getTextWidth(`Serial: ${serialPrefix}`);
      pdf.text(`Serial: ${serialPrefix}`, 2.2, 1.5); // Prefix in regular font
      pdf.setFontSize(14); // Larger font for suffix
      pdf.text(serialSuffix, 2.2 + serialTextWidth + 0.05, 1.5); // Suffix in larger font, closely aligned

      pdf.addPage(); // Add a new page for the next label
      labelCount++;
    }
  }

  // Save the PDF with the dynamically generated file name
  pdf.save(fileName);
}
