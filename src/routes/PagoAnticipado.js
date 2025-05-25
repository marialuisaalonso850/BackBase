const express = require("express");
const router = express.Router();
const Cita = require("../schema/agendarcita");
const Placa = require("../schema/placasValidas");
const Pago = require("../schema/Pago");
const { sendPagoConfirmado } = require("../routes/correoCitas");

function calcularValorCita(tipoVehiculo, añoVehiculo) {
  if (!tipoVehiculo) return 0;

  const añoActual = new Date().getFullYear();
  const antiguedad = añoActual - parseInt(añoVehiculo, 10);
  console.log("El vehículo tiene antigüedad:", antiguedad);

  if (tipoVehiculo.toLowerCase() === "CarroParticular") {
    if (antiguedad >= 0 && antiguedad <= 2) return 279163;
    else if (antiguedad >= 3 && antiguedad <= 7) return 279563;
    else if (antiguedad >= 8 && antiguedad <= 16) return 279863;
    else if (antiguedad >= 17) return 329961 ;
  }

  return 0;
}

router.post('/:codigoCita', async (req, res) => {
  try {
    const { codigoCita } = req.params;
    const { tipoPago, tipoTarjeta, numeroTarjeta } = req.body;
    console.log("Datos recibidos:", { tipoPago, tipoTarjeta, numeroTarjeta });

    if (!tipoPago) {
      return res.status(400).json({ error: "Tipo de pago es obligatorio." });
    }

    const cita = await Cita.findOne({ codigoCita });
    if (!cita) {
      return res.status(404).json({ error: "Cita no encontrada." });
    }

    const placaInfo = await Placa.findOne({ placa: cita.placa });
    if (!placaInfo) {
      return res.status(404).json({ error: "Información del vehículo no encontrada." });
    }

    const añoActual = new Date().getFullYear();
    const antiguedad = añoActual - parseInt(placaInfo.año, 10);
    const valorCalculado = calcularValorCita(placaInfo.tipoVehiculo, placaInfo.año);

    if (tipoPago === "Efectivo") {
      const nuevoPago = new Pago({
        codigoCita,
        placa: placaInfo.placa,
        tipoVehiculo: placaInfo.tipoVehiculo,
        añoVehiculo: placaInfo.año,
        antiguedad,
        valorCalculado,
        tipoPago,
        detallePago: "Pago en Efectivo",
      });

      await nuevoPago.save();

      cita.estado = "Pagada";
      await cita.save();

      await sendPagoConfirmado(cita.correo, {
        codigoCita,
        placa: placaInfo.placa,
        tipoVehiculo: placaInfo.tipoVehiculo,
        añoVehiculo: placaInfo.año,
        antiguedad,
        valorCalculado,
        tipoPago,
      });

      return res.json({ message: "Pago en efectivo registrado y cita marcada como pagada." });
    }

    if (tipoPago === "tarjeta") {
      if (!tipoTarjeta || !numeroTarjeta) {
        return res.status(400).json({ error: "Tipo y número de tarjeta son obligatorios para pago con tarjeta." });
      }

      const tarjetaRegex = /^[0-9]{16}$/;
      if (!tarjetaRegex.test(numeroTarjeta)) {
        return res.status(400).json({ error: "Número de tarjeta inválido." });
      }

      const tiposPermitidos = ["Visa", "Mastercard", "American Express"];
      if (!tiposPermitidos.includes(tipoTarjeta)) {
        return res.status(400).json({ error: "Tipo de tarjeta no soportado." });
      }

      const nuevoPago = new Pago({
        codigoCita,
        placa: placaInfo.placa,
        tipoVehiculo: placaInfo.tipoVehiculo,
        añoVehiculo: placaInfo.año,
        antiguedad,
        valorCalculado,
        tipoPago,
        tipoTarjeta,
        numeroTarjeta: `**** **** **** ${numeroTarjeta.slice(-4)}`,
      });

      await nuevoPago.save();

      cita.estado = "Pagada";
      await cita.save();

      await sendPagoConfirmado(cita.correo, {
        codigoCita,
        placa: placaInfo.placa,
        tipoVehiculo: placaInfo.tipoVehiculo,
        añoVehiculo: placaInfo.año,
        antiguedad,
        valorCalculado,
        tipoPago,
        tipoTarjeta,
        numeroTarjeta,
      });

      return res.json({ message: "Pago con tarjeta realizado y registrado con éxito." });
    }

    return res.status(400).json({ error: "Tipo de pago no válido. Use 'efectivo' o 'tarjeta'." });
  } catch (error) {
    console.error("Error al procesar el pago:", error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});


router.get("/infoPago/:codigoCita", async (req, res) => {
  try {
    const { codigoCita } = req.params;

    const cita = await Cita.findOne({ codigoCita });
    if (!cita) {
      return res.status(404).json({ error: "Cita no encontrada." });
    }

    const placaInfo = await Placa.findOne({ placa: cita.placa });
    if (!placaInfo) {
      return res.status(404).json({ error: "Información del vehículo no encontrada." });
    }

    const añoActual = new Date().getFullYear();
    const antiguedad = añoActual - parseInt(placaInfo.año, 10);
    const valorCalculado = calcularValorCita(placaInfo.tipoVehiculo, placaInfo.año);

    res.json({ antiguedad, valorCalculado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error interno del servidor." });
  }
});

module.exports = router;
