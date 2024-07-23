// Require Mongoose
const mongoose = require("mongoose");

// Define schema
const Schema = mongoose.Schema;

const accountSchema = new Schema({
    name: Schema.Types.String,
    color: Schema.Types.String,
    secret: {
        iv: Schema.Types.String,
        encryptedData: Schema.Types.String
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User"
    }

}, {timestamps: true});


// Compile model from schema
module.exports = mongoose.model("account", accountSchema);