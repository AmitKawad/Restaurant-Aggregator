import { VendorPayload, vendorInterface } from './../dto/Vendor.dto';
import { Password } from './../utility/Password';
import express, { request, response, NextFunction, Router } from 'express';
const router = express.Router();
import { Password as PasswordUtility } from '../utility/Password';
const passwordUtility = new PasswordUtility();
import { AdminService } from './../services/AdminService'


router.get('/', (request, response) => {
    response.json({ message: `Hello from vendor route` });

})
const login = async function (request: any, response: any) {
    try {
        const adminService = new AdminService();
        const vendor: vendorInterface = await adminService.findVendor('', request.params.email)
        if (vendor == null) {
            response.json({ message: 'Vendor with the provided email does not exist' });
        } else {
            await passwordUtility.validatePassword(request.params.password,vendor.password, vendor.salt)
            const user = {
                email: request.params.email,
                role: 'Vendor'
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

router.post('/login/:email/:password', login);

module.exports = router