require("dotenv").config()

const chalk = require('chalk');
const debug = require('debug')('app');

const express = require("Express");
const app = express();

app.use(express.json());
const morgan = require('morgan');
app.use(morgan('tiny'));

const mongoose = require("mongoose");
const connectionOptions = {
    serverSelectionTimeoutMS: 60000,
    socketTimeoutMS: 45000,
    family: 4
};

const MONGOURI = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}${process.env.MONGO_URL}`;
const website_routes = require("./src/routes/website-routes");
const database_routes = require("./src/routes/database-routes");


app.use("/", website_routes);
app.use("/database", database_routes);

const PORT = process.env._PORT || 8080;

app.listen(PORT, () => {

    debug('Server listening on port ' + chalk.green(PORT));

    mongoose.connect(MONGOURI, connectionOptions)

    .then(() => {

        debug(chalk.cyan("MongoDB Connection Successful"));

    })

    .catch(error => {
        
        debug(chalk.red("MongoDB Connection Unsuccessful"));
    
    })
    
});