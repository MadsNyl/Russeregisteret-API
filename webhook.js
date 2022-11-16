const stripe = require('stripe')("sk_test_51M1UgFCqZu8jsl6Y4AAl8gbgTJ8fBXIY0gv1ksM005fTZSLhkkTBRrZeH3Sp442UEnzUg9A1AHYrwWIoAW3IvLqF00yhko3Mys");
const express = require('express');
const cors = require("cors");
const bodyParser = require("body-parser");
const app = express();
const connection = require("./connection.js");
const pool = connection.connection;
// Use JSON parser for all non-webhook routes
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: false }));
app.use((req, res, next) => {
    if (req.originalUrl === '/webhook') {
      next();
    } else {
      express.json()(req, res, next);
    }
});

app.use(cors({
    origin: "*"
}));

const endpointSecret = "whsec_a25334fb79318976ba0ae28a12bb3f05658c26f01df1cc5bf37644f122870f41";

const fulfillOrder = async (session) => {
    
    const object = await stripe.checkout.sessions.retrieve(session.id, {
        expand: ["line_items"]
    });
    const values = object.line_items.data[0].description.split(" ");
    const name = values[0];
    const year = values[1];

    pool.query("INSERT INTO register (name, year) VALUES (?, ?)", [name, year], (error, results) => {
        if (error) console.log(error);
        else console.log("Name added to DB.");
    });
}

app.post('/webhook', express.raw({type: 'application/json'}), (request, response) => {
    const payload = request.body;
    const sig = request.headers["stripe-signature"];

    let event;

    try {
        event = stripe.webhooks.constructEvent(payload, sig, endpointSecret);
    } catch (err) {
        console.log(err.message);
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        fulfillOrder(session);
    }
  
    response.status(200).end();
});
  
app.listen(4242, () => console.log('Running on port 4242'));