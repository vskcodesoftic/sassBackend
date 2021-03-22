const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator')
const Schema = mongoose.Schema;


const userSchema = new Schema({
    firstname: { type: String, required: true },
    lastname: { type: String, required: true },
    gender: { type: String, required: true },
    email: { type: String, required: true , unique : true},
    password: { type: String },
    profilePic : {type : String},
    role :{ type: String , default: 'customer'},
    status: {type : String , default : 'active'},
    phoneNumber: { type: Number, required: true },
    countryCode: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: Number, required: true },
    address: { type: String, required: true },
    ip: { type: String, required: true },
    browser: { type: String, required: true },
    location: { type: String, required: true },
    resetToken:{ type:String },
    expireToken:{ type:Date },
}, { versionKey: false });

userSchema.plugin(uniqueValidator)


module.exports = mongoose.model('User', userSchema);