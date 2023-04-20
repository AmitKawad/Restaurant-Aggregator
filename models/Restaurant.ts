const mongoose = require('mongoose');
const restaurantSchema = new mongoose.Schema({
    name:{ type: String, required: true },
    ownerName: { type: String, required: true },
    foodType:[{ type: String, required: true }],
    pincode: { type: String, required: true },
    address:{ type: String, required: true },
    phone:{ type: String, required: true },
    email:{ type: String, required: true },
    password:{ type: String, required: true },
    salt:{type:String, required:true},
    role:{type:String, required:true},
    food:[{foodType:String,dishes:[String]}],
    activeOrders:[{orderNumber:String,customerName:String,customerContact:String}],
    deliveredOrders:[{orderNumber:String,customerName:String,customerContact:String}]

},{
    toJSON: {
        transform(doc, ret){
            delete ret.password;
            delete ret.salt;
            delete ret.__v;
            delete ret.createdAt;
            delete ret.updatedAt;
            for (let index = 0; index < ret.food.length; index++) {
                delete ret.food[index]._id
                
            }

        }
    },
    timestamps: true
})
const restaurant = mongoose.model('restaurants',restaurantSchema);
export { restaurant }
