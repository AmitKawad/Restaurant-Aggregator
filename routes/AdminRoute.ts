import express,{request,response,NextFunction, Router} from 'express';
const router = express.Router();

router.get('/',(request,response)=>{
    response.json({message: `Hello from admin route`});

})

module.exports = router