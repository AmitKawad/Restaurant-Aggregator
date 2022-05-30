import express from 'express';
import config from 'config';
const app = express();
const port = config.get('port')as number;
import * as admin from './routes/AdminRoute';
const adminRoute =  require('./routes/AdminRoute');
const vendorRoute =  require('./routes/VendorRoute');
import connect from './db/connect'
require('dotenv').config();


import * as vendor from './routes/VendorRoute';
app.use(express.json());
app.use(express.urlencoded({extended:true}))
app.use('/admin',adminRoute);
app.use('/vendor',vendorRoute);

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`)
    connect();
})