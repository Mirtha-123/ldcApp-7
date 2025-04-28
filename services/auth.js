
const { google } = require('googleapis');

async function obtenerCliente() {
    try {
        const auth = new google.auth.GoogleAuth({
            keyFile: "congtomati-cd09e3057b07.json", // Ajusta la ruta si es necesario
            scopes: "https://www.googleapis.com/auth/spreadsheets",
        });
        return await auth.getClient();
    } catch (error) {
        console.error('Error al obtener el cliente:', error);
        throw error;
    }
}

module.exports = { obtenerCliente };
