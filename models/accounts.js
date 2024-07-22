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

accountSchema.method('toClient', function() {
    var obj = this.toObject();
    //Rename fields

    obj.id = obj._id;
    delete obj._id;
    console.log('method called', obj)

    return obj;
});
// Compile model from schema
module.exports = mongoose.model("account", accountSchema);