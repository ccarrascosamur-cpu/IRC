/**
 * IRC Website - Google Sheets API v2
 * Copiar TODO este código en Extensiones > Apps Script del Google Sheet
 * 
 * Mejoras en esta versión:
 * - Formatea horas como HH:MM (texto) en vez de fechas
 * - Formatea fechas como dd/mm/yyyy
 * - Detecta automáticamente si una columna contiene horas
 */

function doGet(e) {
  e = e || {};
  const action = e.parameter ? e.parameter.action || 'all' : 'all';
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  
  let response = {};
  
  if (action === 'all' || action === 'posiciones') {
    response.posiciones = getSheetData(ss, 'Posiciones');
  }
  if (action === 'all' || action === 'fixture') {
    response.fixture = getSheetData(ss, 'Fixture');
  }
  if (action === 'all' || action === 'noticias') {
    response.noticias = getSheetData(ss, 'Noticias');
  }
  if (action === 'all' || action === 'stats') {
    response.stats = getSheetData(ss, 'Stats');
  }
  if (action === 'all' || action === 'config') {
    response.config = getConfig(ss);
  }
  
  return jsonResponse(response);
}

function getSheetData(ss, sheetName) {
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  if (values.length < 2) return [];
  
  const headers = values[0].map(h => String(h).trim());
  const rows = [];
  
  // Detectar qué columnas son horas (por nombre de header)
  const timeColumns = {};
  headers.forEach((h, i) => {
    const lower = h.toLowerCase();
    if (lower === 'hora' || lower.includes('time')) {
      timeColumns[i] = true;
    }
  });
  
  for (let i = 1; i < values.length; i++) {
    const row = {};
    for (let j = 0; j < headers.length; j++) {
      let val = values[i][j];
      const header = headers[j];
      
      if (typeof val === 'boolean') {
        row[header] = val;
      } else if (val instanceof Date) {
        if (timeColumns[j]) {
          // Es una hora → formatear como HH:MM
          row[header] = Utilities.formatDate(val, Session.getScriptTimeZone(), 'HH:mm');
        } else {
          // Es una fecha → formatear como dd/mm/yyyy
          row[header] = Utilities.formatDate(val, Session.getScriptTimeZone(), 'dd/MM/yyyy');
        }
      } else if (typeof val === 'number') {
        row[header] = val;
      } else {
        row[header] = val !== '' ? val : null;
      }
    }
    rows.push(row);
  }
  
  return rows;
}

function getConfig(ss) {
  const sheet = ss.getSheetByName('Config');
  if (!sheet) return {};
  
  const values = sheet.getDataRange().getValues();
  const config = {};
  
  for (let i = 1; i < values.length; i++) {
    const key = String(values[i][0]).trim();
    const val = values[i][1];
    config[key] = val !== '' ? val : null;
  }
  
  return config;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
