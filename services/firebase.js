// firebaseStorage.js
const admin = require('firebase-admin');
const serviceAccount = require('./../ldcqr-906d6-firebase-adminsdk-79yni-a704c5a046.json'); // Ajusta la ruta a tu archivo de clave

// Inicializa Firebase
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: "gs://ldcqr-906d6.appspot.com" // Ajusta el nombre de tu bucket
});

// Función para subir imagen a Firebase Storage y retornar URL
async function subirImagen(qrImageUrl) {
    const bucket = admin.storage().bucket();

    // Convierte base64 a buffer
    const base64Data = qrImageUrl.split(',')[1];
    const buffer = Buffer.from(base64Data, 'base64');

    // Genera un nombre único para el archivo
    const fileName = `qrcodes/${Date.now()}.png`;
    const file = bucket.file(fileName);

    await file.save(buffer, {
        metadata: {
            contentType: 'image/png',
        },
        public: true,
    });

    // Retorna la URL pública
    return `https://storage.googleapis.com/${bucket.name}/${fileName}`;
}

module.exports = { subirImagen };
