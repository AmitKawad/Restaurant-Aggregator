import { restaurantInterface } from "../dto";
import { customerActiveOrders, customerInterface } from "../dto/Customer.dto";
import { customer } from "../models";
import { ROLES } from "../utility/constants";
import { Password as PasswordUtility } from "../utility/Password";
const passwordUtility = new PasswordUtility();
import {MESSAGES} from './../utility/constants'


export class CustomerService {
     /**
      * 
      * @param customerDetails 
      * @returns 
      * Signup the customer into a seperate customer collection and store the required information
      */
     async sigupHelper(customerDetails: customerInterface) {
          try {

               const { name, pincode, address, phone, email, password } = customerDetails;
               const checkExisting: customerInterface = await this.findCustomer(email);
               if(checkExisting) {
                    throw new Error("Customer already exists");
               }
               const salt = await passwordUtility.generateSalt();
               const encryptedpassword = await passwordUtility.createEncryptedPassword(password, salt);
               const newCustomer = new customer({
                    name: name,
                    pincode: pincode,
                    address: address,
                    phone: phone,
                    email: email,
                    password: encryptedpassword,
                    salt: salt,
                    role: ROLES.CUSTOMER,
                    activeOrders: [],
                    deliveredOrders: []

               })

               const insertResult = await newCustomer.save();
               if (insertResult) {
                    return {
                         success: true,
                         message: `Data inserted successfuly`
                    }
               }
          } catch (error) {
               throw error;
          }

     }
     /**
      * 
      * @param customerEmail 
      * @returns 
      * Find the customer based on email in customer collection
      */
     async findCustomer(customerEmail: string): Promise<customerInterface> {
          try {
               return await customer.findOne({ 'email': customerEmail });

          } catch (error) {
               throw error;
          }
     }
     /**
      * 
      * @param customerEmail 
      * @returns 
      * Finds the customer with email id in customer collecction and delete
      */
     async deleteCustomer(customerEmail:string):Promise<string | undefined>{
          try {
               const deleteResult =  await customer.deleteOne({ email: customerEmail });
               if (deleteResult && deleteResult.acknowledged && deleteResult.deletedCount === 1) {
                    return MESSAGES.CUSTOMER_DELETED_SUCCESS
                }else if (deleteResult && deleteResult.acknowledged) {
                    return MESSAGES.CUSTOMER_ALREADY_DELETED
                }

          } catch (error) {
               throw error;
          }

     }
     /**
      * 
      * @param customerEmail 
      * @returns Promise<customerActiveOrders| []
      * Method to fetch active orders for the customers
      */
     async getActiveOrders (customerEmail:string):Promise<any>{
          try {
               const activeOrders:customerActiveOrders = await customer.find({email:customerEmail},{activeOrders:1})
               if(activeOrders){
                    return activeOrders;
               }else{
                    return [];
               }
               
          } catch (error) {
               throw error;
               
          }
     }
     /**
      * 
      * @param customerEmail 
      * @returns Promise<customerActiveOrders| []
      * Method to fetch delivered orders for the customers
      */
     async getDeliveredOrders(customerEmail: string): Promise<customerActiveOrders | []>{
          try {
               const deliveredOrders:customerActiveOrders = await customer.find({email:customerEmail},{deliveredOrders:1})
               if(deliveredOrders){
                    return deliveredOrders;
               }else{
                    return [];
               }
               
          } catch (error) {
               throw error;
               
          }
     }
}