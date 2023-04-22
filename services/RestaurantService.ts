import { customerInterface } from './../dto/Customer.dto';
import { food } from './../dto/food';
import { request, response } from 'express';
import { restaurant } from '../models/Restaurant';
import { ROLES } from '../utility/constants';
import { Password } from '../utility/Password';
import { restaurantInterface, restaurantUpdateInterface, restaurantActiveOrders } from './../dto/Restaurant.dto.';
import { AdminService } from './AdminService';
import { createOrderInterface } from '../dto';
import { customer } from '../models';
const passwordUtility = new Password();

export class RestaurantService {
    async updateRestaurantDetails(updateRestaurantDetails: restaurantUpdateInterface, restaurantEmail: string): Promise<string> {
        try {
            const { name, ownerName, foodType, pincode, address, phone } = updateRestaurantDetails;
            const filter = restaurantEmail;
            const update = { name: name, ownerName: ownerName, foodType: foodType, pincode: pincode, address: address, phone: phone }
            const doc = await restaurant.findOneAndUpdate(filter, update, {
                new: true
            });
            if (doc) {
                return `Your details have been updated successfully`
            } else {
                return `Details could not be saved.`
            }
        } catch (error) {
            throw error

        }
    }
    async deleteRestaurant(restaurantEmail: string): Promise<string | undefined> {
        try {
            const deleteResult: { acknowledged: boolean, deletedCount: number } = await restaurant.deleteOne({ "email": restaurantEmail })
            if (deleteResult && deleteResult.acknowledged && deleteResult.deletedCount === 1) {
                return `Restaurant deleted successfully`
            } else if (deleteResult && deleteResult.acknowledged) {
                return `Restaurant already deleted`
            }
        } catch (error) {
            throw error;
        }
    }

