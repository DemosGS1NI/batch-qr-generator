# Batch QR Code Label Generator

This project is a web-based application that generates 4x2-inch labels with QR codes and human-readable information. Each label features a QR code alone on the left side, with details such as the model, GTIN, production date, and serial number displayed on the right. The application supports batch printing and generates PDF output ready for printing.

## Features

- Generates 4x2-inch labels.
- Positions the QR code on the left side.
- Displays model, GTIN, production date, and serial number on the right side.
- The first label of each batch prominently shows the model name and total count of labels.
- Last two digits of the serial number are emphasized but closely aligned with the rest of the number.
- Outputs a PDF file with a timestamped file name.

## Excel File Format

The application accepts an Excel file with the following structure:

| **Column Name**     | **Description**                                          |
|----------------------|----------------------------------------------------------|
| **model**           | Model name of the item (e.g., `MT-24`).                  |
| **gtin**            | Global Trade Item Number (GTIN).                        |
| **production date** | Production date in `YYYYMMDD` format.                   |
| **serial**          | Serial number of the item (numeric).                    |

The input Excel file should contain data formatted like this:

```csv
model,gtin,production date,serial
MT-24,01234567891234,20231231,123456
MT-24,01234567891234,20231231,123457
MT-24F,09876543210987,20231130,654321
MT-24F,09876543210987,20231130,654322

##Sample Output

###First Label
The first label in each batch prominently displays the model name and total count of records in the batch. Example:

yMT-24 - Total: 10
###Subsequent Labels
Each subsequent label features:
•	A QR code on the left side (1.5 x 1.5 inches).
•	The following human-readable details on the right side:
o	Model: MT-24
o	GTIN: 01234567891234
o	Production Date: 20231231
o	Serial: 12345**67** (with the last two digits emphasized but closely aligned).
##File Name
The generated PDF file is named dynamically using the format:
Copy code
labels_DDMM_HHMMSS.pdf
Example:
Copy code
labels_2811_173523.pdf
##How to Build and Run

###Prerequisites

Ensure you have the following installed:
•	Node.js (version 16 or later).
•	npm.

Steps
1.	Clone the repository:
2.	Install dependencies:
npm install
3.	Start the development server:
npm run dev
4.	Open your browser and navigate to:
http://localhost:5173/generate
5.	Upload an Excel file formatted as described in the "Excel File Format" section. The application will process the file and generate a PDF.
6.	Download the PDF. The file will be named dynamically using the format labels_DDMM_HHMMSS.pdf.

###Folder Structure
bash
Copy code
src/
├── lib/
│   └── utils.js         # QR code generation and PDF logic
├── routes/
│   ├── generate/
│   │   └── +page.svelte # Main frontend for label generation
│   ├── api/
│   │   └── upload/
│   │       └── +server.js # Backend API for processing Excel files

##License
This project is licensed under the MIT License.


