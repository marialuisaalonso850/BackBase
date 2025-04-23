const mongoose = require('mongoose');

const CitaSchema = new mongoose.Schema({
  codigoCita: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  correo: { type: String, required: true },
  telefono: { type: String, required: true },
  fechaCita: { type: String, required: true },
  horaCita: { type: String, required: true },
  placa: { type: String, required: true },
  cdaSeleccionado: { type: String, required: true },
  estado: { 
    type: String, 
    enum: ["Pendiente", "Tecnomecánica realizada","Aprobado","Rechazado"], 
    default: "Pendiente" 
  },
  fechaCreacion: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Cita", CitaSchema);
