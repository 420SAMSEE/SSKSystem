/***** Google Apps Script (reference) *****
 * Provides endpoints:
 *   GET  ?action=getDashboardData
 *   GET  ?action=exportToCSV
 *   POST (JSON body) -> save data
 * Adjust SHEET_ID and SHEET_NAME to your actual sheet.
 */
const SHEET_ID = '11vhg37MbHRm53SSEHLsCI3EBXx5_meXVvlRuqhFteaY';
const SHEET_NAME = 'SaleForm';

function doPost(e) {
  const data = JSON.parse(e.postData.contents);
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['date','sold','pending','cleared','revenue','pipeFee','shareFee','otherFee','saveFee','expense','balance','timestamp']);
  }
  sheet.appendRow([data.date, +data.sold||0, +data.pending||0, +data.cleared||0, +data.revenue||0, +data.pipeFee||0, +data.shareFee||0, +data.otherFee||0, +data.saveFee||0, +data.expense||0, +data.balance||0, new Date()]);
  return ContentService.createTextOutput(JSON.stringify({ success: true, message: "Saved" })).setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  const action = e.parameter.action;
  if (action === 'exportToCSV') {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
    const data = sheet.getDataRange().getValues();
    const csv = data.map(r => r.map(v => typeof v === 'string' && v.includes(',') ? '"' + v.replace(/"/g,'""') + '"' : v).join(',')).join('\n');
    return ContentService.createTextOutput(csv).setMimeType(ContentService.MimeType.CSV);
  }
  if (action === 'getDashboardData') {
    return ContentService.createTextOutput(JSON.stringify(getDashboardData('month','last30','sold','none'))).setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput('ok');
}

/** Example implementation */
function getDashboardData(period, dateRange, metric, compare) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
  const rows = sheet.getDataRange().getValues().slice(1);
  const last30 = rows.slice(-30);
  const sum = (idx) => last30.reduce((a,r)=>a+(+r[idx]||0),0);
  const periods = last30.map(r => r[0]);
  return {
    kpi: {
      sold: sum(1),
      revenue: sum(4),
      profit: sum(4) - sum(9),
      balance: last30.length ? (+last30[last30.length-1][10]||0) : 0
    },
    chartData: {
      salesChart: { periods, currentData: last30.map(r=>+r[1]||0), valueLabel: 'จำนวนที่ขายได้', periodLabel: 'วัน' },
      profitChart: { periods, revenueData: last30.map(r=>+r[4]||0), profitData: last30.map(r=>(+r[4]||0)-(+r[9]||0)), periodLabel: 'วัน' }
    },
    historyData: last30.map(r => ({ date:r[0], sold:+r[1]||0, revenue:+r[4]||0, fees:+r[6]||0, expense:+r[9]||0, balance:+r[10]||0 })).reverse()
  };
}
