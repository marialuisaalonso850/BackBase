const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");
const { Readable } = require("stream");


const password1="multiservicios1234"
const password="vaeh gbid lbzu zszu"
const correo="marialuisaalonso850@gmail.com"

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  auth: {
    user: correo,
    pass: password,
  },
});

async function sendConfirmationCitas(codigoCita,email, nombre, fechaCita, horaCita, placa) {
  try {
    await transporter.sendMail({
      from: "marialuisaalonso850@gmail.com",
      to: email,
      subject: "Confirmación de cita",
      text: `Hola ${nombre}, tu cita ha sido agendada.`,
      html:  `
        <div>
          <p>Hola <strong>${nombre}</strong>,</p>
          <p>Tu cita ha sido confirmada en <strong>CDA ARMENIA</strong>.</p>
          <p><strong>Fecha de la cita:</strong> ${fechaCita}</p>
          <p><strong>Hora de la cita:</strong> ${horaCita}</p>
          <p><strong>Placa del vehículo:</strong> ${placa}</p>
          <p><strong>codigo de acceso:</strong>${codigoCita}<p>
          <p>¡Gracias por tu confianza!</p>
        </div>

        <div>
          <p>Recuerda que puedes cancelar tu cita hasta 24 horas antes de la fecha programada.</p>
          <p>Si tienes alguna duda o necesitas reprogramar tu cita, por favor contáctanos.</p>
        </div>
        
        <footer>
          <p>Este es un mensaje automático, no responder a este correo.</p>
          <p>Para más información, contacta a nuestro equipo de atención al cliente en <strong>teléfono: 312-345-6789</strong> o 
          <strong>email: support@CDA_ARMENIA.com</strong>.</p>
        </footer>
    `,
    });
    console.log("Correo de confirmación enviado." + email);
  } catch (error) {
    console.error("Error al enviar el correo de confirmación:", error);
  }
}

function generarPDFBuffer(datos) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument();
    const buffers = [];

    doc.on("data", buffers.push.bind(buffers));
    doc.on("end", () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });

    doc.fontSize(18).text("Confirmación de Pago", { align: "center" });
    doc.moveDown();
    doc.fontSize(12).text(`Placa: ${datos.placa}`);
    doc.text(`Tipo de Vehículo: ${datos.tipoVehiculo}`);
    doc.text(`Año del Vehículo: ${datos.añoVehiculo}`);
    doc.text(`Antigüedad: ${datos.antiguedad} años`);
    doc.text(`Valor Pagado: $${datos.valorCalculado}`);
    doc.text(`Tipo de Tarjeta: ${datos.tipoTarjeta}`);
    doc.text(`Número de Tarjeta: ${datos.numeroTarjeta}`);
    doc.text(`Código de Cita: ${datos.codigoCita}`);

    doc.end();
  });
}

async function sendPagoConfirmado(email, datosPago) {
  try {
    const pdfBuffer = await generarPDFBuffer(datosPago);

    await transporter.sendMail({
      from: correo,
      to: email,
      subject: "Confirmación de pago - CDA Armenia",
      html: `
        <p>Hola,</p>
        <p>Gracias por realizar tu pago. Adjuntamos el comprobante en formato PDF.</p>
        <p>Si tienes alguna duda, contáctanos.</p>
      `,
      attachments: [
        {
          filename: "ComprobantePago.pdf",
          content: pdfBuffer,
          contentType: "application/pdf"
        }
      ]
    });

    console.log("Correo de confirmación de pago enviado a:", email);
  } catch (error) {
    console.error("Error al enviar el correo de pago:", error);
  }
}

module.exports = {sendConfirmationCitas,sendPagoConfirmado};