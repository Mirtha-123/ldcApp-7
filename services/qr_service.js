// sheets.js
const { google } = require('googleapis');
const { obtenerCliente } = require('./auth');

async function obtenerDatos(spreadsheetId, range) {
    try {
        const client = await obtenerCliente();
        console.log('Obtuvimos cliente');
     
        const googleSheets = google.sheets({ version: "v4", auth: client });

        const getRow = await googleSheets.spreadsheets.values.get({
            spreadsheetId,
            range,
        });

        return getRow.data.values;
    } catch (error) {
        console.error('Error al obtener datos Conexion:', error);
        throw error;
    }
}

async function agregarDatos(spreadsheetId, range, values) {
    console.log('mas qr')
    const client = await obtenerCliente();
    const googleSheets = google.sheets({ version: "v4", auth: client });

    await googleSheets.spreadsheets.values.append({
        auth: client,
        spreadsheetId,
        range,
        valueInputOption: "USER_ENTERED",
        resource: {
            values,
        },
    });
}

module.exports = { obtenerDatos, agregarDatos };
