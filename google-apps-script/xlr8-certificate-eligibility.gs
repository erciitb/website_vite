/**
 * XLR8 certificate eligibility for a sheet with:
 *   A1: Roll no    B1: Name
 *   A2+: roll numbers, B2+: names to print on certificates
 *
 * Paste this into Code.gs in an Apps Script project bound to that spreadsheet.
 * Set SHEET_NAME to the tab containing the list. Deploy as a Web app with
 * Execute as: Me and Who has access: Anyone. Put its /exec URL in
 * VITE_XLR8_CERTIFICATE_CHECK_URL when building the website.
 *
 * GET <web-app-url>?roll=26B2289
 * -> {"eligible":true,"name":"Vihaan Kamdar"}
 */

const SHEET_NAME = 'Sheet1';

function doGet(e) {
  const roll = String((e && e.parameter && e.parameter.roll) || '').trim().toLowerCase();
  const result = { eligible: false, name: '' };

  if (roll) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('Certificate sheet not found: ' + SHEET_NAME);

    const rows = sheet.getDataRange().getDisplayValues();
    if (rows.length > 1) {
      const headers = rows[0].map(value => String(value).trim().toLowerCase());
      const rollColumn = headers.indexOf('roll no');
      const nameColumn = headers.indexOf('name');
      if (rollColumn === -1 || nameColumn === -1) {
        throw new Error('Expected header columns: Roll no and Name');
      }

      for (let i = 1; i < rows.length; i++) {
        if (String(rows[i][rollColumn] || '').trim().toLowerCase() === roll) {
          result.eligible = true;
          result.name = String(rows[i][nameColumn] || '').trim();
          break;
        }
      }
    }
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}
