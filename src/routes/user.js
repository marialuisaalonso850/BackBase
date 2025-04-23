const { jsonResponse } = require("../lib/jsonResponse");
const router = require("express").Router();
const User = require("../schema/user"); // Asegúrate de importar tu modelo de usuario

// Obtener todos los usuarios
router.get("/", async (req, res) => {
    try {
        const usuarios = await User.find(); // Obtiene todos los usuarios de la base de datos
        res.status(200).json(usuarios); // Devuelve la lista completa
    } catch (error) {
        console.error("Error al obtener usuarios:", error);
        res.status(500).json(jsonResponse(500, "Error al obtener los usuarios"));
    }
});

module.exports = router;
