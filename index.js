const express = require("express");
const cors = require("cors");
const path = require("path");

require("dotenv").config();
const SK = process.env.STRIPE_SECRET_KEY;
const ENDPOINT_SECRET = process.env.STRIPE_ENDPOINT_SECRET;
const API_URL = process.env.URL;

const connection = require("./connection.js");
const pool = connection.connection;
const stripe = require("stripe")(SK);



const app = express();

// middleware
app.use((req, res, next) => {
    if (req.originalUrl === '/webhook') {
      next();
    } else {
      express.json()(req, res, next);
    }
});
app.use(cors({ origin: "*" }));

// static files
app.use(express.static(__dirname + "/frontend/dist"));
app.use(express.static(__dirname + "/frontend/src"));
app.use(express.static(__dirname + "/frontend/img"));

// index file
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "/frontend/src/index.html"));
});

// cart file
app.get("/cart", (req, res) => {
    res.sendFile(path.join(__dirname, "/frontend/src/cart.html"));
});

// cancel file

// search for name
app.get("/search", (req, res) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    
    pool.query(`SELECT name, year FROM register WHERE name LIKE '%${req.query.search}%' LIMIT ${limit + 1} OFFSET ${(page - 1) * limit}`, (error, results, fields) => {
        if (results.length == 0) {
            res.status(404).send("Søk ikke funnet.");
        }
        else {
            res.send(results);
        } 
    });
});

// checkout
app.post("/create-checkout-session", async (req, res) => {
    try {
        let cart = [];
        for (let i = 0; i < req.body.length; i++) {
            cart.push(
                {
                    price_data: {
                        currency: "nok",
                        product_data: {
                            name: `${req.body[i].name} ${req.body[i].year}`
                        },
                        unit_amount: 5900
                    },
                    quantity: 1
                }
            );
        }
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ["card"],
            line_items: cart,
            mode: "payment",
            success_url: `${API_URL}`,
            cancel_url: `${API_URL}/cart`
        });
        res.json({ url: session.url });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
});

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
    for (let value of values) {
        pool.query("SELECT * FROM register WHERE name = ? AND year = ?", [value[0], value[1]], (error, results) => {
            if (error) console.log(error);
            else if (results.length > 0) finalValues.push(value);
            else console.log("Name already registered at given year.")
        });
    }

    pool.query("INSERT INTO register (name, year) VALUES ?", [finalValues], (error, results) => {
        if (error) console.log(error);
        else console.log("Name added to DB.");
    });
}

app.post('/webhook', express.raw({type: 'application/json'}), (request, response) => {
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
    }
  
    response.status(200).end();
});

app.listen(3000);
