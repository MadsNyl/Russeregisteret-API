const express = require("express");
const cors = require("cors");
const path = require("path");

const { SK } = require("./settings/shared.js");

const connection = require("./connection.js");
const { webhook } = require("./webhook.js");
const { contactEmail } = require("./settings/email.js");
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
app.use(cors());


// send email from contact form
app.post("/contact", contactEmail);


// search for name
app.get("/search", (req, res) => {
    const page = parseInt(req.query.page);

    pool.query(`SELECT COUNT(*) as total FROM register WHERE name LIKE '%${req.query.search}%'`, (error, result, fields) => {
        if (error) console.log(error);
        else {
            pool.query(`SELECT name, year FROM register WHERE name LIKE '%${req.query.search}%' ORDER BY name LIMIT 10 OFFSET ${(page - 1) * 10}`, (error, names, fields) => {
                if (error) console.log(error);
                else {
                    result[0].page = page;
                    result[0].names = names;
                    res.send(result);
                }
            });
        }
    });
});

// check for name
app.get("/check", (req, res) => {
    pool.query(`SELECT COUNT(*) as total FROM register WHERE name LIKE '%${req.query.search}%'`, (error, result, fields) => {
        if (error) console.log(error);
        else {
            pool.query(`SELECT name, year FROM register WHERE name LIKE '%${req.query.search}%' ORDER BY name LIMIT 1`, (error, name, fields) => {
                if (error) console.log(error);
                else {
                    result[0].result = name;
                    res.send(result);
                }
            });
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
            success_url: `http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `http://localhost:3000/cart`
        });
        res.json({ url: session.url });
    } catch (error) {
        res.status(500).json({ error: error.message })
    }
});

// get session
app.get("/session", async (req, res) => {
    const id = req.query.session;

    if (id.length === 0 || !id) {
        console.log("Session ID not valid.");
        res.status(404).send("Session ID not valid.");
    } 

    try {
        const session = await stripe.checkout.sessions.listLineItems(id);
        res.send(session);
    } catch (e) {
        console.log(e);
        res.status(400).send("Session ID not found.");
    }
});


app.post('/webhook', express.raw({type: 'application/json'}), webhook);

app.listen(8080);
