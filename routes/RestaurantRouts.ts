import { food } from '../dto/food';
import { restaurantPayload, restaurantInterface } from '../dto/Restaurant.dto.';
import { Password } from '../utility/Password';
import express, { request, response, NextFunction, Router } from 'express';
const router = express.Router();
import { Password as PasswordUtility } from '../utility/Password';
const passwordUtility = new PasswordUtility();
import { AdminService } from '../services/AdminService'
import jwt_decode from "jwt-decode";
import { restaurant } from '../models';
import { RedisClientType } from "@redis/client";
import { createClient } from 'redis';
const redisClient = createClient();

redisClient.connect().then(function() {
    console.log('socket connection established')
}).catch(function (error:Error) {
    console.error('Error in eastablishing connection',error)
})

const login = async function (request: any, response: any) {
    try {
        const adminService = new AdminService();
        const restaurant: restaurantInterface = await adminService.findRestaurant('', request.params.email)
        if (restaurant == null) {
            response.json({ message: 'Restaurant with the provided email does not exist' });
        } else {
            await passwordUtility.validatePassword(request.params.password, restaurant.password, restaurant.salt)
            const user = {
                email: request.params.email,
                role: 'Restaurant'
            }
            const accessToken = await passwordUtility.sign(user, <string>process.env['ACCESSKEY'])
            response.json({ accessToken: accessToken });

        }
    } catch (error: any) {
        response.json({
            success: false,
            error: error.message
        })
    }
}

const updateMenu = async function (request: any, response: any) {
    const food = request.body;
    passwordUtility.authorizeRole(request, response, ['Restaurant']);
    const filter = { email: request.params.email };
    console.log('request.params.email', request.params.email)
    console.log('inputParameters', food);
    const update = { food: food }
    const doc = await restaurant.findOneAndUpdate(filter, update, {
        new: true
    });
    const adminService = new AdminService();
    const updatedRestaurantDetails: restaurantInterface = await adminService.findRestaurant(undefined, request.params.email);
    response.json({ updatedRestaurantDetails });



}

const RequestOTP = async function(request, response){
    const { mobile } = request.params;
    const message = Math.floor(Math.random() * (3000 - 1000 + 1) + 1000)
    const client = require('twilio')(process.env['SID'], process.env['APIKEY']);
    await client.messages
        .create({
            body: message,
            from: '+15856326160',
            to: mobile
        })
        .then(message => console.log(message.sid));
    // insert the otp and mobile number to redis
    redisClient.set(mobile, message,{'EX':240});
    response.json({ message: `OTP successfully sent to ${mobile}` });
   
}

const validateOTP = async function(request,response){
    const getValue = await redisClient.get(request.params.mobile);
    if(request.params.OTP === getValue!.toString()){
        response.json({ message: "OTP successfully validated" });
    }else{
        response.json({
            success: false,
            error: "OTP validation failed"
        })
    }
}


router.post('/login/:email/:password', login);
router.put('/updateMenu/:email', passwordUtility.authenticateToken, passwordUtility.authorizeRestaurant, updateMenu);
router.post('/requestOTP/:mobile', RequestOTP)
router.post('/validateOTP/:mobile/:OTP',validateOTP)


module.exports = router