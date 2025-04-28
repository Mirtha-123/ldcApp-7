const { google } = require('googleapis');
const { obtenerCliente } = require('./auth');
require('dotenv').config();


async function scanear(spreadsheetId, req) {
    const client = await obtenerCliente();
    const googleSheets = google.sheets({ version: "v4", auth: client });


    const getRow = await googleSheets.spreadsheets.values.get({
        auth: client,
        spreadsheetId,
        range: "Principal!C6:G",
    });

    console.log(req.body.qrcode)

    const fila = getRow.data.values;

    let resp; // Inicializa resp
    let cont = 0;
    let type = 0;
    const primerCaracter = req.body.qrcode.charAt(0);

    if (/\d/.test(primerCaracter)) {
        type = 1;
    } else if (/[a-zA-Z]/.test(primerCaracter)) {
        type = 2;
    } else {
        type = 3;
    }

    for (const [index, element] of fila.entries()) {
        let ver
        if (type == 2) {
            ver = element[0]
        } else if (type == 1) {
            ver = element[0]
        }


        if (req.body.qrcode == ver) {
            console.log('----------Coincidencia de Id')
            cont++
            resp = await verificar(spreadsheetId, element, type);

            // Rompe el bucle si se recibe una respuesta
            if (resp.ok !== undefined) {
                break;
            }
        }
    }

    // Asegúrate de responder con una respuesta válida
    if (cont == 0) {
        return { ok: false, message: "Participante no esta en la lista.", icon: 'error' };
    }

    return (resp);
}



async function verificar(spreadsheetId, params, type) {

    console.log('----Verificacion----')

    let usuario
    if (type == 2) {
        usuario = params[0]
    } else {
        usuario = params[0]
    }



    console.log('usuario: ' + usuario)
    console.log('tipo: ' + type)
    const client = await obtenerCliente();
    const googleSheets = google.sheets({ version: "v4", auth: client });


    const getRow = await googleSheets.spreadsheets.values.get({
        auth: client,
        spreadsheetId,
        range: "Asistencia!A:A",
    });


    const fila = getRow.data.values;

    let contador = 0
    if (fila) {

        for (const [index, element] of fila.entries()) {

            let ver
            if (type == 2) {
                ver = element[0]
            } else if (type == 1) {
                ver = element[0]
            }


            if (usuario == ver) {
                contador++
            }
        }
    }


    if (contador == 0) {
        crearRegistro(spreadsheetId, params)
        return {
            message: 'Participante Invitado',
            icon: 'success',
            ok: true
        }

    } else {
        return {
            message: 'Ya se registro Anteriormente',
            icon: 'warning',
            ok: false
        }
    }

}





async function crearRegistro(spreadsheetId, params) {

    const client = await obtenerCliente();
    const googleSheets = google.sheets({ version: "v4", auth: client });


    console.log('crear registro')
    console.log(params)
    const formattedDate = formatDate(new Date()); // Formatear la fecha

    await googleSheets.spreadsheets.values.append({
        auth: client,
        spreadsheetId,
        range: `Asistencia!A:F`,
        valueInputOption: "USER_ENTERED",
        resource: {
            values: [[params[0], formattedDate, params[1], params[2], params[3], params[4], params[5]]], // Usar la fecha formateada
        },
    });
}



function formatDate(date) {
    const day = String(date.getDate()).padStart(2, '0'); // Días con dos dígitos
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Meses (0-11)
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0'); // Horas
    const minutes = String(date.getMinutes()).padStart(2, '0'); // Minutos
    const seconds = String(date.getSeconds()).padStart(2, '0'); // Segundos

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;
}




async function leerDia(spreadsheetId) {



    const client = await obtenerCliente();
    const googleSheets = google.sheets({ version: "v4", auth: client });


    const getRow = await googleSheets.spreadsheets.values.get({
        auth: client,
        spreadsheetId,
        range: "Principal!B6:G",
    });


    const fila = getRow.data.values;

    console.log(fila)
    return { code: '0', data: fila }

}





async function leerDia_v2(spreadsheetId) {
    try {

        const client = await obtenerCliente();
        const googleSheets = google.sheets({ version: "v4", auth: client });
        console.log('Obtenemos el google sheet')

        const getRow = await googleSheets.spreadsheets.values.get({
            auth: client,
            spreadsheetId,
            range: "Principal!B6:G",
        });

        console.log('Obtuvimos de Principal')

        const getRowCurrently = await googleSheets.spreadsheets.values.get({
            auth: client,
            spreadsheetId,
            range: "Asistencia!A2:F",
        });

        console.log('Obtuvimos la Asistencia')
        const filaActual = getRowCurrently.data.values;

        const fila = getRow.data.values;
        console.log('Nos preparamos para cruzar')

        // Llamar a la función y mostrar el resultado
        const resultado = cruzarInformacion(filaActual, fila);
        console.log('ya cruzamos')
        console.log('-------RESULTADO--------')
        console.log(resultado);





        return { code: '0', data: resultado }


    } catch (error) {
        console.log('ERROR --->' + error)
    }


}


function cruzarInformacion(arr1, arr2) {
    if (!Array.isArray(arr1) || !Array.isArray(arr2)) {
        // Si alguno no es array, simplemente devuelve arr2 tal cual
        return arr2;
    }

    const valoresArr1 = new Set(arr1.map(subArray => subArray[0]));

    return arr2.map(subArray => {
        const segundoCampo = subArray[1];
        const existe = valoresArr1.has(segundoCampo);
        return [...subArray, existe];
    });
}


module.exports = { scanear, leerDia, leerDia_v2 };
