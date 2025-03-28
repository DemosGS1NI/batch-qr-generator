/**
 * Generate ZPL code for 1x2-inch labels with text representation of QR codes
 * @param {Array} data - Parsed data from the Excel file.
 * @returns {string} - ZPL code that can be sent directly to the printer
 */
export async function generateZPL(data) {
  // Group data by model
  const groupedData = data.reduce((acc, item) => {
    acc[item.model] = acc[item.model] || [];
    acc[item.model].push(item);
    return acc;
  }, {});

  let zplOutput = '';
  
  // Set printer to use 203 DPI (common for ZD220)
  const dpi = 203;

  // ZPL header - Set to 2" x 1" label size
  const labelWidth = 2 * dpi; // 2 inches in dots
  const labelHeight = 1 * dpi; // 1 inch in dots
  
  // Basic ZPL commands to start the label format
  const zplHeader = `^XA
^PW${labelWidth}
^LL${labelHeight}
^LH0,0
`;
  
  // ZPL footer
  const zplFooter = `^XZ`;

  for (const [model, items] of Object.entries(groupedData)) {
    // First label: model name and count summary
    zplOutput += zplHeader;
    zplOutput += `^FO${dpi/4},${dpi/4}^A0N,24,24^FD${model} - Total: ${items.length}^FS`;
    zplOutput += zplFooter;
    
    for (const item of items) {
      const serialString = String(item.serial);
      const serialPrefix = serialString.slice(0, -2);
      const serialSuffix = serialString.slice(-2);
      
      // Generate QR code data URL
      const qrURL = `https://id.website.com/01/${item.gtin}/11/${item['production date']}/21/${serialString}`;
      
      // Start the label
      zplOutput += zplHeader;
      
      // Add QR Code - positioned on the left side
      zplOutput += `^FO20,30^BQN,2,6^FDQA,${qrURL}^FS`;
      
      // Add text fields on the right side
      zplOutput += `^FO${Math.round(dpi * 0.9)},${Math.round(dpi * 0.3)}^A0N,20,20^FDModel: ${model}^FS`;
      zplOutput += `^FO${Math.round(dpi * 0.9)},${Math.round(dpi * 0.45)}^A0N,18,18^FDGTIN: ${item.gtin}^FS`;
      zplOutput += `^FO${Math.round(dpi * 0.9)},${Math.round(dpi * 0.6)}^A0N,18,18^FDDate: ${item['production date']}^FS`;
      zplOutput += `^FO${Math.round(dpi * 0.9)},${Math.round(dpi * 0.75)}^A0N,18,18^FDS/N: ${serialPrefix}^FS`;
      
      // Position the suffix immediately after the prefix with larger font
      const prefixTextWidth = serialPrefix.length * 10; // estimate width based on character count
      zplOutput += `^FO${Math.round(dpi * 0.9 + prefixTextWidth + 30)},${Math.round(dpi * 0.75)}^A0N,22,22^FD${serialSuffix}^FS`;
      
      // End the label
      zplOutput += zplFooter;
    }
  }
  
  return zplOutput;
}

/**
 * Creates a downloadable ZPL file
 * @param {string} zplCode - The ZPL code
 */
export function downloadZPL(zplCode) {
  const blob = new Blob([zplCode], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const now = new Date();
  const timestamp = `${now.getDate()}${now.getMonth()+1}_${now.getHours()}${now.getMinutes()}${now.getSeconds()}`;
  
  a.href = url;
  a.download = `zebra_labels_${timestamp}.zpl`;
  document.body.appendChild(a);
  a.click();
  
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 100);
}

/**
 * Attempts to print ZPL directly to a Zebra printer via the browser
 * @param {string} zplCode - The ZPL code to print
 */
export async function printZPL(zplCode) {
  try {
    // Create a Blob containing the ZPL code
    const blob = new Blob([zplCode], { type: 'application/zpl' });
    const url = URL.createObjectURL(blob);
    
    // Open the ZPL file in a new window which will trigger the browser's print dialog
    const printWindow = window.open(url);
    
    // Clean up
    setTimeout(() => {
      URL.revokeObjectURL(url);
      if (printWindow) {
        printWindow.close();
      }
    }, 1000);
    
    return true;
  } catch (error) {
    console.error('Error printing ZPL:', error);
    return false;
  }
}