const mongoose = require("mongoose");
const schema = mongoose.Schema;

const user = new schema({

    "users": {

        user_name: {

        type: String,
        maxlength: 15,
        minlength: 3,
        required: true

        },

        email_address: {

            type: String,
            unique: true,
            match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            required: true

        },

        password: {

            type: String,
            select: false,
            minlength: 5,
            maxlength: 30,
            required: true

        },

        programs: {

        type: Map,
        of: String

        }

    }

},{collection: "users"});

module.exports = mongoose.model('user', user, 'users')