import { food } from './food';
export interface vendorInterface {
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
    food:food


}

export interface VendorPayload {

    _id: string;
    email: string;
    name: string;

}