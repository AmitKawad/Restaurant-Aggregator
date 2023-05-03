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
import { createOrderInterface } from '../dto/CreateOrder';
const restaurantService = new RestaurantService();

const redisClient = createClient({
    url: "redis://redis:6380"
  });

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
            response.json({
                success:true,
                message:APIresponse
            });
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
            response.json({
                success:true,
                message:APIresponse
            });
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
/**
 * 
 * @param request 
 * @param response 
 * This method can be used by the restaurant to update their menu. 
 * The information restaurant whose menu has to be updated will be captured from the auth token 
 */
const updateMenu = async function (request: any, response: any) {
    const food = request.body;
    if (request.user.role === ROLES.RESTAURANT) {
        const resturantEmail = passwordUtility.decodeToken(request).email
        const updateMenuResult = await restaurantService.updateMenu(resturantEmail,food);
        
        response.json({ succss:true,message:updateMenuResult });
    }else{
        response.sendStatus(403)
    }
    
}
/**
 * 
 * @param request
 * @param response 
 * This method can be used to request an otp by providing a valid phone number
 * It will send out an OTP on the provided mobile number and keep it valid for 240 seconds
 */
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
/**
 * 
 * @param request 
 * @param response 
 * This method is used to validate the OTP which is generatedd with send OTP API. 
 * This OTP can be validated only if its done within 240 seconds after generating the OTP.
 */
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
/**
 * 
 * @param request 
 * @param response 
 * This API can be used only by admin to delete a requested restaurant from the the app
 */
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

/**
 * 
 * @param request 
 * @param response 
 * This API can be used by the restaurant to fetch their active orders.
 * The admin can use the GET all restaurant API to get all restaurant details and their active or delivered orders.
 */
const getActiveOrders = async function(request:any,response:any){
    try {
        if(request.user.role === ROLES.RESTAURANT){
        const activeOrdersResult: restaurantActiveOrders = await restaurantService.getRestaurantActiveOrders(request.user.email); 
        response.json({
            success:true,
            data:activeOrdersResult
        })
    }else{
        response.send(403);
    }
    } catch (error:any) {
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
 * This API can be used by any user to fetch the restaurant names and thier menu registered with the aggregator app
 */
const getRestaurantMenu = async function (request, response) {
    const restaurantAndFoodOptions = await restaurantService.getRestaurantsAndMenu();

    response.json({ success: true, data: restaurantAndFoodOptions })
}

/**
 * 
 * @param request 
 * @param response 
 * This API can be used by the customers only to place an order from the desired restaurant.
 */
const createOrder = async function (request, response) {
    try {
        if(request.user.role!==ROLES.CUSTOMER){
            response.send(403);
        }
        const orderDetails: createOrderInterface = request.body;
        const createOrderResponse = await restaurantService.createOrder(orderDetails, request.user.email);

        response.json({ success: true, data: createOrderResponse })
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
 * This API can be used only by admin to get all the details of all the registered restaurants in the app
 */
const getRestaurants = async function (request: any, response: any) {
    try {
        if (request.user.role === ROLES.ADMIN) {

            const APIresponse = await restaurantService.getRestaurants(request, response);
            response.json(APIresponse);
        } else{
            response.send(403);
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
 * This API is for restaurant to mark the order delivered. 
 */
const deliverOrder = async function (request: any, response: any) {
    try {
        if (request.user.role !== ROLES.RESTAURANT) {
            response.send(403);
        }
        const deliverOrderResult = await restaurantService.deliverOrder(request.user.email, request.params.orderNumber);
        response.json({ success: true, message: deliverOrderResult })
    } catch (error: any) {
        response.json({
            success: false,
            message: error.message
        })
    }

}
/**
 * 
 * @param request 
 * @param response 
 * This API returns the orders delivered by the logged in restaurant.
 */
const getDeliveredOrders = async function(request:any,response:any){
    try {
        if (request.user.role !== ROLES.RESTAURANT) {
            response.sendStatus(403);
        } else {
        const deliveredOrders = await restaurantService.getDeliveredOrders(request.user.email)
        return response.json({
            success:true,
            data:deliveredOrders
        })

        }
        
    } catch (error:any) {
        response.json({
            success:false,
            error:error.message
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
router.get('/menu',passwordUtility.authenticateToken, getRestaurantMenu)
router.post('/createOrder', passwordUtility.authenticateToken, createOrder)
router.get('/allRestaurants', passwordUtility.authenticateToken, getRestaurants);
router.post('/deliverOrder/:orderNumber',passwordUtility.authenticateToken,deliverOrder);
router.get('/getDeliveredOrders',passwordUtility.authenticateToken,getDeliveredOrders);



module.exports = router