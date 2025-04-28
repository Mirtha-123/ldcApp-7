const { google } = require('googleapis');
const { obtenerCliente } = require('./auth');

async function borrarRegistros(spreadsheetId, range) {
    const client = await obtenerCliente();
    const googleSheets = google.sheets({ version: "v4", auth: client });


    await googleSheets.spreadsheets.values.clear({
        spreadsheetId,
        range,
        auth: client,
    });

    return ({ mensaje: 'Celdas limpiadas exitosamente.' });


}

module.exports = { borrarRegistros };