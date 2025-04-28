// routes.js
const express = require('express');
const router = express.Router();
const { obtenerDatos, agregarDatos } = require('../services/qr_service');
const { borrarRegistros } = require('../services/sheets');
const { scanear, leerDia, leerDia_v2 } = require('../services/flutter');
require('dotenv').config();

const { subirImagen } = require('../services/firebase')
const spreadsheetId = "1_Bv8a4G1_F6fbYgv5R1ahsbw9yFArfNyU0vrixmRUvM";

const QRCode = require('qrcode');
const { createCanvas, loadImage } = require('canvas');
async function generarQR(param) {
    const myVariable = param ;

    const qrSize = 300; // Tamaño del QR original
    const finalWidth = 1200; // Ancho del canvas final
    const finalHeight = 1300; // Altura del canvas final
    const scaledQRSize = 1000; // Tamaño del QR redimensionado en el canvas final

    // Crear el canvas para el código QR
    const qrCanvas = createCanvas(qrSize, qrSize);
    const qrContext = qrCanvas.getContext('2d');

    // Generar el código QR en blanco y negro
    await QRCode.toCanvas(qrCanvas, myVariable, {
        width: qrSize,
        margin: 0, // Sin margen adicional
        color: {
            dark: '#000000',  // Color de los píxeles oscuros (negro temporalmente)
            light: '#FFFFFF'  // Fondo blanco
        }
    });

    // Crear el canvas final donde dibujaremos todo
    const finalCanvas = createCanvas(finalWidth, finalHeight);
    const ctx = finalCanvas.getContext('2d');

    // Dibujar el fondo (opcional)
    ctx.fillStyle = '#FFF'; // Fondo blanco
    ctx.fillRect(0, 0, finalWidth, finalHeight);

    // Agregar el nombre de la empresa en la parte superior
    ctx.fillStyle = '#e67e22'; // Color del texto
    ctx.font = 'bold 90px "Roboto", cursive'; // Fuente estilizada y tamaño más grande
    ctx.textAlign = 'center';
    ctx.fillText('LDC - Asistencia', finalWidth / 2, 150); // Texto centrado en la parte superior

    //Salon
    const logo2 = await loadImage('./assets/image/salon.jpg'); // Cambia esto a la ruta de tu logo
    const logo2Size = 150; // Tamaño del logo
    ctx.drawImage(logo2, (finalWidth / 2) - (logo2Size / 2)+480, 100 - (logo2Size / 2), logo2Size, logo2Size);



    // Crear un degradado, ajustado al tamaño final del QR
    const gradient = ctx.createLinearGradient(100, 200, 100 + scaledQRSize, 200 + scaledQRSize); // Degradado ajustado al QR redimensionado
    gradient.addColorStop(0, '#2874a6');  // Color inicial (azul)
    gradient.addColorStop(1, '#85c1e9');  // Color final (rojo)

    //gradient.addColorStop(0, '#884ea0');  // Color inicial (azul)
    //gradient.addColorStop(1, '#d2b4de');  // Color final (rojo)



    // Dibujar el QR en el canvas final con el tamaño adecuado
    ctx.drawImage(qrCanvas, 100, 200, scaledQRSize, scaledQRSize); // Redimensiona y posiciona el QR

    // Dibujar el degradado solo en los píxeles oscuros del QR
    const qrImageData = qrContext.getImageData(0, 0, qrSize, qrSize); // Obtener los datos de píxeles del QR
    const imageData = qrImageData.data;

    // Recorrer todos los píxeles del QR
    for (let i = 0; i < imageData.length; i += 4) {
        // Detectar los píxeles oscuros (el negro del QR)
        if (imageData[i] === 0 && imageData[i + 1] === 0 && imageData[i + 2] === 0) {
            // Calcular la posición relativa del píxel dentro del canvas QR redimensionado
            const x = (i / 4) % qrSize;
            const y = Math.floor(i / 4 / qrSize);

            // Aplicar el degradado en la posición correcta, redimensionando el QR al tamaño final
            const scaledX = Math.floor(x * (scaledQRSize / qrSize)) + 100;
            const scaledY = Math.floor(y * (scaledQRSize / qrSize)) + 200;

            // Dibujar el píxel degradado en la posición exacta
            ctx.fillStyle = gradient;
            ctx.fillRect(scaledX, scaledY, Math.ceil(scaledQRSize / qrSize), Math.ceil(scaledQRSize / qrSize));
        }
    }

    // Agregar un logotipo u otra imagen en el centro del QR
    const logo = await loadImage('./assets/image/jw.png'); // Cambia esto a la ruta de tu logo
    const logoSize = 150; // Tamaño del logo
    ctx.drawImage(logo, (finalWidth / 2) - (logoSize / 2), 660 - (logoSize / 2), logoSize, logoSize);

    // Convertir el canvas a un Data URL
    const finalImageUrl = finalCanvas.toDataURL();
    const publicUrl = await subirImagen(finalImageUrl); // Asegúrate de que esta función funcione con Data URLs

    return publicUrl;
}



router.get("/", async (req, res) => {
    try {

        console.log('Ingreso a solicitar')
        
        const range = "GeneradorQR!F6:G"
        await borrarRegistros(spreadsheetId, range);

        const fila = await obtenerDatos(spreadsheetId, "GeneradorQR!C6:C");
        console.log('ya hay data')
        console.log(fila);
        for (const [index, element] of fila.entries()) {
            const qrCode = await generarQR(element[0]);
            await agregarDatos(spreadsheetId, `GeneradorQR!F${6 + index}:G`, [[`=IMAGE("${qrCode}")`, qrCode]]);
        }

        res.send(fila);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Error al procesar la solicitud');
    }
});

router.get("/borrar", async (req, res) => {
    try {
        const range = "Asistencia!A2:D"
        const respuesta = await borrarRegistros(spreadsheetId, range);
        res.send(respuesta)
    } catch (error) {
        console.error('Error /borrar:', error);
        res.status(500).send('Error al procesar la solicitud');
    }
});

router.post("/scan", async (req, res) => {
    try {
        console.log('peticion de scaneo')
        const respuesta = await scanear(spreadsheetId, req);
        console.log('---------RESP:', respuesta)
        res.send(respuesta)
    } catch (error) {
        console.error('Error /borrar:', error);
        res.status(500).send('Error al procesar la solicitud');
    }
});


router.get("/day", async (req, res) => {
    try {
        console.log('peticion del dia')
        const respuesta = await leerDia(spreadsheetId);
        console.log('---------RESP:', respuesta)
        res.send(respuesta)
    } catch (error) {
        console.error('Error /day:', error);
        res.status(500).send('Error al procesar la solicitud');
    }
});


router.get("/dayV2", async (req, res) => {
    try {
        console.log('peticion del dia')
        const respuesta = await leerDia_v2(spreadsheetId);
        console.log('---------RESP:', respuesta)
        res.send(respuesta)
    } catch (error) {
        console.error('Error /day:', error);
        res.status(500).send('Error al procesar la solicitud');
    }
});

module.exports = router;
