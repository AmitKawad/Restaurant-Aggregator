import { CustomerService } from './../services/CustomerService';
import { Password } from './../utility/Password';
const passwordUtility = new Password();
import express, { request, response, NextFunction, Router } from 'express';
const router = express.Router();
module.exports = router;
const customerService = new CustomerService();

const signup = function(request,response){
const result = customerService.signupHelper(request.body);
    
}
router.post('/signup',passwordUtility.authenticateToken,signup)