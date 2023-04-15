const mongoose = require('mongoose');
const restaurantSchema = new mongoose.Schema({
    name:{ type: String, required: true },
    pincode: { type: String, required: true },
    address:{ type: String, required: true },
    phone:{ type: String, required: true },
    email:{ type: String, required: true },
    password:{ type: String, required: true },
    salt:{type:String, required:true},
    role:{type:String, required:true},
    openOrders:[{orderNumber:String}],
    completedOrders:[{orderNumber:String}]

},{
    toJSON: {
        transform(doc, ret){
            delete ret.password;
            delete ret.salt;
            delete ret.__v;
            delete ret.createdAt;
            delete ret.updatedAt;

        }
    },
    timestamps: true
})
const restaurant = mongoose.model('restaurant',vendorSchema);
export { restaurant }
