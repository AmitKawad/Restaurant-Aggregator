import { food } from './food';
export interface restaurantInterface {
    name:string,
    ownerName: string,
    foodType:[string],
    pincode: string,
    address:string,
    phone:string,
    email:string,
    password:string,
    salt:string,
    role:string,
    food:{ foodType: string, dishes: string[]}[]
    activeOrders:[string],
    deliveredOrders:[string]


}
export interface restaurantUpdateInterface {
    name:string,
    ownerName: string,
    foodType:[string],
    pincode: string,
    address:string,
    phone:string,
}

export interface restaurantPayload {

    _id: string;
    email: string;
    name: string;

}