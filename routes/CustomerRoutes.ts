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
 
    router.delete('/:email', passwordUtility.authenticateToken, deleteCustomer)
