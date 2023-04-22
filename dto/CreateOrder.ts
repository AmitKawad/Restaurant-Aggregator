export interface createOrderInterface{
    restaurantName:string,
    items:{itemName:string,quantity:number}[],
    customerEmail:string
}