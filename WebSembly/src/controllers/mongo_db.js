const example_programs = require("./../models/example_program_schema");
const user = require("./../models/user_schema");

const chalk = require("chalk");
const debug = require('debug')('app');

function password_hash(password) {

    var hash = 5831 << 2;
    for (var i = 0; i < password.length; i++) {

        hash = ((hash << 3) ^ hash) ^ password.charCodeAt(i);

    }
    return (hash & 0xFFFFFFFFFF).toString(16);

}

exports.get_example_programs = (req, res, next) => {

    example_programs.find()

        .then(found_results => {
            
            debug(chalk.cyan("RETURNING DATA: ", found_results))
            res.status(200).json({found_results})

        })

        .catch(error => {
            
            debug(chalk.red("ERROR: Could not return data."))
            res.status(503).json({ error : "ERROR: Could not fetch example programs :("})

        })

}

exports.get_user_by_email = (req, res, next) => {

    debug(chalk.magenta("Searching for email in collection: ", user.collection.name));

    var email_address = req.params.emailAddress;
    user.findOne({email : email_address})

        .then(found_user => {

            if (!found_user) {

                debug(chalk.yellow("WARNING: No user found with email: ", email_address))
                res.status(405).json({ error : "No user found with that email :("})
                return;
            
            }

            password = req.body.password;
            if (password_hash(password) != found_user.password) {
                debug(chalk.yellow("WARNING: Incorrect password for email: ", email_address))
                res.status(405).json({ error : "Incorrect password :("})
                return;
            }

            debug(chalk.cyan("RETURNING DATA FOR NAME: ", found_user.name))
            res.status(200).json({user : found_user})
        
        })

        .catch(error => {

            debug(chalk.red("ERROR: Could not return data."))
            res.status(503).json({ error : "ERROR: Could not fetch user :("})  
        
        })

}

exports.create_user = async (req, res, next) => {

    try {

        const user_name = req.body.name;
        const email_address = req.body.email;
        const password = req.body.password;

        const user_exists = await user.findOne({ email : email_address });
        if (user_exists) {
        
            return res.status(400).json({ error : "ERROR: A user with that email already exists :("})
        
        }

        const new_user = new user({

            name : user_name,
            email : email_address,
            password : password_hash(password),
            programs : {}
        
        });

        await new_user.save();
        res.status(201).json({ message : "SUCCESS: User created."})

    }

    catch(error) {

        if (error.name == "ValidationError") {
        
            const error_messages = Object.values(error.errors).map(e => e.message);
            return res.status(400).json({ error : "ERROR: " + error_messages[0]})   

        }

        if (error.code == 11000) {

            return res.status(400).json({ error : "ERROR: A user with that name or email already exists :("})

        }

    }

}

exports.get_user_programs = (req, res) => {

    const email_address = req.params.emailAddress;

    user.findOne({ email: email_address })
        .select('programs') 
        .then(found_user => {

            if (!found_user) {

                return res.status(404).json({ error: "User not found" });

            }

            debug(chalk.cyan(`FETCHING PROGRAMS FOR: ${email_address}`));
            res.status(200).json(found_user.programs);

        })
        .catch(err => {
            debug(chalk.red("ERROR:", err));
            res.status(500).json({ error: "Could not retrieve programs :(" });
        });

};

exports.delete_program = (req, res) => {

    const email_address = req.body.email;
    const program_name = req.params.programName;
    const update = {}
    update[`programs.${program_name}`] = "";

    user.findOneAndUpdate(
        {email: email_address},
        {$unset : update},
        { new : true}

    )
    .then(found_user => {

        if (!found_user) {

            return res.status(404).json({ error: "User not found :(s" });

        } 

        debug(chalk.red(`DELETED PROGRAM: ${program_name} FOR USER: ${email_address}`));
        res.status(200).json({ message : "Program deleted successfully."})

    })
    .catch(err => {

        debug(chalk.red("ERROR:", err));
        res.status(500).json({ error: "Could not delete program :(" });

    })

}

exports.save_program = (req, res) => {

    const email_address = req.params.emailAddress;
    const program_name = req.body.name;
    const program_code = req.body.code;

    const update = {}
    update[`programs.${program_name}`] = program_code;

    user.findOneAndUpdate(

        {email: email_address},
        {$set : update},
        { new : true, upsert : true }

    )
    .then(found_user => {

        debug(chalk.green(`SAVED PROGRAM: ${program_name} FOR USER: ${email_address}`));
        res.status(200).json({ message : "PROGRAM SAVED SUCCESSFULLY."})

    })


}