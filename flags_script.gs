// AdSci Resource Review Flags - Apps Script
// Paste this entire file into the Script Editor, then Deploy as Web App.
// Execute as: Me | Who has access: Anyone

const SHEET_ID = "1QcShDtks5DGH_up39NRSAWCI-R6I3H4KikPGNZYhKPw";
const TAB = "Flags";

function getSheet() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  let sheet = ss.getSheetByName(TAB);
  if (!sheet) {
    sheet = ss.insertSheet(TAB);
    sheet.appendRow(["Key", "Title", "Category", "Note", "Phase", "Reviewer", "Timestamp"]);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doGet(e) {
  const sheet = getSheet();
  const rows = sheet.getDataRange().getValues();
  const flags = {};
  for (let i = 1; i < rows.length; i++) {
    const key = rows[i][0];
    if (key) {
      flags[key] = {
        title:    rows[i][1],
        category: rows[i][2],
        note:     rows[i][3],
        phase:    rows[i][4],
        reviewer: rows[i][5],
        ts:       rows[i][6]
      };
    }
  }
  return ContentService
    .createTextOutput(JSON.stringify(flags))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const sheet = getSheet();

  if (data.action === "delete") {
    const rows = sheet.getDataRange().getValues();
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0] === data.key) {
        sheet.deleteRow(i + 1);
        break;
      }
    }
    return ContentService
      .createTextOutput(JSON.stringify({ok: true}))
      .setMimeType(ContentService.MimeType.JSON);
  }

  // upsert
  const rows = sheet.getDataRange().getValues();
  let found = -1;
  for (let i = 1; i < rows.length; i++) {
    if (rows[i][0] === data.key) { found = i + 1; break; }
  }
  const rowData = [data.key, data.title, data.category||"", data.note, data.phase, data.reviewer, data.ts];
  if (found > 0) {
    sheet.getRange(found, 1, 1, 6).setValues([rowData]);
  } else {
    sheet.appendRow(rowData);
  }
  return ContentService
    .createTextOutput(JSON.stringify({ok: true}))
    .setMimeType(ContentService.MimeType.JSON);
}
