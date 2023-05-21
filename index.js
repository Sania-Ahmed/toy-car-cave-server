const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;
const ObjectID = require('mongodb').ObjectId;



app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.74wxpsk.mongodb.net/?retryWrites=true&w=majority`;


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
   
    
    console.log("Pinged your deployment. You successfully connected to MongoDB!");

    const database = client.db("toyCarDB");
    const carCollection = database.collection("carCollection");

    // CRUD started here
    app.get('/searched/:name', async (req ,res) => {
      const name = req.params.name ;
      console.log(name)
      const result = await carCollection
      .find({
        toy_name: { $regex: name, $options: "i"}
      }).toArray() ;
      
      res.send(result);
    } )

    app.post('/postCar', async (req, res) => {
      const body = req.body;
      body.createdAt = new Date();
      const result = await carCollection.insertOne(body);
      res.send(result)

    })

    app.get('/allCars', async (req, res) => {
      const result = await carCollection.find({}).limit(20).toArray();
      res.send(result);
    })
    
    app.get('/cars/:sub_category', async (req, res) => {
      const sub_category = req.params.sub_category ;
      const result = await carCollection.find({ sub_category : sub_category}).toArray() ;
      res.send(result) ;
    })


    app.get('/myCars/:email', async (req, res) => {
      const result = await carCollection.find({ seller_email: req.params.email }).toArray();
      res.send(result);
    })

    app.get('/sortedAllCars/:email', async (req, res) => {
      const result = await carCollection.find({ seller_email: req.params.email }).sort({ createdAt: -1 }).toArray();
      res.send(result);
    })

    app.get('/myCar/:id', async (req, res) => {
      const id = req.params.id;
      console.log(id)
      const query = { _id: new ObjectID(id) }
      const result = await carCollection.findOne(query);
      console.log(result)
      res.send(result);
    })

    app.put('/updateCar/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectID(id) };
      const options = { upsert: true };
      const updatedToy = req.body;
      const toy = {
        $set: {
          toy_name: updatedToy.toy_name,
          sub_category: updatedToy.sub_category,
          price: updatedToy.price,
          rating: updatedToy.rating,
          quantity: updatedToy.quantity,
          details: updatedToy.details,
          photo: updatedToy.photo
        }
      }

      const result = await carCollection.updateOne(filter, toy, options)
      res.send(result) ;

    })


    app.delete('/myCars/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectID(id) }
      const result = await carCollection.deleteOne(query);
      res.send(result);
    })





  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('car cave is runninngg')
})

app.listen(port, () => {
  console.log(`car cave is running on ${port}`)
})