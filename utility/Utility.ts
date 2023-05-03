import { createClient } from 'redis';
const redisClient = createClient({
    url: "redis://redis:6380"
  });

redisClient.connect().then(function() {
    console.log('socket connection established')
}).catch(function (error:Error) {
    console.error('Error in eastablishing connection',error)
})
export class Utility{
    validateOTP = async function(mobile:string,otp:number):Promise<boolean>{
        const redisValue = await redisClient.get(mobile);
        if(redisValue?.toString()!==otp.toString()){
            return false;
        }else{
            return true;
        }
    }
}