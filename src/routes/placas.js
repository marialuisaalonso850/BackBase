// rutas de placas.js
const express = require('express');
const Placa = require('../schema/placasValidas');

const router = express.Router();

// Obtener datos del vehículo por la placa
router.get('/:placa', async (req, res) => {
    const { placa } = req.params;

    try {
        const vehiculo = await Placa.findOne({ placa });
        if (!vehiculo) {
            return res.status(404).json({ error: "Vehículo no encontrado" });
        }
        res.json(vehiculo);
    } catch (error) {
        console.error("Error al buscar el vehículo:", error);
        res.status(500).json({ error: "Error interno del servidor" });
    }
});

module.exports = router; // exportar router
