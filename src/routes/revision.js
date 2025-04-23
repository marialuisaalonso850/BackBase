const express = require("express");
const Revision = require("../schema/revision");
const Cita = require("../schema/agendarcita");
const multer = require("multer");
const Sentry = require('@sentry/node'); // 👈 Importación de Sentry

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// ✅ Obtener revisión por código de cita
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

module.exports = router;
