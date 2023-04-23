import { RestaurantService } from './../services/RestaurantService';
import express, { request, response, NextFunction, Router } from 'express';
const router = express.Router();
import { AdminService } from './../services/AdminService'
import { Password as PasswordUtility } from '../utility/Password';
import { ROLES } from '../utility/constants';
//create an instance of AdminController
const restaurantService = new RestaurantService();
const passwordUtility = new PasswordUtility();

router.get('/', (request, response) => {
    response.json({ message: `Hello from admin route` });
})


const getRestaurantByEmail = async function (request: any, response: any) {
    try {
        if(request.user.role === ROLES.ADMIN){

        }else if(request.user.role === ROLES.RESTAURANT){

        }

    } catch (error) {
        throw error;

    }
}
const login = async function (request: any, response: any) {
    try {
        const adminService = new AdminService();
        const admin = await adminService.findAdmin(request.query.userName)
        if (admin == null) {
            response.json({ message: 'Admin with the provided name does not exist' });
        } else {
            await passwordUtility.validatePassword(request.query.password, admin.password, admin.salt)
            const user = {
                userName: request.query.userName,
                role: 'Admin'
            }
            const accessToken = await passwordUtility.sign(user, <string>process.env['ACCESSKEY'])
            response.json({ accessToken: accessToken });
        }
    } catch (error:any) {
        response.json({
            success: false,
            error: error.message
        })

    }
}





router.get('/restaurant/:email',passwordUtility.authenticateToken, getRestaurantByEmail);
router.post('/login', login);


module.exports = router
