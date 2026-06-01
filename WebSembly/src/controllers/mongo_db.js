const example_programs = require("./../models/example_program_schema");
const user = require("./../models/user_schema");

const chalk = require("chalk");
const debug = require('debug')('app');

exports.get_example_programs = (req, res, next) => {

    example_programs.find().lean()

        .then(found_results => {
            
            debug(chalk.cyan("RETURNING DATA: ", found_results))
            res.status(200).json({examples : found_results})

        })

        .catch(error => {
            
            debug(chalk.red("ERROR: Could not return data."))
            res.status(500).json({ error : "ERROR: Could not fetch example programs :("})

        })

}