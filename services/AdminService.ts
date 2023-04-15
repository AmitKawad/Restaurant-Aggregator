import { restaurantInterface, restaurantPayload } from '../dto/Restaurant.dto.';
const mongoose = require('mongoose');
import { Password } from '../utility/Password';
import { ROLES } from '../utility/constants';

import { restaurant } from '../models';
const passwordUtility = new Password();
export class AdminService {

    findRestaurant = async function (name: string | undefined, email?: string): Promise<restaurantInterface> {
        if (email) {
            return await restaurant.findOne({ email: email })
        } else {
            return await restaurant.findById(name);
        }

    }
    addRestaurant = async function (this: AdminService, request: any, response: any) {
        try {
            const inputParams: restaurantInterface = request.body
            const { name, ownerName, foodType, pincode, address, phone, email, password, food } = inputParams;
            const salt = await passwordUtility.generateSalt();
            const encryptedpassword = await passwordUtility.createEncryptedPassword(password,salt);
            const newRestaurant = new restaurant({
                name: name,
                ownerName: ownerName,
                foodType: foodType,
                pincode: pincode,
                address: address,
                phone: phone,
                email: email,
                password: encryptedpassword,
                salt:salt,
                role:ROLES.RESTAURANT,
                food:food
            })
            const checkExisting: restaurantInterface = await this.findRestaurant(undefined, email);
            if (checkExisting) {
                throw new Error("Restaurant already exists");
            }
            const insertResult = await newRestaurant.save();
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
    getRestaurants = async function (request: any, response: any) {
        try {
            const restaurants = await restaurant.find()
            if (restaurants !== null) {
                return {
                    success:true,
                    data:restaurants
                }
            } else {
                return ({ "message": "Restaurant data not available" })
            }
        }
        catch (error) {
            throw error;
        }

    }
    getRestaurantByid = async function (restaurantId:string) {
        try {
            const restaurantResult =  await restaurant.findById(restaurantId);
            if (restaurantResult !== null) {
                return {
                    success:true,
                    data:restaurantResult
                }
            } else {
                return ({ "message": "Restaurant data not available" })
            }
        }
        catch (error) {
            throw error;
        }
        

    }

}


