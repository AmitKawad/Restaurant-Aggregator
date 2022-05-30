const mongoose = require('mongoose');
const vendorSchema = new mongoose.Schema({
    name:String,
    ownerName: String,
    foodType:[String],
    pincode: String,
    address:String,
    phone:String,
    email:String,
    password:String

})
const vendor = mongoose.model('vendor',vendorSchema);
export { vendor }
