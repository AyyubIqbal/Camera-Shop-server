const express = require('express')
const app = express()
const cors = require('cors');
require('dotenv').config();
const { MongoClient } = require('mongodb');
const ObjectId = require("mongodb").ObjectId;


const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sc2zp.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function main() {
    try {
        await client.connect();
        const db = client.db('camera_shop');
        const cameraCollection = db.collection('products');
        const usersCollection = db.collection('users');
        const orderCollection = db.collection('orders');
        const reviewsCollection = db.collection('reviews');

        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            // console.log(user?.role);
            var isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
                // res.json({ isAdmin });
            }
            res.json({ isAdmin });
        })

        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });

        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);

        });

        app.post('/products', async (req, res) => {
            const product = req.body;
            const result = await cameraCollection.insertOne(product);
            res.json(result);
        });

        app.get('/products', async (req, res) => {
            const products = await cameraCollection.find().toArray();
            res.json(products);
        });

        app.get('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const product = await cameraCollection.findOne(query);
            res.json(product);
        });

        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);
            res.json(result);
        });

        app.get('/orders', async (req, res) => {
            const orders = await orderCollection.find().toArray();
            res.json(orders);
        });

        app.post('/reviews', async (req, res) => {
            const review = req.body;
            const result = await reviewsCollection.insertOne(review);
            res.json(result);
        });

        app.get('/reviews', async (req, res) => {
            const reviews = await reviewsCollection.find().toArray();
            res.json(reviews);
        });
    }
    finally {
        // client.close();
    }
}

main().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello World')
})

app.listen(port, () => {
    console.log(`listening at ${port}`)
})