const router = require("express").Router();
const { jsonResponse } = require("../lib/jsonResponse");
const User = require("../schema/user");
const getUserInfo = require("../lib/getUserInfo");

// Agregar Sentry
const Sentry = require('@sentry/node');

router.post("/", async (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json(jsonResponse(400, {
            error: "archivos son requeridos"
        }));
    }

    try {
        const user = await User.findOne({ username });

        if (user) {
            const correctPassword = await user.comparePassword(password, user.password);

            if (correctPassword) {
                const accessToken = user.createAccessToken();
                const refreshToken = await user.createRefreshToken();

                return res.status(200).json(jsonResponse(200, {
                    user: getUserInfo(user),
                    accessToken,
                    refreshToken
                }));
            } else {
                // Reportar intento fallido de login
                Sentry.captureMessage(`Intento de login fallido: contraseña incorrecta para ${username}`);
                return res.status(400).json(jsonResponse(400, {
                    error: "Usuario o contraseña incorrectos"
                }));
            }
        } else {
            // Reportar intento con usuario inexistente
            Sentry.captureMessage(`Intento de login fallido: usuario no encontrado - ${username}`);
            return res.status(400).json(jsonResponse(400, {
                error: "Usuario no encontrado"
            }));
        }
    } catch (error) {
        console.error("Error en el login:", error.message);
        Sentry.captureException(error);

        return res.status(500).json(jsonResponse(500, {
            error: "Error interno del servidor"
        }));
    }
});

module.exports = router;
