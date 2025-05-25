const mongoose = require('mongoose');

const PagoSchema = new mongoose.Schema({
  codigoCita: { type: String, required: true, unique: true },
  placa: { type: String, required: true },
  tipoVehiculo: { type: String, required: true },
  añoVehiculo: { type: String, required: true },
  antiguedad: { type: Number, required: true },
  tipoPago: { type: String, enum: ['Efectivo', 'tarjeta'], required: true },
  valorCalculado: { type: Number, required: true },
  tipoTarjeta: { type: String, required: false},
  numeroTarjeta: { type: String, required: false },
  fechaPago: { type: Date, default: Date.now }

});

module.exports = mongoose.model('Pago', PagoSchema);
