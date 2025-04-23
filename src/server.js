const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const crypto = require('crypto');
require('dotenv').config();

// Importación básica de Sentry
const Sentry = require('@sentry/node');

const authenticate = require('./auth/authenticate');

class Server {
    constructor(port) {
        this.port = port || 5000;
        this.ACCESS_TOKEN_SECRET = this.generateTokenSecrets();
        this.REFRESH_TOKEN_SECRET = this.generateTokenSecrets();

        this.app = express(); // <- Primero se instancia Express

        // Configuración minimalista de Sentry
        Sentry.init({
            dsn: "https://d58338bc03b4c29351b1b01d3b602589@o4509147517550592.ingest.de.sentry.io/4509147520303184",
            // Sin integraciones personalizadas
        });

        // Middleware básico de Sentry para capturar solicitudes
        try {
            // Intentamos usar la API moderna
            if (typeof Sentry.requestHandler === 'function') {
                this.app.use(Sentry.requestHandler());
            } 
            // Si no está disponible, intentamos la API anterior
            else if (Sentry.Handlers && typeof Sentry.Handlers.requestHandler === 'function') {
                this.app.use(Sentry.Handlers.requestHandler());
            }
        } catch (err) {
            console.warn("No se pudo inicializar el middleware de Sentry", err.message);
        }

        this.paths = {
            crearUsuario: '/api/crearUsuario',
            login: '/api/login',
            user: '/api/user',
            signout: '/api/signout',
            todos: '/api/todos',
            refreshToken: '/api/refresh-token',
            citas: '/api/citas',
            eliminar: '/api/eliminarcita',
            home: '/',
            revision: "/api/revisiones",
            placas: "/api/placas",
            sendEmail: "/api/send-email"
        };

        this.middlewares();
        this.routes();
        this.connectDB();
        this.saveToken();

        // Middleware básico de manejo de errores de Sentry
        try {
            // Intentamos usar la API moderna
            if (typeof Sentry.errorHandler === 'function') {
                this.app.use(Sentry.errorHandler());
            } 
            // Si no está disponible, intentamos la API anterior
            else if (Sentry.Handlers && typeof Sentry.Handlers.errorHandler === 'function') {
                this.app.use(Sentry.Handlers.errorHandler());
            }
        } catch (err) {
            console.warn("No se pudo inicializar el middleware de manejo de errores de Sentry", err.message);
        }
    }

    // El resto de tus métodos permanecen igual...
    middlewares() {
        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: true }));
        this.app.use(cors());
        this.app.use(helmet());
    }

    routes() {
        this.app.use(this.paths.crearUsuario, require('./routes/CrearUsuario'));
        this.app.use(this.paths.login, require('./routes/login'));
        this.app.use(this.paths.user, require('./routes/user'));
        this.app.use(this.paths.signout, require('./routes/signout'));
        this.app.use(this.paths.todos, authenticate, require('./routes/todos'));
        this.app.use(this.paths.refreshToken, require('./routes/refreshToken'));
        this.app.use(this.paths.citas, require('./routes/Agendarcita'));
        this.app.use(this.paths.eliminar, require('./routes/eliminarCita'));
        this.app.use(this.paths.revision, require('./routes/revision'));
        this.app.use(this.paths.placas, require('./routes/placas'));
        this.app.use(this.paths.sendEmail, require('./routes/sendEmail'));

        this.app.get(this.paths.home, (req, res) => {
            res.json({ message: 'Server is in good state' });
        });
    }

    generateTokenSecrets() {
        return crypto.randomBytes(64).toString("hex");
    }

    saveToken() {
        process.env.ACCESS_TOKEN_SECRET = this.ACCESS_TOKEN_SECRET;
        process.env.REFRESH_TOKEN_SECRET = this.REFRESH_TOKEN_SECRET;
    }

    async connectDB() {
        const Uri = process.env.BD_CONNECTION_STRING;

        if (!Uri) {
            console.error("Error: la cadena de conexión no está definida.");
            process.exit(1);
        }

        try {
            await mongoose.connect(Uri, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            console.log('Connected to MongoDB');
        } catch (error) {
            console.error("Error conectando a MongoDB:", error);
            process.exit(1);
        }
    }

    start() {
        this.app.listen(this.port, () => {
            console.log(`Server is running on port: ${this.port}`);
        }).on('error', (err) => {
            console.error('Server error:', err);
            process.exit(1);
        });
    }
}

module.exports = Server;