import express from 'express';
import config from 'config';
const app = express();
const port = config.get('port')as number;
const adminRoute =  require('./routes/AdminRoute');
const restaurantRoute =  require('./routes/RestaurantRouts');
const customerRoute =  require('./routes/CustomerRoutes');
import connect from './db/connect'
const cors = require('cors')
require('dotenv').config();

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use('/admin',adminRoute);
app.use('/restaurant',restaurantRoute);
app.use('/customer',customerRoute);

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`)
    connect();
})