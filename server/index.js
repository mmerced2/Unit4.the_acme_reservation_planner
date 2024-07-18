const {client, createCustomer,createTables,createRestaurant, fetchCustomers, fetchRestaurants, fetchReservations, createReservation,destroyReservation} = require('./db');
//create express server
const express = require('express');
const server = express();
//connect to db client 
client.connect();
//middleware
server.use(express.json());

//ROUTES
//GET /api/customers - returns array of customers
server.get('/api/customers', async(req,res,next) => {
    try{
        res.send(await fetchCustomers());
    }
    catch(error){
        next(error);
    }
});


//GET /api/restaurants - returns an array of restaurants
server.get('/api/restaurants', async(req,res,next) => {
    try{
        res.send(await fetchRestaurants());
    }
    catch(error){
        next(error);
    }
});


//GET /api/reservations - returns an array of reservations
server.get('/api/reservations', async(req,res,next) => {
    try{
        res.send(await fetchReservations());
    }
    catch(error){
        next(error);
    }
});

//POST /api/customers/:id/reservations - payload: an object which has a valid restaurant_id, date, and party_count.
//returns the created reservation with a status code of 201
server.post('/api/customers/:customer_id/reservations', async(req,res,next) => {
    try{
        res.status(201).send(
            await createReservation({
                customer_id: req.params.customer_id,
                restaurant_id: req.params.restaurant_id, 
                date: req.body.date, 
                party_count: req.body.party_count,
            })

        );
    }
    catch(error) {
        next(error);
    }
});


//DELETE /api/customers/:customer_id/reservations/:id - the id of the reservation to delete and the customer_id is passed in the URL, returns nothing with a status code of 204
server.delete('/api/customers/:customer_id/reservations/:id', async(req,res,next) => {
    try{
        const {customer_id, id} = req.params;
        await destroyReservation({customer_id,id});
        res.sendStatus(204);
    }
    catch(error){
        next(error);
    }
});

//error handling
server.use((err, req, res, next) => {
    res.status(err.status || 500).send({ error: err.message || err });
  });


const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
    console.log(`curl localhost:${PORT}/api/customers`);
    console.log(`curl localhost:${PORT}/api/restaurants`);
    console.log(`curl localhost:${PORT}/api/reservations`);
});

