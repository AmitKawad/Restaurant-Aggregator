import express, { request, response, NextFunction, Router } from 'express';
const router = express.Router();
import { AdminService } from './../services/AdminService'
//create an instance of AdminController

const adminService = new AdminService();
router.get('/', (request, response) => {
    response.json({ message: `Hello from admin route` });
})
const createVendor = async function () {
    try {
        const APIresponse = adminService.createVendor(request, response);
        response.json(APIresponse);

    } catch (error) {
        throw error;

    }

}
const getVendor = async function () {
    try {
        const APIresponse = adminService.getVendor(request, response);
        response.json(APIresponse);

    } catch (error) {
        throw error;

    }

}
const getVendorByid = async function(){
    try {
        const APIresponse = adminService.getVendorByid(request, response);
        response.json(APIresponse);
        
    } catch (error) {
        throw error;
        
    }
}



router.post('/vendor', createVendor);
router.get('/vendor', getVendor);

module.exports = router
