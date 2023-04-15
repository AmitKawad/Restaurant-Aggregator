import express, { request, response, NextFunction, Router } from 'express';
const router = express.Router();
import { AdminService } from './../services/AdminService'
import { Password as PasswordUtility } from '../utility/Password';
//create an instance of AdminController
const adminService = new AdminService();
const passwordUtility = new PasswordUtility();

router.get('/', (request, response) => {
    response.json({ message: `Hello from admin route` });
})
const addRestaurant = async function (request: any, response: any) {
    try {
        passwordUtility.authorizeRole(request, response, ['Admin'])
        const APIresponse = await adminService.addRestaurant(request, response);
        response.json(APIresponse);

    } catch (error: any) {
        response.json({
            success: false,
            error: error.message
        })

    }

}
const getRestaurants = async function (request: any, response: any) {
    try {
        passwordUtility.authorizeRole(request, response, ['Admin'])
        const APIresponse = await adminService.getRestaurants(request, response);
        response.json(APIresponse);
    } catch (error: any) {
        response.json({
            success: false,
            error: error.message
        })
    }
}
const getRestaurantByid = async function (request: any, response: any) {
    try {
        passwordUtility

    } catch (error) {
        throw error;

    }
}
const login = async function (request: any, response: any) {
    try {
        const user = {
            userName: request.query.userName,
            role: 'Admin'
        }
        const accessToken = await passwordUtility.sign(user, <string>process.env['ACCESSKEY'])
        response.json({ accessToken: accessToken });

    } catch (error) {
        throw error;

    }
}





router.post('/restaurant', addRestaurant);
router.get('/restaurants', passwordUtility.authenticateToken, getRestaurants);
router.get('/restaurant/:id', getRestaurantByid);
router.post('/login', login);

module.exports = router
