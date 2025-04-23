const express = require('express');
const nodemailer = require('nodemailer');
const router = express.Router();

router.post('/', async (req, res) => {
    const { to, subject, text, pdfBase64, filename } = req.body;

    if (!to || !subject || !text || !pdfBase64 || !filename) {
        return res.status(400).json({ error: "Faltan datos necesarios." });
    }

    try {
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        });

        const mailOptions = {
            from: `"CDA Técnico" <${process.env.MAIL_USER}>`,
            to,
            subject,
            text,
            attachments: [{
                filename,
                content: Buffer.from(pdfBase64, 'base64'),
                encoding: 'base64'
            }]
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: "Correo enviado correctamente." });

    } catch (error) {
        console.error('Error al enviar el correo:', error);
        res.status(500).json({ error: "Error al enviar el correo." });
    }
});

module.exports = router;
