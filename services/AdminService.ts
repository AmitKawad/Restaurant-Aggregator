import { vendorInterface } from './../dto/Vendor.dto';
const mongoose = require('mongoose');

import { vendor } from '../models';
export class AdminService {

    findVendor = async function (name: string | undefined, email?: string): Promise<string> {
        if (email) {
            return await vendor.findOne({ email: email })
        } else {
            return await vendor.findById(name);
        }

    }
    createVendor = async function (this: AdminService, request: any, response: any) {
        try {
            const inputParams: vendorInterface = request.body
            const { name, ownerName, foodType, pincode, address, phone, email, password } = inputParams;
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
            const checkExisting: string = await this.findVendor(undefined, email);
            if (checkExisting) {
                throw new Error("Vendor already exists");
            }
            const insertResult = await newVendor.save();
            if (insertResult) {
                return {
                    success: true,
                    message: `Data inserted successfuly`
                }
            }
        } catch (error) {
            throw error;
        }

    }
    getVendors = async function (request: any, response: any) {
        try {
            const vendors = await vendor.find()
            if (vendors !== null) {
                return {
                    success:true,
                    data:vendors
                }
            } else {
                return ({ "message": "Vendors data not available" })
            }
        }
        catch (error) {
            throw error;
        }

    }
    getVendorByid = async function (request: any, response: any) {

    }

}


