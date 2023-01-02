const { SMTP_API_KEY } = require("../shared");
const nodemailer = require("nodemailer");

const transporterBody = {
    host: "smtp.sendgrid.net",
    port: 587,
    auth: {
        user: "apikey",
        pass: SMTP_API_KEY
    }
};

const contactEmail = (req, res) => {
    const { email, name, message } = req.body;

    const transporter = nodemailer.createTransport(transporterBody);

    const msg = {
        from: "kundeservice@russeregisteret.no",
        to: "kundeservice@russeregisteret.no",
        subject: `Innsendt spørsmål fra ${email}`,
        text: `${name} - ${email} \n${message}`,
        html: `<h3>${name} - ${email}</h3><br><p>${message}</p>`
    }

    transporter.sendMail(msg, (error, data) => {
        if (error) {
            console.log(error);
            res.status(500).send("Something went wrong.");
        } else {
            res.status(200).send("Email was successfully sent.");
        }
    });
}

const successBody = (object) => { 
    return `<html>
        <body style="padding: 0 20px; background-color: #f9fafb; font-family: sans-serif; max-width: 550px; margin: auto;">
            <div style="display: flex; justify-content: center;">
                <div>
                    <h1 style="font-size: 24px; font-weight: bold; padding-bottom: 40px; line-height: 1.4;">
                        Gratulerer! Din registrering i Russeregisteret er fullført.
                    </h1>
                    <p>
                        Følgende navn er nå registrert i vårt register:
                    </p>
                    <ul>
                        ${object.data.map(item => {
                            return `<li style="font-weight: bold;">${item.description}</li>`
                        }).join("")}
                    </ul>
                    <div style="text-align: center; padding: 12px 6px; background-color: #f87171; width: 100px; border-radius: 6px; margin-top: 30px;">
                        <a href="https://russeregisteret.no" style="text-align: center; text-decoration: none; color: white;">
                            Sjekk ut navnet
                        </a>
                    </div>

                    <p style="margin-top: 60px; line-height: 1.8;">
                        Hvis du skulle lure på noe, så er det bare å svare oss på denne mailen. Ha en fin russetid!
                    </p>

                    <p style="margin-top: 60px; line-height: 1.8;">
                        Med vennlig hilsen
                        <br>
                        Russeregisteret
                    </p>
                </div>
            </div>
        </body>
    </html>`
}

module.exports = {
    transporterBody,
    successBody,
    contactEmail
}