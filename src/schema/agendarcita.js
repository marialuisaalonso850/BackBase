const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid'); // Importamos uuid para generar el código único

const citaSchema = new mongoose.Schema({
    codigoCita: {
        type: String,
        unique: true,
        default: uuidv4 // Genera un código único automáticamente
    },
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    correo: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    telefono: {
        type: String,
        required: true,
        trim: true
    },
    fechaCita: {
        type: String,
        required: true
    },
    horaCita: {
        type: String,
        required: true
    },
    placa: {
        type: String,
        required: true,
        uppercase: true,
        trim: true
    },
    cdaSeleccionado: {
        type: String,
        required: true,
        enum: ['CDA Norte', 'CDA Centro', 'CDA Sur']
    },
    estado: { 
        type: String, 
        enum: ["Pendiente", "","Aprobado","Rechazado", "Pagada"], 
        default: "Pendiente" 
      },
    fechaCreacion: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Cita', citaSchema);

