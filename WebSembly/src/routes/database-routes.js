const express = require('express');
const database_router = express.Router();

const database = require("./../controllers/mongo_db")

// database_router.get('/user/:userID');
// database_router.get('/program/:userID/:programName');
// database_router.get('/programs/:userID');

database_router.get('/examplePrograms', database.get_example_programs);

// database_router.post('/user');
// database_router.post('/program/:userID');

// database_router.put('/user/:userID');
// database_router.put('/program/:userID/:programName');    

// database_router.delete('/user/:userID');
// database_router.delete('/program/:userID/:programName');

// database_router.get("/examplePrograms");

module.exports = database_router;