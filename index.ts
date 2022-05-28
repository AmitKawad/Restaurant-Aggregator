import express from 'express';
import config from 'config';
const app = express();
const port = config.get('port')as number;

app.listen(port,()=>{
    console.log(`Server is running on port ${port}`)
})