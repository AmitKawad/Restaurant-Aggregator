import { createOrderInterface } from './../dto/CreateOrder';
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
const login = async function (request, response) {
    try {
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

/**
 * 
 * @param request 
 * @param response 
 * API to fetch active Orders for customer
 */
const activeOrders = async function (request: any, response: any) {
    try {
        if (request.user.role !== ROLES.CUSTOMER) {
            response.send(403);
        } else {
            const activeOrders = await customerService.getActiveOrders(request.user.email);
            return response.json({
                success: true,
                data: activeOrders
            })
        }
    } catch (error: any) {
        return ({
            success: false,
            message: error.message
        })
    }

}
/**
 * 
 * @param request 
 * @param response 
 * API to fetch delivered Orders for customer
 */
const deliveredOrders = async function (request: any, response: any) {
    try {
        if (request.user.role !== ROLES.CUSTOMER) {
            response.send(403);
        } else {
            const deliveredOrders = await customerService.getDeliveredOrders(request.user.email);
            return response.json({
                success: true,
                data: deliveredOrders
            })
        }
    } catch (error: any) {
        return ({
            success: false,
            message: error.message
        })
    }

}


const deleteCustomer = async function (request, response) {
    try {
        if (request.user.role !== ROLES.ADMIN) {
            return response.sendStatus(403);
        } else {
            const deleteRsult = await customerService.deleteCustomer(request.params.email);
            response.json({ success: true, message: deleteRsult })
        }


    } catch (error: any) {
        response.json({
            success: false,
            error: error.message
        })

    }
}
router.post('', signup)
router.post('/login', login)
router.get('/activeOrders', passwordUtility.authenticateToken, activeOrders)
router.get('/deliveredOrders', passwordUtility.authenticateToken, deliveredOrders)
router.delete('/:email', passwordUtility.authenticateToken, deleteCustomer)
