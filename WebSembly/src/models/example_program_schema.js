const mongoose = require("mongoose");
const schema = mongoose.Schema;

const example_programs = new schema({

    "example program": {

        type: Map,
        of: String

    }

}, {collection: "example programs"});

module.exports = mongoose.model('example_programs', example_programs, "example programs")