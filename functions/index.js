const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

// Esta función se ejecutará automáticamente todos los días a las 3:00 AM
exports.calcularEstadisticasDiarias = functions.pubsub.schedule('0 3 * * *')
  .timeZone('Europe/Madrid')
  .onRun(async (context) => {
    const db = admin.firestore();
    const mercadoSnapshot = await db.collection('mercado').get();
    const totalUsuarios = mercadoSnapshot.size;

    if (totalUsuarios < 2) {
      console.log("No hay suficientes usuarios en el mercado.");
      return null;
    }

    const stickerCounts = {};
    mercadoSnapshot.forEach(doc => {
      const userData = doc.data();
      for (const stickerCode in userData.stickers) {
        if (userData.stickers[stickerCode] >= 1) {
          stickerCounts[stickerCode] = (stickerCounts[stickerCode] || 0) + 1;
        }
      }
    });

    // Guardar el resultado procesado en un solo documento
    await db.collection('stats').doc('global').set({
      totalUsuarios,
      stickerCounts,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp()
    });

    console.log("Estadísticas calculadas y guardadas exitosamente.");
    return null;
  });
