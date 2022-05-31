import bcrypt from 'bcrypt';
import { authDTO } from '../dto/AuthDTO';
import jsonWebToken from 'jsonwebtoken'; 
import {appConstants} from './constants';
import {Request} from 'express';


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
}
