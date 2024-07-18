const {client, createCustomer,createTables,createRestaurant, fetchCustomers, fetchRestaurants, fetchReservations, createReservation,destroyReservation} = require('./db');

const init = async () => {
    console.log("connecting to database");
    await client.connect();
    console.log("connected to database");

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

    await client.end();

}; 

init();