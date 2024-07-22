// Require Mongoose
const mongoose = require("mongoose");

// Define schema
const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: Schema.Types.String,
    password: Schema.Types.String,
}, {timestamps: true});

// Compile model from schema
module.exports = mongoose.model("user", userSchema);