    async getRestaurantByid(restaurantId: string) {
        try {
            const restaurantResult = await restaurant.findById(restaurantId);
            if (restaurantResult !== null) {
                return {
                    success: true,
                    data: restaurantResult
                }
            } else {
                return ({ "message": "Restaurant data not available" })
            }
        }
        catch (error) {
            throw error;
        }
    }
    async getRestaurants(request: any, response: any) {
        try {
            const restaurants = await restaurant.find()
            if (restaurants !== null) {
                return {
                    success: true,
                    data: restaurants
                }
            } else {
                return ({ "message": "Restaurant data not available" })
            }
        }
        catch (error) {
            throw error;
        }

    }
    async findRestaurant(name: string | undefined, email?: string): Promise<restaurantInterface> {
        if (email) {
            return await restaurant.findOne({ email: email })
        } else {
            return await restaurant.findById(name);
        }

    }
    async addRestaurant(request: any, response: any) {
        try {

            const inputParams: restaurantInterface = request.body
            const { name, ownerName, foodType, pincode, address, phone, email, password, food } = inputParams;
            const checkExisting: restaurantInterface = await this.findRestaurant(undefined, email);
            if (checkExisting) {
                throw new Error("Restaurant already exists");
            }
            const salt = await passwordUtility.generateSalt();
            const encryptedpassword = await passwordUtility.createEncryptedPassword(password, salt);
            const newRestaurant = new restaurant({
                name: name,
                ownerName: ownerName,
                foodType: foodType,
                pincode: pincode,
                address: address,
                phone: phone,
                email: email,
                password: encryptedpassword,
                salt: salt,
                role: ROLES.RESTAURANT,
                food: food,
                activeOrders: [],
                deliveredOrders: []

            })
            const insertResult = await newRestaurant.save();
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
    async updateMenu(restaurantEmail: string, food: any): Promise<string> {
        try {
            const filter = restaurantEmail;
            const update = { food: food }
            const doc = await restaurant.updateOne({email:restaurantEmail}, update);
            if (doc) {
                return `The menu has been updated successfully`
            } else {
                return `The menu could not be updated please try again`
            }
        } catch (error) {
            throw error;
        }
    }
    async getRestaurantsAndMenu(): Promise<{ retaurantName: string, food: { foodType: string, dishes: string[] }[] }[] | null> {
        try {

            const restaurants: restaurantInterface[] = await restaurant.find({}, { _id: 0 })
            const retaurantsAndFoodOptions: { retaurantName: string, food: { foodType: string, dishes: string[] }[] }[] = [];

            if (restaurants !== null) {
                for (let index = 0; index < restaurants.length; index++) {
                    retaurantsAndFoodOptions!.push({ retaurantName: restaurants[index].name, food: restaurants[index].food })
                }
                console.log(JSON.stringify(retaurantsAndFoodOptions))
                return retaurantsAndFoodOptions
            } else {
                return null;
            }
        } catch (error) {
            throw error
        }

    }
    async createOrder(orderDetials: createOrderInterface, customerEmail: string): Promise<string> {
        try {
            const availableItems: string[] = [];
            const unavailableItems: string[] = [];
            const restaurantDetails: restaurantInterface = await restaurant.findOne({ 'name': orderDetials.restaurantName });
            if (restaurantDetails == null) {
                throw new Error(`the Resturant ${orderDetials.restaurantName} does not exist`)
            }
            for (let i = 0; i < orderDetials.items.length; i++) {
                for (let j = 0; j < restaurantDetails.food.length; j++) {
                    if (restaurantDetails.food[j].dishes.includes(orderDetials.items[i].itemName)) {
                        availableItems.push(orderDetials.items[i].itemName)
                    } else {
                        unavailableItems.push(orderDetials.items[i].itemName)
                    }
                }
            }
            if (unavailableItems.length || restaurantDetails.food.length ===0 ) {
                console.log(unavailableItems)
                throw new Error(`Some items are not available. Please remove the items and try again`)
            } else {
                //update the restaurants active orders.
                let orderNumber: string = '';
                if (restaurantDetails.activeOrders.length > 0) {
                    const orderNumberArray: string[] = restaurantDetails.activeOrders[restaurantDetails.activeOrders.length - 1].orderNumber.split('-');
                    const numberSuffix = parseInt(orderNumberArray[1]) + 1;
                    orderNumber = orderNumberArray[0] + '-' + numberSuffix;

                } else if (restaurantDetails.deliveredOrders.length > 0) {
                    const orderNumberArray: string[] = restaurantDetails.deliveredOrders[restaurantDetails.deliveredOrders.length - 1].orderNumber.split('-');
                    const numberSuffix = parseInt(orderNumberArray[1]) + 1;
                    orderNumber = orderNumberArray[0] + '-' + numberSuffix;
                } else {
                    orderNumber = 'ORD-10001';
                }
                const orderedItems = orderDetials.items
                let restaurantActiveOrders: any = []
                if (restaurantDetails.activeOrders.length > 0) {
                    restaurantActiveOrders = restaurantDetails.activeOrders
                    restaurantActiveOrders.push({
                        orderNumber,
                        items: orderedItems,
                        customerEmail: customerEmail
                    })
                } else {
                    restaurantActiveOrders = {
                        orderNumber,
                        items: orderedItems,
                        customerEmail: customerEmail
                    }
                }
                const filter = restaurantDetails.email;
                const update = { activeOrders: restaurantActiveOrders }
                const doc = await restaurant.updateOne({email:restaurantDetails.email}, update);
                //update the customers active orders.
                const customerDetails: customerInterface = await customer.findOne({ email: customerEmail });
                let customerActiveOrders: any = [];
                if (customerDetails.activeOrders.length > 0) {
                    const customerActiveOrders = customerDetails.activeOrders;
                    customerActiveOrders.push({
                        orderNumber,
                        items: orderedItems,
                        restaurantName: restaurantDetails.name
                    })
                } else {
                    customerActiveOrders = {
                        orderNumber,
                        items: orderedItems,
                        restaurantName: restaurantDetails.name
                    }
                }
                const customerFilter = customerEmail;
                const updateCustomerOrders = { activeOrders: customerActiveOrders }
                const customerDoc = await customer.updateOne({email:customerEmail}, updateCustomerOrders, {
                    new: true
                });
                console.log(customerDoc)
                if (doc && customerDoc) {
                    return `The Order has been placed Successfully`
                } else {
                    return `The order could not be placed please try again`
                }
            }
        } catch (error) {
            throw error;
        }
    }
    async getRestaurantActiveOrders(restaurantEmail:string):Promise<restaurantActiveOrders>{
        try {
            return await restaurant.find({email:restaurantEmail},{activeOrders:1});
        } catch (error) {
            throw error;
        }

    }

}