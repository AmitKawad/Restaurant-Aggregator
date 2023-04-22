const appConstants  = {
    "APP_SECRET": '232refedc'

}
const ROLES = {
    ADMIN: 'Admin',
    RESTAURANT: 'Restaurant',
    CUSTOMER:'Customer'

}
const MESSAGES = {
    ADMIN_NOT_EXIST : `Admin with the provided name does not exist`,
    CUSTOMER_NOT_EXIST:`Customer with the provided email does not exist`,
    RESTAURANT_NOT_EXIST:`Restaurant with the provided email does not exist`,
    OTP_REQUIRED:`OTP is required to Signup for Restaurant. Please request for OTP before Signup to Verify your phone.\ If you are an admin please login to continue`,
    OTP_INVALID:`OTP entered is invalid. Please try again!!`,
    INVALID_RESTAURANT_LOGIN:`The email entered does not match with the email of logged in Restaurant`,
    OTP_VALIDATION_SUCCESS:`OTP successfully validated`,
    RESTAURANT_DETAILS_UPDATE_SUCCESS:`Restaurant details have been updated successfully`,
    RESTAURANT_DETAILS_UPDATE_FAILURE:`Details could not be saved`,
    RESTAURANT_DELETED_SUCCESS:`Restaurant deleted successfully`,
    RESTAURANT_ALREADY_DELETED:`Restaurant already deleted`,
    RESTAUARANT_MENU_UPDATE_SUCCESS:`The menu has been updated successfully`,
    RESTAUARANT_MENU_UPDATE_FAILED:`The menu could not be updated please try again`,
    RESTAUTANT_ALREADY_EXIST:`Restaurant already exists`,
    RESTAURANT_ADDED_SUCCESS:`Restaurant added successful`,
    ITEMS_NOT_AVAILABLE:`Some items are not available. Please remove the unavailable items and try again`,
    ORDER_PLACED_SUCCESSFULY:`The Order has been placed Successfully`,
    ORDER_PLACED_FAILED:`The order could not be placed please try again`,
    CUSTOMER_ALREADY_EXISTS:`Customer already exists`,
    CUSTOMER_DATA_INSERTED_SUCCESS:`Data inserted successfully`,
    CUSTOMER_DELETED_SUCCESS:`Customer deleted successfully`,
    CUSTOMER_ALREADY_DELETED:`Customer already deleted`

}
export {appConstants,ROLES, MESSAGES};