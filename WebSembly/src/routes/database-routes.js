const express = require('express');
const database_router = express.Router();

const database = require("./../controllers/mongo_db")

database_router.get('/examplePrograms', database.get_example_programs);
database_router.get('/user/programs/:emailAddress', database.get_user_programs);

database_router.post('/user/login/:emailAddress', database.get_user_by_email);
database_router.post('/user/create', database.create_user);

database_router.delete('/program/:programName', database.delete_program);

database_router.post('/program/:emailAddress', database.save_program);

module.exports = database_router;