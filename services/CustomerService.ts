import { restaurantInterface } from "../dto";
import { customerInterface } from "../dto/Customer.dto";
import { customer } from "../models";
import { ROLES } from "../utility/constants";
import { Password as PasswordUtility } from "../utility/Password";
const passwordUtility = new PasswordUtility();
import {MESSAGES} from './../utility/constants'


export class CustomerService {
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
     async findCustomer(customerEmail: string): Promise<customerInterface> {
          try {
               return await customer.findOne({ 'email': customerEmail });

          } catch (error) {
               throw error;
          }
     }
     async deleteCustomer(customerEmail:string):Promise<string | undefined>{
          try {
               console.log(customerEmail)
               const deleteResult =  await customer.deleteOne({ email: customerEmail });
               console.log(deleteResult)
               if (deleteResult && deleteResult.acknowledged && deleteResult.deletedCount === 1) {
                    return MESSAGES.CUSTOMER_DELETED_SUCCESS
                }else if (deleteResult && deleteResult.acknowledged) {
                    return MESSAGES.CUSTOMER_ALREADY_DELETED
                }

          } catch (error) {
               throw error;
          }

     }
}