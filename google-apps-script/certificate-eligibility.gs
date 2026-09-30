/**
 * Certificate eligibility checker for Summer of Robotics.
 *
 * Setup:
 *  1. Open the Google Sheet that has a "Basic Certificate" sheet and an
 *     "Advanced Certificate" sheet. Each needs a roll number column headed
 *     "Roll No" or "Roll Number". The "Advanced Certificate" sheet also
 *     needs a "Project" column with that student's project title.
 *  2. Extensions > Apps Script, paste this file in as Code.gs.
 *  3. Deploy > New deployment > Web app.
 *       Execute as: Me
 *       Who has access: Anyone
 *  4. Copy the resulting /exec URL into CERTIFICATE_CHECK_URL in SOR.tsx.
 *
 * GET <url>?roll=<roll_no>
 * -> {
 *      "basicEligible": boolean, "basicName": string,
 *      "advancedEligible": boolean, "advancedName": string, "advancedProject": string
 *    }
 */

const ROLL_COLUMN_CANDIDATES = ['roll no', 'roll number'];

function doGet(e) {
  const roll = ((e.parameter.roll || '') + '').trim().toLowerCase();

  const response = {
    basicEligible: false,
    basicName: '',
    advancedEligible: false,
    advancedName: '',
    advancedProject: '',
  };

  if (roll) {
    const basicRow = findRow_('Basic Certificate', roll);
    if (basicRow) {
      response.basicEligible = true;
      response.basicName = getColumnValue_(basicRow.headers, basicRow.row, 'Name');
    }

    const advancedRow = findRow_('Advanced Certificate', roll);
    if (advancedRow) {
      response.advancedEligible = true;
      response.advancedName = getColumnValue_(advancedRow.headers, advancedRow.row, 'Name');
      response.advancedProject = getColumnValue_(advancedRow.headers, advancedRow.row, 'Project');
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify(response))
    .setMimeType(ContentService.MimeType.JSON);
}

// Finds the row matching a roll number in a sheet. Returns { headers, row } or null.
function findRow_(sheetName, roll) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  if (!sheet) return null;

  const values = sheet.getDataRange().getValues();
  if (values.length === 0) return null;

  const headers = values[0].map((h) => String(h).trim().toLowerCase());
  const rollColIndex = headers.findIndex((h) => ROLL_COLUMN_CANDIDATES.indexOf(h) !== -1);
  if (rollColIndex === -1) return null;

  for (let i = 1; i < values.length; i++) {
    const cell = String(values[i][rollColIndex] || '').trim().toLowerCase();
    if (cell === roll) {
      return { headers: values[0], row: values[i] };
    }
  }

  return null;
}

function getColumnValue_(headerRow, dataRow, columnHeader) {
  const headers = headerRow.map((h) => String(h).trim().toLowerCase());
  const idx = headers.indexOf(columnHeader.toLowerCase());
  if (idx === -1) return '';
  return String(dataRow[idx] || '').trim();
}
