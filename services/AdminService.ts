import { restaurantInterface, restaurantPayload } from '../dto/Restaurant.dto.';
const mongoose = require('mongoose');
import { Password } from '../utility/Password';
import { ROLES } from '../utility/constants';

import { admin, restaurant } from '../models';
const passwordUtility = new Password();
export class AdminService {


    findAdmin = async function (name: string): Promise<any> {
        try {
            if (name) {
                return await admin.findOne({ "name": name })
            } else {
                return await admin.findById(name);
            }
        } catch (error) {
            console.log(error);
        }
    }
    

}


