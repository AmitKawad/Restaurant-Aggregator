import express, { request, response, NextFunction, Router } from 'express';
const router = express.Router();
import { AdminService } from './../services/AdminService'
//create an instance of AdminController
const adminService = new AdminService();

router.get('/', (request, response) => {
    response.json({ message: `Hello from admin route` });
})
const createVendor = async function (request:any,response:any) {
    try {
        const APIresponse = await adminService.createVendor(request, response);
        response.json(APIresponse);

    } catch (error:any) {
        response.json({
            success:false,
            error:error.message
        })

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
router.get('/vendor:id', getVendorByid);

module.exports = router
