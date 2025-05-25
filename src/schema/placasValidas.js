const mongoose = require('mongoose');

const PlacaSchema = new mongoose.Schema({
  placa: { type: String, required: true, unique: true },
  propietario: { type: String, required: true },
  cedula: { type: String, required: true },
  telefono: { type: String, required: true },
  proximaRevision: { type: Date, required: true },
  marca:{type: Date, required: true},
  modelo:{type: Date, required: true},
  tipoVehiculo: {type: String, required: true}, 
  año: {type: String, required: true}
});

module.exports = mongoose.model('Placa', PlacaSchema);