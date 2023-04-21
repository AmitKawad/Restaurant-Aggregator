export interface customerInterface{
    name:string
    pincode:string
    address:string
    phone:string
    email:string
    password:string
    salt?:string
    activeOrders:{ orderNumber: string, items: {itemName:string,quantity:number}[],restaurantName:string}[],
    deliveredOrders:{orderNumber: string, items: {itemName:string,quantity:number}[],restaurantName:string}[]
}