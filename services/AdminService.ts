import { vendorInterface } from './../dto/Vendor.dto';
const mongoose = require('mongoose');

import { vendor } from '../models';
export class AdminService {
    createVendor = async function(request:any,response:any){
        const inputParams:vendorInterface = request.body
       const{name,ownerName,foodType,pincode,address,phone,email,password} = inputParams;
        const newVendor = new vendor({
            name: name,
            ownerName: ownerName,
            foodType: foodType,
            pincode: pincode,
            address: address,
            phone: phone,
            email: email,
            password: password
        })
        newVendor.save(function(err:any,data:any){
            if(err){
                throw err;
            }
            else {
                console.log('Data saved');
            }
        })
        
        return {
            message:'Success'
        }

    }
    getVendor = async function(request:any,response:any){
    
    }
    getVendorByid = async function(request:any,response:any){
    
    }

}


