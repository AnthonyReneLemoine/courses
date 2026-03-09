/**
 * APPLICATION LISTE DE COURSES - VERSION CORRIGÉE
 */

const SHEET_NAME = 'Courses';

function doGet() {
  return HtmlService.createHtmlOutputFromFile('Index')
    .setTitle('Courses Sarzeau')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL)
    .addMetaTag('viewport', 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no');
}

function obtenirArticles() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(SHEET_NAME);
    if (!sheet) return [];
    
    const lastRow = sheet.getLastRow();
    if (lastRow <= 1) return [];
    
    const data = sheet.getRange(2, 1, lastRow - 1, 9).getValues();
    return data.map(row => ({
      id: String(row[0] || ''),
      produit: String(row[1] || ''),
      quantite: String(row[2] || '1'),
      magasin: String(row[4] || 'Leclerc Theix'),
      achete: row[6] === true,
      date: row[7] instanceof Date ? row[7].toLocaleDateString('fr-FR') : ""
    }));
  } catch (e) {
    return [];
  }
}

function ajouterArticle(obj) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  const id = "ID_" + new Date().getTime();
  sheet.appendRow([id, obj.produit, obj.quantite, "Autre", "", "", false, new Date(), ""]);
  return {success: true};
}

function cocherArticle(id, etat) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] == id) {
      sheet.getRange(i + 1, 7).setValue(etat);
      if (etat) sheet.getRange(i + 1, 9).setValue(new Date());
      break;
    }
  }
}

function viderArticlesAchetes() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  const data = sheet.getDataRange().getValues();
  for (let i = data.length - 1; i > 0; i--) {
    if (data[i][6] === true) sheet.deleteRow(i + 1);
  }
}