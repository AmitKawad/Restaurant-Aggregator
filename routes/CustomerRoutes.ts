import { createOrder } from './../dto/CreateOrder';
import { Utility } from './../utility/Utility';
import { RestaurantService } from './../services/RestaurantService';
import { customerInterface } from './../dto/Customer.dto';
import { CustomerService } from './../services/CustomerService';
import { Password } from './../utility/Password';
const passwordUtility = new Password();
import express, { request, response, NextFunction, Router } from 'express';
import { ROLES } from '../utility/constants';
const router = express.Router();
module.exports = router;
const customerService = new CustomerService();
const restaurantService = new RestaurantService();
const utlity = new Utility();

const signup = async function (request, response) {
    try {
        const customerDetails: customerInterface = request.body
        const result = await customerService.sigupHelper(customerDetails);
        if (result) {
            response.json({
                success: true,
                message: result
            })
        }
    } catch (error: any) {
        response.json({
            success: false,
            message: error.message
        })
    }

}
const login = async function(request,response){
    try{
        const customer: customerInterface = await customerService.findCustomer(request.query.email)
        if (customer == null) {
            response.json({ message: 'Customer with the provided email does not exist' });
        } else {
            await passwordUtility.validatePassword(request.query.password, customer.password, customer.salt!)
            const user = {
                email: request.query.email,
                role: ROLES.CUSTOMER
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
// const createOrder = async function(request,response){
//     try{
//        //user
//     } catch (error: any) {
//         response.json({
//             success: false,
//             error: error.message
//         })
//     }

// }

const getRestaurantMenu = async function (request, response) {
    const restaurantAndFoodOptions = await restaurantService.getRestaurantsAndMenu();
    
    response.json({ success: true, data: restaurantAndFoodOptions })
}
const createOrder = async function (request, response) {
    const orderDetails:createOrder = request.body;
    const createOrderResponse = await restaurantService.createOrder(orderDetails,request.user.email);
    
    response.json({ success: true, data: createOrderResponse })
}
router.post('', signup)
router.post('/login', login)
//router.post('/createOrder',createOrder)
router.get('/restaurants',getRestaurantMenu)
router.post('/createOrder',passwordUtility.authenticateToken,createOrder)
