const {client, createCustomer,createTables,createRestaurant, fetchCustomers, fetchRestaurants, fetchReservations, createReservation,destroyReservation} = require('./db');
const express = require('express');
const server = express();

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
server.post('/api/customers/:id/reservations', async(req,res,next) => {
    try{
        const {customer_id} = req.params;
        const reservation = await createReservation({...req.body, customer_id});
        res.sendStatus(201).send(reservation);
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
server.use((err, req, res) => {
    res.status(err.status ||500).send({err});
})


//init function

const init = async () => {
    await client.connect();

    await createTables();
    console.log("tables created");

    const [maria, eric, jason, sweetgreen, chipotle, diginn] = await Promise.all([
        createCustomer({name: "Maria"}),
        createCustomer({name: "Eric"}),
        createCustomer({name: "Jason"}),
        createRestaurant({name: "Sweet Green"}),
        createRestaurant({name: "Chipotle"}),
        createRestaurant({name: "Dig Inn"}),
    ]);

    console.log("tables seeded");
    console.log("Maria", maria);
    console.log("Sweet Green", sweetgreen);

    const customers = await fetchCustomers();
    console.log("customers:", customers);

    const restaurants = await fetchRestaurants();
    console.log("restaurants:", restaurants);

    const [resy1, resy2] = await Promise.all([
        createReservation({customer_id: maria.id,restaurant_id: sweetgreen.id, date: '07/18/2024', party_count : 4}),
        createReservation({customer_id: eric.id,  restaurant_id: chipotle.id , date: '07/20/2024' ,  party_count : 3})
    ]);

    console.log("reservation for Maria", resy1);
    console.log("reservation for Eric", resy2);

    const reservations = fetchReservations();
    console.log(reservations);

    await destroyReservation({id: resy1.id, customer_id: maria.id});

    const PORT = process.env.PORT || 3000;
    server.listen(PORT, () => {
        console.log(`Server listening on port ${PORT}`)
    });

}; 

init();