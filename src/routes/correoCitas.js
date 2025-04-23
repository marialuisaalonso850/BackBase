const nodemailer = require("nodemailer");
const path = require('path');
const fs = require('fs');
const password1 = "multiservicios1234";
const password = "vaeh gbid lbzu zszu";
const correo = "marialuisaalonso850@gmail.com";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: correo,
    pass: password,
  },
});

// Función para enviar la confirmación de cita
async function sendConfirmationCitas(codigoCita, email, nombre, fechaCita, horaCita, placa) {
  try {
    await transporter.sendMail({
      from: "marialuisaalonso850@gmail.com",
      to: email,
      subject: "Confirmación de cita",
      text: `Hola ${nombre}, tu cita ha sido agendada.`,
      html: `
        <div>
          <p>Hola <strong>${nombre}</strong>,</p>
          <p>Tu cita ha sido confirmada en <strong>CDA ARMENIA</strong>.</p>
          <p><strong>Fecha de la cita:</strong> ${fechaCita}</p>
          <p><strong>Hora de la cita:</strong> ${horaCita}</p>
          <p><strong>Placa del vehículo:</strong> ${placa}</p>
          <p><strong>Código de acceso:</strong> ${codigoCita}</p>
          <p>¡Gracias por tu confianza!</p>
        </div>
        <div>
          <p>Recuerda que puedes cancelar tu cita hasta 24 horas antes de la fecha programada.</p>
          <p>Si tienes alguna duda o necesitas reprogramar tu cita, por favor contáctanos.</p>
        </div>
        <footer>
          <p>Este es un mensaje automático, no responder a este correo.</p>
          <p>Para más información, contacta a nuestro equipo de atención al cliente en <strong>teléfono: 312-345-6789</strong> o <strong>email: support@CDA_ARMENIA.com</strong>.</p>
        </footer>
      `,
    });
    console.log("Correo de confirmación enviado a " + email);
  } catch (error) {
    console.error("Error al enviar el correo de confirmación:", error);
  }
}


module.exports = { sendConfirmationCitas };
