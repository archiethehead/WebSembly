const mongoose = require("mongoose");
const schema = mongoose.Schema;

const user = new schema({

    name: {

    type: String,
    unique: true,
    maxlength: 15,
    minlength: 3,
    required: true

    },

    email: {

        type: String,
        unique: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        required: true

    },

    password: {

        type: String,
        minlength: 5,
        maxlength: 30,
        required: true

    },

    programs: {

        type: Map,
        of: String

    }

},{collection: "users"});

module.exports = mongoose.model('user', user, 'users')