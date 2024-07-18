const {Client} = require('pg');
const bodyParser = require('body-parser');
const uuid = require('uuid');
const express = require('express');

const server = express(); 

server.use(bodyParser.json()); 

const client = new Client({
    user: "postgres",
    password: "postgres",
    host: "localhost",
    port: 5432,
    database: "acme_reservation_planner",
});

const createTables = async () => {
    const SQL = `
    DROP TABLE IF EXISTS reservations;
    DROP TABLE IF EXISTS restaurants;
    DROP TABLE IF EXISTS customers;
    
    CREATE TABLE customers(
    id UUID PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE);
    
    CREATE TABLE restaurants(
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE);

    CREATE TABLE reservations(
    id UUID PRIMARY KEY,
    date DATE NOT NULL,
    party_count INTEGER NOT NULL,
    restaurant_id UUID REFERENCES restaurants(id) NOT NULL,
    customer_id UUID REFERENCES customers(id) NOT NULL);
    `;

    await client.query(SQL);
};

const createCustomer = async ({name}) => {
    const SQL = `INSERT INTO customers(id,name) VALUES ($1,$2) RETURNING *;`
    const dbResponse = await client.query(SQL, [uuid.v4(), name]);
    return dbResponse.rows[0];
};

const createRestaurant = async ({name}) => {
    const SQL = `INSERT INTO restaurants(id,name) VALUES ($1,$2) RETURNING *;`
    const dbResponse = await client.query(SQL, [uuid.v4(), name]);
    return dbResponse.rows[0];
};


const createReservation = async ({date, party_count, restaurant_id, customer_id}) => {
    const SQL = `INSERT INTO reservations(id,date, party_count, restaurant_id, customer_id) VALUES ($1,$2,$3,$4,$5) RETURNING *;`
    const dbResponse = await client.query(SQL, [
        uuid.v4(),
        date, 
        party_count, 
        restaurant_id, 
        customer_id
    ]);
    return dbResponse.rows[0];
};

const fetchCustomers = async() => {
    const SQL = `SELECT * from customers`;
    const dbResponse = await client.query(SQL);
    return dbResponse.rows;
};


const fetchRestaurants = async() => {
    const SQL = `SELECT * from restaurants`;
    const dbResponse = await client.query(SQL);
    return dbResponse.rows;
};

const fetchReservations = async() => {
    const SQL = `SELECT * from reservations`;
    const dbResponse = await client.query(SQL);
    return dbResponse.rows;
};

const destroyReservation = async({id, customer_id}) => {
    const SQL = `DELETE from reservations WHERE id=$1 and customer_id=$2;`;
    await client.query(SQL, [id, customer_id,]);
}


module.exports = {
    client, 
    createCustomer,
    createReservation,
    createRestaurant,
    createTables,
    fetchCustomers,
    fetchRestaurants,
    fetchReservations,
    destroyReservation
};

