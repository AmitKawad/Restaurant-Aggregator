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
const createVendor = async function (request: any, response: any) {
    try {
        const APIresponse = await adminService.createVendor(request, response);
        response.json(APIresponse);

    } catch (error: any) {
        response.json({
            success: false,
            error: error.message
        })

    }

}
const getVendors = async function (request: any, response: any) {
    try {
        const APIresponse = await adminService.getVendors(request, response);
        response.json(APIresponse);
    } catch (error: any) {
        response.json({
            success: false,
            error: error.message
        })
    }
}
const getVendorByid = async function (request: any, response: any) {
    try {
        passwordUtility

    } catch (error) {
        throw error;

    }
}
const login = async function (request: any, response: any) {
    try {
        const user = {
            userName:request.query.userName
        }
        const accessToken = await passwordUtility.sign(user,process.env['ACCESSKEY'])
        response.json({accessToken:accessToken});

    } catch (error) {
        throw error;

    }
}





router.post('/vendor', createVendor);
router.get('/vendors', passwordUtility.authenticateToken,getVendors);
router.get('/vendor/:id', getVendorByid);
router.post('/login', login);

module.exports = router
