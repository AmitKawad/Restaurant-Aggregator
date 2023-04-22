import { food } from './food';
export interface restaurantInterface {
    name: string,
    ownerName: string,
    foodType: [string],
    pincode: string,
    address: string,
    phone: string,
    email: string,
    password: string,
    salt: string,
    role: string,
    food: { foodType: string, dishes: string[] }[]
    activeOrders: { orderNumber: string, items: { itemName: string, quantity: number }[], customerEmail: string }[],
    deliveredOrders: { orderNumber: string, items: { itemName: string, quantity: number }[], customerEmail: string }[]


}
export interface restaurantUpdateInterface {
    name: string,
    ownerName: string,
    foodType: [string],
    pincode: string,
    address: string,
    phone: string,
}

export interface restaurantPayload {

    _id: string;
    email: string;
    name: string;

}
export interface restaurantActiveOrders {
    orderNumber: string,
    items: {
        itemName: string,
        quantity: number
    }[],
    customerEmail: string
}[]
export interface restaurantDeliveredOrders {
    orderNumber: string,
    items: {
        itemName: string,
        quantity: number
    }[],
    customerEmail: string
}[]
