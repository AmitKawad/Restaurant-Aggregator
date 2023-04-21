export interface createOrder{
    restaurantName:string,
    items:{itemName:string,quantity:number}[],
    customerEmail:string
}