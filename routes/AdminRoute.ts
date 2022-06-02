import express, { request, response, NextFunction, Router } from 'express';
const router = express.Router();
import { AdminService } from './../services/AdminService'
//create an instance of AdminController
const adminService = new AdminService();

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
        console.log('Inside getVendor');
        const APIresponse = await adminService.getVendors(request, response);
        response.json(APIresponse);
    } catch (error: any) {
        response.json({
            success: false,
            error: error.message
        })
    }
}
const getVendorByid = async function () {
    try {
        const APIresponse = adminService.getVendorByid(request, response);
        response.json(APIresponse);

    } catch (error) {
        throw error;

    }
}



router.post('/vendor', createVendor);
router.get('/vendors', getVendors);
router.get('/vendor:id', getVendorByid);

module.exports = router
