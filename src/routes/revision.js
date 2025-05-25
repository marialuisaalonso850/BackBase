const express = require("express");
const Revision = require("../schema/revision");
const Cita = require("../schema/agendarcita");
const Pago = require("../schema/Pago");  // modelo Pago importado
const multer = require("multer");
const Sentry = require('@sentry/node');

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Obtener revisión por código de cita
router.get("/:codigoCita", async (req, res) => {
  try {
    const revision = await Revision.findOne({ codigoCita: req.params.codigoCita });
    if (!revision) {
      return res.status(404).json({ error: "Revisión no encontrada" });
    }
    res.json(revision);
  } catch (error) {
    console.error("Error al obtener la revisión:", error.message);
    Sentry.captureException(error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// Crear revisión
router.post("/", async (req, res) => {
  try {
    const { codigoCita, estadoFinal } = req.body;
    if (!codigoCita) {
      return res.status(400).json({ message: "El código de cita es requerido" });
    }

    const cita = await Cita.findOne({ codigoCita });
    if (!cita) return res.status(404).json({ message: "Cita no encontrada" });

    if (cita.estado !== "Pendiente") {
      return res.status(400).json({ message: "La tecnomecánica ya fue realizada o procesada" });
    }

    const nuevaRevision = new Revision({
      ...req.body,
      estadoFinal,
    });

    await nuevaRevision.save();

    cita.estado = "Tecnomecánica realizada";
    await cita.save();

    res.status(201).json({ message: "Revisión registrada", revision: nuevaRevision });
  } catch (error) {
    console.error("Error al crear la revisión:", error.message);
    Sentry.captureException(error);
    res.status(500).json({ message: "Error interno", error: error.message });
  }
});

// Aprobar revisión
router.put('/aprobar/:codigoCita', async (req, res) => {
  try {
    const cita = await Cita.findOne({ codigoCita: req.params.codigoCita });
    if (!cita) return res.status(404).json({ error: "Cita no encontrada" });

    if (cita.estado !== "Tecnomecánica realizada")
      return res.status(400).json({ error: "Solo se puede aprobar una tecnomecánica realizada" });

    const revision = await Revision.findOne({ codigoCita: req.params.codigoCita });
    if (!revision) return res.status(404).json({ error: "Revisión no encontrada" });

    revision.estadoFinal = "Aprobada";
    await revision.save();

    cita.estado = "Aprobada";
    await cita.save();

    res.status(200).json({ message: "Revisión aprobada", cita, revision });
  } catch (error) {
    console.error("Error al aprobar la revisión:", error.message);
    Sentry.captureException(error);
    res.status(500).json({ message: "Error interno", error: error.message });
  }
});

// Rechazar revisión
router.put('/rechazar/:codigoCita', async (req, res) => {
  try {
    const cita = await Cita.findOne({ codigoCita: req.params.codigoCita });
    if (!cita) return res.status(404).json({ error: "Cita no encontrada" });

    if (cita.estado !== "Tecnomecánica realizada")
      return res.status(400).json({ error: "Solo se puede rechazar una tecnomecánica realizada" });

    const revision = await Revision.findOne({ codigoCita: req.params.codigoCita });
    if (!revision) return res.status(404).json({ error: "Revisión no encontrada" });

    revision.estadoFinal = "Rechazada";
    await revision.save();

    cita.estado = "No aprobada";
    await cita.save();

    res.status(200).json({ message: "Revisión rechazada", cita, revision });
  } catch (error) {
    console.error("Error al rechazar la revisión:", error.message);
    Sentry.captureException(error);
    res.status(500).json({ message: "Error interno", error: error.message });
  }
});

// Cambiar estado manualmente
router.put("/:codigoCita", async (req, res) => {
  try {
    const { estado } = req.body;

    if (!["Aprobada", "Rechazada"].includes(estado)) {
      return res.status(400).json({ error: "Estado de revisión inválido. Solo se permite 'Aprobada' o 'Rechazada'." });
    }

    const cita = await Cita.findOne({ codigoCita: req.params.codigoCita });
    if (!cita) {
      return res.status(404).json({ error: "Cita no encontrada." });
    }

    if (cita.estado !== "Tecnomecánica realizada") {
      return res.status(400).json({ error: "Solo se puede modificar una revisión que haya sido realizada." });
    }

    const revision = await Revision.findOne({ codigoCita: req.params.codigoCita });
    if (!revision) {
      return res.status(404).json({ error: "Revisión no encontrada." });
    }

    revision.estadoFinal = estado;
    await revision.save();

    cita.estado = estado === "Aprobada" ? "Aprobada" : "No aprobada";
    await cita.save();

    res.json({ message: `La revisión ha sido ${estado.toLowerCase()}.`, cita, revision });
  } catch (error) {
    console.error("Error al actualizar la cita:", error.message);
    Sentry.captureException(error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

// Función para calcular el valor según tipo de vehículo y año
function calcularValorCita(tipoVehiculo, añoVehiculo) {
  if (!tipoVehiculo) return 0;

  const añoActual = new Date().getFullYear();
  const antiguedad = añoActual - parseInt(añoVehiculo, 10);
  console.log("El vehículo tiene antigüedad:", antiguedad);

  if (tipoVehiculo.toLowerCase() === "carroparticular") {
    if (antiguedad >= 0 && antiguedad <= 2) return { valor: 279163, antiguedad };
    else if (antiguedad >= 3 && antiguedad <= 7) return { valor: 279563, antiguedad };
    else if (antiguedad >= 8) return { valor: 279863, antiguedad };
  }

  return { valor: 0, antiguedad };
}


// *** Nueva ruta para procesar pagos ***
router.post("/pago", async (req, res) => {
  try {
    const { codigoCita, metodoPago, tipoTarjeta, numeroTarjeta } = req.body;

    if (!codigoCita || !metodoPago) {
      return res.status(400).json({ error: "Código de cita y método de pago son requeridos." });
    }

    const cita = await Cita.findOne({ codigoCita });
    if (!cita) return res.status(404).json({ error: "Cita no encontrada." });

    if (cita.estado === "Pagada") {
      return res.status(400).json({ error: "Esta cita ya está pagada." });
    }

    // Aquí obtén el valor a pagar. Ajusta según tu modelo Cita
    const valorCalculado = cita.valorPago; // O el campo que tengas
    if (!valorCalculado) {
      return res.status(400).json({ error: "No hay valor para pagar definido para esta cita." });
    }

    if (!["efectivo", "tarjeta"].includes(metodoPago.toLowerCase())) {
      return res.status(400).json({ error: "Método de pago inválido. Debe ser 'efectivo' o 'tarjeta'." });
    }

    if (metodoPago.toLowerCase() === "tarjeta") {
      if (!tipoTarjeta || !numeroTarjeta) {
        return res.status(400).json({ error: "Se requiere tipo y número de tarjeta para pago con tarjeta." });
      }
    }

    const nuevoPago = new Pago({
      codigoCita,
      placa: cita.placa,
      tipoVehiculo: cita.tipoVehiculo,
      añoVehiculo: cita.añoVehiculo,
      antiguedad: cita.antiguedad,
      valorCalculado,
      metodoPago,
      ...(metodoPago.toLowerCase() === "tarjeta" ? { tipoTarjeta, numeroTarjeta } : {}),
    });

    await nuevoPago.save();

    cita.estado = "Pagada";
    await cita.save();

    res.status(200).json({ message: "Pago realizado con éxito.", pago: nuevoPago, cita });
  } catch (error) {
    console.error("Error al realizar el pago:", error.message);
    Sentry.captureException(error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

module.exports = router;
