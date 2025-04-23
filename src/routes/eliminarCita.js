const express = require("express");
const Cita = require("../schema/agendarcita");
const sendConfirmationCitas = require("./correoCitas");
const router = express.Router();

router.delete("/", async (req, res) => {
    try {
        const { placa } = req.body;

        if (!placa) {
            return res.status(400).json({ error: "la placa de la cita es obligatorio." });
        }

        const citaExistente = await Cita.findByIdAndDelete(id);

        if (!citaExistente) {
            return res.status(400).json({ error: "No existe una cita con ese id." });
        }

        res.json({ message: "Cita eliminada correctamente." });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar la cita." });
    }
    }
);

module.exports = router;
