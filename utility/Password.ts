import bcrypt from 'bcrypt';
import { authDTO } from '../dto/AuthDTO';
import jsonWebToken from 'jsonwebtoken'; 
import {appConstants} from './constants';
import {Request} from 'express';
require('dotenv').config();


export class Password {
    generateSalt = async function() : Promise<string>{
        return await bcrypt.genSalt();
    }

    createEncryptedPassword = async function (this:Password, password:string, salt:string):Promise<string>{
        return await bcrypt.hash(password,salt);
    }
    validatePassword = async function(this:Password, enteredPassword:string, existingPassword:string,salt:string){
        const generatePassword:string = await this.createEncryptedPassword(enteredPassword,salt);
        if(generatePassword === existingPassword){
            return generatePassword;
        } else {
            throw new Error (`The entered password is incorrect`);
        }
    }
    generateToken = async function(payload:authDTO){
        jsonWebToken.sign(payload, appConstants.APP_SECRET, { expiresIn: '1d'})
    };

    sign = async function(user:any,secretToken:string ) :Promise<string>{
        return jsonWebToken.sign(user,secretToken,{expiresIn:'1hr'})
    }

    authenticateToken =  function(request: any, response: any, NextFunction){
        const authHeader = request.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if (token == null){
            response.sendStatus(401)
        }
        const accesKey:any = process.env.ACCESSKEY;
        jsonWebToken.verify(token,accesKey,(error,user)=>{
            if(error){
                return response.sendStatus(403);

            }
            request.user = user;
            NextFunction();

        })
       
        
    
    }
    authorizeRole =  function(request: any, response: any, role:string[]){
        if(!role.includes(request.user.role) ){
            response.sendStatus(401);
        }
    }
    
}
