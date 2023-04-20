const mongoose = require('mongoose');
const adminSchema = new mongoose.Schema({
    name:{ type: String, required: true },
    password:{ type: String, required: true },
    salt:{type:String, required:true},
    role:{type:String, required:true},

},{
    toJSON: {
        transform(doc, ret){
            delete ret.password;
            delete ret.salt;

        }
    },
    timestamps: true
})
const admin = mongoose.model('admin',adminSchema);
export { admin }
