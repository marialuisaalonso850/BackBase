// models/revisionModel.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Subesquemas para las distintas secciones de la revisión
const seguridadSchema = new Schema({
  frenos: { type: String, enum: ["Aprobado", "Reprobado"], required: true },
  fuerzaFrenadoDelantera: { type: Number },
  fuerzaFrenadoTrasera: { type: Number },
  desbalanceFrenado: { type: Number },
  observacionesFrenos: { type: String },

  direccion: { type: String, enum: ["Aprobado", "Reprobado"], required: true },
  holguraVolante: { type: Number },
  estadoRotulas: { type: String },
  observacionesDireccion: { type: String },

  suspension: { type: String, enum: ["Aprobado", "Reprobado"], required: true },
  reboteIzquierdo: { type: Number },
  reboteDerecho: { type: Number },
  estadoBujes: { type: String },
  observacionesSuspension: { type: String },

  llantasRines: { type: String, enum: ["Aprobado", "Reprobado"], required: true },
  labradoLlantas: { type: Number },
  estadoRines: { type: String },
  observacionesLlantasRines: { type: String },

  observacionesSeguridad: { type: String }
});

const ambientalSchema = new Schema({
  emisiones: {
    type: String,
    enum: ["Dentro del límite", "Fuera del límite"],
    required: true
  },
  co: { type: Number },            
  co2: { type: Number },           
  hc: { type: Number },            
  opacidad: { type: Number },      
  observacionesEmisiones: { type: String },

  escape: {
    type: String,
    enum: ["Aprobado", "Reprobado"],
    required: true
  },
  observacionesEscape: { type: String },

  observacionesAmbiental: { type: String }
});

const electricidadSchema = new Schema({
  luces: {
    type: String,
    enum: ["Funcionando", "No Funcionando"],
    required: true
  },
  observacionesLuces: { type: String },

  direccionales: {
    type: String,
    enum: ["Funcionando", "No Funcionando"],
    required: true
  },
  observacionesDireccionales: { type: String },

  claxon: {
    type: String,
    enum: ["Funcionando", "No Funcionando"],
    required: true
  },
  observacionesClaxon: { type: String },

  observacionesElectricidad: { type: String }
});

// Esquema principal para la revisión
const revisionSchema = new Schema(
  {
    placa: { type: String, required: true },
    marca: { type: String, required: true },
    modelo: { type: String, required: true },
    kilometraje: { type: String, required: true },
    seguridad: seguridadSchema,
    ambiental: ambientalSchema,
    electricidad: electricidadSchema,
    observaciones: { type: String, default: "" },
    estadoFinal: { type: String, enum: ["Aprobada", "Reprobada", "Pendiente"], default: "Pendiente" },
    codigoCita: { type: String, required: true },
  },
  { timestamps: true }
);

// Exportación del modelo correctamente
module.exports = mongoose.model('Revision', revisionSchema);
