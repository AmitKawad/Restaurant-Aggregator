import { restaurantUpdateInterface, restaurantActiveOrders } from './../dto/Restaurant.dto.';
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
import { RestaurantService } from '../services/RestaurantService';
import { Utility } from '../utility/Utility';
import { ROLES } from '../utility/constants';
const restaurantService = new RestaurantService();

const redisClient = createClient();

redisClient.connect().then(function() {
    console.log('socket connection established')
}).catch(function (error:Error) {
    console.error('Error in eastablishing connection',error)
})

/**
 * 
 * @param request 
 * @param response 
 * @param NextFunction 
 * This login method is for the restaurant.
 * The restaurant can enter the username and password to get the auth token required for rest of the APIs
 */
const login = async function (request: any, response: any, NextFunction:any) {
    try {
        const adminService = new AdminService();
        const restaurant: restaurantInterface = await restaurantService.findRestaurant('', request.params.email)
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
/**
 * 
 * @param request 
 * @param response 
 * This method can be used to add restaurant into the aggregator app by the admin.
 * This can also be used by the restaurant as sign up API. However the restaurant must first request 
 * OTP to verfiy the number while signup. OTP is mandatory for the restaurant to add themselves.
 */
const addRestaurant = async function (request: any, response: any, next:any) {
    try {
        if (request.headers['authorization'] && passwordUtility.decodeToken(request).role === ROLES.ADMIN) {
            passwordUtility.verifyJWT(request.headers['authorization'].split(' ')[1]);
            const adminService = new AdminService();
            const APIresponse = await restaurantService.addRestaurant(request, response);
            response.json(APIresponse);
        } else if (!request.body.OTP) {
            throw new Error(`OTP is required to Signup for Restaurant. Please request for OTP before Signup to Verify your phone.\ If you are an admin please login to continue`);
        } else {
            const utility = new Utility();
            const validateOTPResult: boolean = await utility.validateOTP(request.body.mobile, request.body.otp);
            if (!validateOTPResult) {
                throw new Error(`OTP entered is invalid. Please try again!!`)
            }
            const adminService = new AdminService();
            const APIresponse = await restaurantService.addRestaurant(request, response);
            response.json(APIresponse);

        }


    } catch (error: any) {
        response.json({
            success: false,
            error: error.message
        })
    }

}
/**
 * 
 * @param request 
 * @param response 
 * This method can be used by admin as well as Resturant to update the details of the restaurant. 
 */
const updateRestaurantDetails = async function (request: any, response: any) {
    try {
        if (request.user.role === ROLES.ADMIN || ROLES.RESTAURANT) {
            const restaurantService = new RestaurantService();
            const restaurantEmail = request.params.email;
            //const restaurantEmail:string = passwordUtility.decodeToken(request).role === 'Restaurant'? passwordUtility.decodeToken(request).email : request.params.email;
            if (passwordUtility.decodeToken(request).role === ROLES.RESTAURANT) {
                if (passwordUtility.decodeToken(request).email !== restaurantEmail) {
                    throw new Error(`The email entered does not match with the email of logged in Restaurant`)
                }
            }
            const restaurantDetails: restaurantUpdateInterface = request.body
            const UpdateRestaurantDetailsResponse = await restaurantService.updateRestaurantDetails(restaurantDetails, restaurantEmail);
            response.json({
                success: true,
                message: UpdateRestaurantDetailsResponse
            });
        } else{
            return response.sendStatus(403);
        }        
        

    } catch (error: any) {
        response.json({
            success: false,
            error: error.message
        })
    }

}
const updateMenu = async function (request: any, response: any) {
    //this will update the menu of the restaurant who is logged in.
    //this infromation will be captured from the auth token.
    const food = request.body;
    if (request.user.role === ROLES.RESTAURANT) {
        const resturantEmail = passwordUtility.decodeToken(request).email
        const updateMenuResult = await restaurantService.updateMenu(resturantEmail,food);
        
        response.json({ succss:true,message:updateMenuResult });
    }else{
        response.sendStatus(403)
    }
    
}

const RequestOTP = async function(request:any, response:any){
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

const validateOTP = async function(request:any,response:any){
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
const deleteRestaurant = async function (request:any, response:any) {
    try {
        //Only admin can delete a restaurant. Check the role of the user.
        //If the user is not admin the below function will return a Forbidden response
        if(request.user.role === ROLES.ADMIN){
        const restaurantEmail: string = request.params.email;
        const adminService = new AdminService();
        const deleteResult = await restaurantService.deleteRestaurant(restaurantEmail);
        response.json({
            success: true,
            message: deleteResult
        })
    } else{
        return response.sendStatus(403);
    }
    } catch (error: any) {
        response.json({
            success: false,
            message: error.message
        })
    }
}
const getActiveOrders = async function(request:any,response:any){
    try {
        const activeOrdersResult: restaurantActiveOrders = await restaurantService.getRestaurantActiveOrders(request.user.email); 
        response.json({
            success:true,
            data:activeOrdersResult
        })
    } catch (error:any) {
        response.json({
            success: false,
            error: error.message
        })
    }
}


router.post('/login/:email/:password', login);
router.post('', addRestaurant);
router.put('/updateMenu', passwordUtility.authenticateToken, updateMenu);
router.put('/:email',passwordUtility.authenticateToken, updateRestaurantDetails);
router.post('/requestOTP/:mobile', RequestOTP)
router.post('/validateOTP/:mobile/:OTP',validateOTP)
router.delete('/:email',passwordUtility.authenticateToken,deleteRestaurant);
router.get('/getActiveOrders',passwordUtility.authenticateToken,getActiveOrders)


module.exports = router