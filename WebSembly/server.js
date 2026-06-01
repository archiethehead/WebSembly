const user_sessions = new Map();

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

app.get("/newToken", (req, res) => {
    
    assigned = false;
    while (!assigned) {

        random_token = Math.random(0, 0xFFFFFFFF).toString(16).slice(2);
        if (!user_sessions.has(random_token)) {

            assigned = true;
            
        };
    
    };

    res.status(200).json({token : random_token});

});

app.post("/ping", (req, res) => {

    const session_token = req.body.session_token;
    const user_data = req.body.user_data;
    
    if (!session_token) {

        return res.status(400).json({error : "ERROR: No session token provided :("});

    }

    user_sessions.set(session_token, {
        
        last_ping : Date.now(),
        data: user_data
    
    });

    debug(user_sessions);

    res.status(200).json({message : "SUCCESS: Ping recieved."});

})

setInterval(() => {

    const now = Date.now();
    const timeout_threshold = 60000;

    user_sessions.forEach((session_data, token) => {

        if (now - session_data.last_ping > timeout_threshold) {

            debug(chalk.yellow("WARNING: Session with token ", token, " has timed out."))
            user_sessions.delete(token);
        
        }

    })

}, 20000)

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