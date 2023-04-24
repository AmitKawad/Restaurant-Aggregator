import mongoose from 'mongoose';
import config from 'config';

const connect = async function (): Promise<void>  {
    try {
        const dbURI = 'mongodb://root:root@mongo-db:27018/restaurant-aggregator?authSource=admin'
        const connectResult = await mongoose.connect(dbURI);
        if(connectResult){
            console.log('Connected successfuly to the database')
        } else {
            console.log('Failed to connect to database');
        }
    } catch (error) {
        console.log('Exception occcured in connecting to mongoDB');
        throw error;
    }
}
export default connect;