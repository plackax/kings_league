const credentials = require("./credentials.json");
const { google } = require("googleapis");

const sheets = google.sheets({ version: "v4" });

const getDataFromSheet = async (spreadsheetId, range) => {
  const auth = await google.auth.getClient({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });

  const data = await sheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range,
  });

  return data.data.values;
};

const getCellValue = async (spreadsheetId, range) => {
  const data = await getDataFromSheet(spreadsheetId, range);
  return data[0][0];
};

async function searchForTextAndGetPrevRowNum(spreadsheetId, range, searchText) {
  const auth = await google.auth.getClient({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  const sheet = await sheets.spreadsheets.get({
    auth,
    spreadsheetId,
    ranges: range,
    fields: "sheets(data(rowData(values(formattedValue))))",
  });

  let prevRowNum = -1;
  sheet.data.sheets[0].data.forEach((data) => {
    if (!data.rowData) return;
    data.rowData.forEach((row, rowNum) => {
      if (!row.values) return;
      row.values.forEach((column) => {
        if (!column) return;
        if (column.formattedValue === searchText) {
          prevRowNum = rowNum;
        }
      });
    });
  });
  return prevRowNum;
}

const getJSONDataFromSheet = async (spreadsheetId, range) => {
  const data = await getDataFromSheet(spreadsheetId, range);
  const headers = data[0];
  const jsonData = data.slice(1).map((row) => {
    return row.reduce((json, cell, index) => {
      json[headers[index]] = cell;
      return json;
    }, {});
  });
  return jsonData;
};

module.exports = {
  getDataFromSheet,
  getJSONDataFromSheet,
  getCellValue,
  searchForTextAndGetPrevRowNum,
};
