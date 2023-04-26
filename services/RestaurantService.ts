import { customerInterface } from './../dto/Customer.dto';
import { restaurant } from '../models/Restaurant';
import { MESSAGES, ROLES } from '../utility/constants';
import { Password } from '../utility/Password';
import { restaurantInterface, restaurantUpdateInterface, restaurantActiveOrders, restaurantDeliveredOrders } from './../dto/Restaurant.dto.';
import { createOrderInterface } from '../dto';
import { customer } from '../models';
const passwordUtility = new Password();

export class RestaurantService {
    /**
     * 
     * @param updateRestaurantDetails 
     * @param restaurantEmail 
     * @returns Promise<string>
     * This method is used to update the restaurant details in the database. 
     * The fields that can be updated are namem ownername, foodType, pincode, address, phone
     * The email cant be updated as registered email is used as a primary identifier.
     */
    async updateRestaurantDetails(updateRestaurantDetails: restaurantUpdateInterface, restaurantEmail: string): Promise<string> {
        try {
            const { name, ownerName, foodType, pincode, address, phone } = updateRestaurantDetails;
            const filter = restaurantEmail;
            const update = { name: name, ownerName: ownerName, foodType: foodType, pincode: pincode, address: address, phone: phone }
            const doc = await restaurant.findOneAndUpdate(filter, update, {
                new: true
            });
            if (doc) {
                return MESSAGES.RESTAURANT_DETAILS_UPDATE_SUCCESS
            } else {
                return MESSAGES.RESTAURANT_DETAILS_UPDATE_FAILURE
            }
        } catch (error) {
            throw error

        }
    }
    /**
     * 
     * @param restaurantEmail 
     * @returns Promise<string | undefined>
     * This method can be used to delete the resturant in the database
     */
    async deleteRestaurant(restaurantEmail: string): Promise<string | undefined> {
        try {
            const deleteResult: { acknowledged: boolean, deletedCount: number } = await restaurant.deleteOne({ "email": restaurantEmail })
            if (deleteResult && deleteResult.acknowledged && deleteResult.deletedCount === 1) {
                return MESSAGES.RESTAURANT_DELETED_SUCCESS
            } else if (deleteResult && deleteResult.acknowledged) {
                return MESSAGES.RESTAURANT_ALREADY_DELETED
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
    /**
     * 
     * @param request 
     * @param response 
     * @returns 
     * This mehtod can be used to get all the restaurants registered in the database
     */
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
    /**
     * 
     * @param name 
     * @param email 
     * @returns Promise<restaurantInterface>
     * This method can be used to find a restaurant in database based on restaurant email
     */
    async findRestaurant(name: string | undefined, email?: string): Promise<restaurantInterface> {
        if (email) {
            return await restaurant.findOne({ email: email })
        } else {
            return await restaurant.findById(name);
        }

    }
    /**
     * 
     * @param request 
     * @param response 
     * @returns Promise<string|undefined>
     * This method is used to register the restaurant information into the database
     */
    async addRestaurant(request: any, response: any): Promise<string | undefined> {
        try {

            const inputParams: restaurantInterface = request.body
            const { name, ownerName, foodType, pincode, address, phone, email, password, food } = inputParams;
            const checkExisting: restaurantInterface = await this.findRestaurant(undefined, email);
            if (checkExisting) {
                throw new Error(MESSAGES.RESTAUTANT_ALREADY_EXIST);
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
                return MESSAGES.RESTAURANT_ADDED_SUCCESS
            }
        } catch (error) {
            throw error;
        }

    }
    /**
     * This method updates the menu of a givem restaurant.
     */
    async updateMenu(restaurantEmail: string, food: any): Promise<string> {
        try {
            const update = { food: food }
            const doc = await restaurant.updateOne({ email: restaurantEmail }, update);
            if (doc) {
                return MESSAGES.RESTAUARANT_MENU_UPDATE_SUCCESS
            } else {
                return MESSAGES.RESTAUARANT_MENU_UPDATE_FAILED
            }
        } catch (error) {
            throw error;
        }
    }
    /**
     * 
     * @returns Promise<{ restaurantName: string, food: { foodType: string, dishes: string[] }[] }[] | null>
     * This method fetches all the resturant names and their corresponding menus
     */
    async getRestaurantsAndMenu(): Promise<{ restaurantName: string, food: { foodType: string, dishes: string[] }[] }[] | null> {
        try {

            const restaurants: restaurantInterface[] = await restaurant.find({}, { _id: 0 })
            const restaurantsAndFoodOptions: { restaurantName: string, food: { foodType: string, dishes: string[] }[] }[] = [];

            if (restaurants !== null) {
                for (let index = 0; index < restaurants.length; index++) {
                    restaurantsAndFoodOptions!.push({ restaurantName: restaurants[index].name, food: restaurants[index].food })
                }
                return restaurantsAndFoodOptions
            } else {
                return null;
            }
        } catch (error) {
            throw error
        }

    }
    /**
     * 
     * @param orderDetials 
     * @param customerEmail 
     * @returns Promise<string>
     * Creates an active order in restaurant's database collection and corresponding customers collection who placed the order
     */
    async createOrder(orderDetials: createOrderInterface, customerEmail: string): Promise<string> {
        try {
            const availableItems: string[] = [];
            const unavailableItems: string[] = [];
            const restaurantDetails: restaurantInterface = await restaurant.findOne({ 'name': orderDetials.restaurantName });
            if (restaurantDetails == null) {
                throw new Error(`${orderDetials.restaurantName} does not exist`)
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
            if (unavailableItems.length || restaurantDetails.food.length === 0) {
                throw new Error(MESSAGES.ITEMS_NOT_AVAILABLE)
            } else {
                //update the restaurants active orders.
                let orderNumber: string = '';
                if (restaurantDetails.activeOrders.length > 0 || restaurantDetails.deliveredOrders.length > 0) {
                    const orderNumberArray: string[] = restaurantDetails.activeOrders[restaurantDetails.activeOrders.length - 1].orderNumber.split('-');
                    let numberSuffixActive = 0;
                    let numberSuffixDelivered = 0;
                    let numberSuffix = 0;
                    if (orderNumberArray.length !== 0) {
                        numberSuffixActive = parseInt(orderNumberArray[1]) + 1;
                    }
                    if (restaurantDetails.deliveredOrders.length > 0) {
                        const deliveredOrderNumberArray: string[] = restaurantDetails.deliveredOrders[restaurantDetails.deliveredOrders.length - 1].orderNumber.split('-');
                        numberSuffixDelivered = parseInt(deliveredOrderNumberArray[1]) + 1;
                    }
                    if (numberSuffixActive > numberSuffixDelivered) {
                        numberSuffix = numberSuffixActive;
                    } else {
                        numberSuffix = numberSuffixDelivered;
                    }
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
                const doc = await restaurant.updateOne({ email: restaurantDetails.email }, update);
                //update the customers active orders.
                const customerDetails: customerInterface = await customer.findOne({ email: customerEmail });
                let customerActiveOrders: any = [];
                if (customerDetails.activeOrders.length > 0) {
                    customerActiveOrders = customerDetails.activeOrders;
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
                const updateCustomerOrders = { activeOrders: customerActiveOrders }
                const customerDoc = await customer.updateOne({ email: customerEmail }, updateCustomerOrders);
                if (doc && customerDoc) {
                    return MESSAGES.ORDER_PLACED_SUCCESSFULY
                } else {
                    return MESSAGES.ORDER_PLACED_FAILED
                }
            }
        } catch (error) {
            throw error;
        }
    }
    /**
     * 
     * @param restaurantEmail 
     * @returns Promise<restaurantActiveOrders>
     * Fetches the active orders of a restaurant
     */
    async getRestaurantActiveOrders(restaurantEmail: string): Promise<restaurantActiveOrders> {
        try {
            return await restaurant.find({ email: restaurantEmail }, { activeOrders: 1 });
        } catch (error) {
            throw error;
        }

    }
    /**
     * 
     * @param restaurantEmail 
     * @param orderNumber 
     * @returns Promise<string>
     * This method marks transfers the active order to the delivered order in restaurant and customer collection
     */
    async deliverOrder(restaurantEmail: string, orderNumber: string): Promise<string> {
        try {
            const activeOrderDetails: restaurantInterface = await restaurant.findOne({ email: restaurantEmail }, { activeOrders: { $elemMatch: { orderNumber: orderNumber } } });
            if(activeOrderDetails==null){
                return MESSAGES.ORDER_DOES_NOT_EXIST;
            }
            // const activeOrders:restaurantActiveOrders = activeOrderDetails
            const update = await restaurant.update({ email: restaurantEmail }, { $pull: { activeOrders: { orderNumber: orderNumber } } })
            // const deliveredOrderDetails = await restaurant
            // const update = await restaurant.update({email:restaurantEmail},{$pull:{activeOrders:{orderNumber:orderNumber}}})
            const restaurantDetails: restaurantInterface = await restaurant.findOne({ email: restaurantEmail })
            const deliveredOrders = restaurantDetails.deliveredOrders;
            deliveredOrders.push({
                orderNumber: activeOrderDetails.activeOrders[0].orderNumber,
                items: activeOrderDetails.activeOrders[0].items,
                customerEmail: activeOrderDetails.activeOrders[0].customerEmail
            })
            const updateDeliveredOrders = await restaurant.updateOne({ email: restaurantEmail }, { deliveredOrders: deliveredOrders })

            const customerDetails: customerInterface = await customer.findOne({ email: activeOrderDetails.activeOrders[0].customerEmail })
            const customerDeliveredOrders = customerDetails.deliveredOrders;
            customerDeliveredOrders.push({
                orderNumber: activeOrderDetails.activeOrders[0].orderNumber,
                items: activeOrderDetails.activeOrders[0].items,
                restaurantName: restaurantDetails.name
            })
            const updateCustomerDeliveredOrders = await customer.updateOne({ email: activeOrderDetails.activeOrders[0].customerEmail }, { deliveredOrders: customerDeliveredOrders })
            if (updateDeliveredOrders && updateCustomerDeliveredOrders) {
                return MESSAGES.ORDER_DELIVERED_SUCCESS
            } else {
                return MESSAGES.ORDER_ALREADY_DELIVERED
            }
        } catch (error) {
            throw error;
        }

    }

    /**
     * 
     * @param restaurantEmail 
     * @returns Promise<restaurantDeliveredOrders[]>
     * Fetch deliveredOrders for a logged in restaurant.
     */
    async getDeliveredOrders(restaurantEmail: string): Promise<restaurantDeliveredOrders[]> {
        try {
            const deliveredOrders: restaurantDeliveredOrders[] = await restaurant.find({ email: restaurantEmail }, { deliveredOrders: 1 });
            if (deliveredOrders.length > 0) {
                return deliveredOrders;
            } else {
                return [];
            }
        } catch (error: any) {
            throw error;
        }
    }

}