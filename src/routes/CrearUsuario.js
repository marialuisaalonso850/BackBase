const router = require("express").Router();
const sendConfirmationEmail = require("./correos");
const { jsonResponse } = require("../lib/jsonResponse");
const User = require("../schema/user");

// Importamos Sentry (asegúrate de tenerlo ya inicializado en tu app principal)
const Sentry = require('@sentry/node');

router.post("/", async (req, res) => {
    const { username, name, password } = req.body;

    if (!username || !name || !password) {
        return res.status(400).json(jsonResponse(400, {
            error: "Todos los campos son requeridos"
        }));
    }

    try {
        const exists = await User.findOne({ username });

        if (exists) {
            return res.status(400).json(jsonResponse(400, {
                error: "El correo ingresado ya existe"
            }));
        }

        // Crear el usuario con rol "mecánico" por defecto
        const newUser = new User({ username, name, password, role: "mecanico" });

        await newUser.save();
        sendConfirmationEmail(username);
        
        res.status(201).json(jsonResponse(201, {
            message: "Usuario creado con rol de mecánico"
        }));
       
    } catch (error) {
        console.error("Error al crear usuario:", error);
        Sentry.captureException(error); // 👈 Captura del error en Sentry
        res.status(500).json(jsonResponse(500, {
            error: "Error interno del servidor"
        }));
    }
});

module.exports = router;
