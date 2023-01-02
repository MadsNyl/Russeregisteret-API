const { transporterBody, successBody } = require("./settings/email.js");
const { ENDPOINT_SECRET, SK } = require("./shared.js");
const nodemailer = require("nodemailer");
const pool = require("./connection.js");
const stripe = require("stripe")(SK);

const webhook = (request, response) => {
    const payload = request.body;
    const sig = request.headers["stripe-signature"];

    let event;
    
    try {
        event = stripe.webhooks.constructEvent(payload, sig, ENDPOINT_SECRET);
    } catch (err) {
        console.log(err.message);
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        fulfillOrder(session);
        sendEmail(session);
    }
  
    response.status(200).end();
}

// webhook for checkout session
const fulfillOrder = async (session) => {
    
    const object = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ["line_items"]
    });
    let values = [];
    for (let i = 0; i < object.line_items.data.length; i++) {
        let info = object.line_items.data[i].description.split(" ");
        values.push(
            [info[0], info[1]]
        );
    }

    let finalValues = []

    // check if a register already exists in db
    let promise = new Promise((resolve, reject) => {
        for (let value of values) {
            pool.query("SELECT * FROM register WHERE name = ? AND year = ?", [value[0], value[1]], (error, results) => {
                if (error) return reject(error);
                else if (results.length <= 0) {
                    finalValues.push(value);
                    resolve(results);
                }
                else console.log("Name already registered at given year.")
            });
        }
    });
    promise.then(
        (value) => {
            if (finalValues.length === 0) {
                console.log("No names to add to db");
                return;
            }

                console.log(finalValues)
                pool.query("INSERT INTO register (name, year) VALUES ?", [finalValues], (error, results) => {
                    if (error) console.log(error);
                    else console.log("Name added to DB.");
                });
        },

        (error) => {
            console.log(error);
        }
    );
}

// send email to customer
const sendEmail = async (session) => {
    const object = await stripe.checkout.sessions.listLineItems(session.id);

    const email = session.customer_details.email;
    const transporter = nodemailer.createTransport(transporterBody);

    transporter.sendMail({
        from: "kundeservice@russeregisteret.no",
        to: email,
        subject: "Bekreftelse av navneregistrering",
        text: `Gratulerer! Din registrering i Russeregisteret er fullført \n\nFølgende navn er nå registrert i vårt register ${object.data.map(item => { return `${item}, ` })}og er nå tilgjenglig i vårt register. \n\nHvis du skulle lure på noe, så er det bare å svare oss på denne mailen. Ha en fin russetid! \n\nMed vennlig hilsen \nRusseregisteret`,
        html: successBody(object)
    }, (error, info) => {
        if (error) console.log(error);
        else console.log(info.response);
    });
}

module.exports = {
    webhook
}