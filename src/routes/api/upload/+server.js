import { json } from '@sveltejs/kit';
import xlsx from 'xlsx';

export async function POST({ request }) {
  const formData = await request.formData();
  const file = formData.get('file');
  const buffer = await file.arrayBuffer();
  const workbook = xlsx.read(buffer, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

  // Return the data as JSON for the front end
  return json(data);
}
