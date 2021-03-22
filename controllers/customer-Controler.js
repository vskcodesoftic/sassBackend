
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const nodemailer = require('nodemailer')


const { validationResult } = require('express-validator')
const  User = require('../models/users-schema')

const HttpError = require('../models/httpError');

const {  sendEmail  ,sendEmailOtpLink, sendEmailOtpLinktoCustomer } = require('../services/mail-service');



//customer login 
const  customerLogin = async(req, res, next) => {
    const { email, password } = req.body;

    let existingUser
    try{
         existingUser = await User.findOne({ email : email , role : 'customer' })
    }
    catch(err){
        console.log(err)
        const error = await new HttpError("something went wrong,logging in failed",500)
        return next(error)
    }

    if(!existingUser){
        const error = new HttpError("invalid credentials could not log in",401)
        return next(error)
    }
  
   let isValidPassword = false; 
   try{
         isValidPassword = await bcrypt.compare(password, existingUser.password)
   }
   catch(err){
    const error = await new HttpError("could not log in, try again",500)
    return next(error)
}

if(!isValidPassword){
    const error = new HttpError("invalid credentials could not log in",401)
    return next(error)
}

let token;
try{
  token = await jwt.sign({
      userId : existingUser.id,
      email : existingUser.email ,
      role : existingUser.role },
      process.env.JWT_KEY,
      {expiresIn :'1h'}
      )

}
catch (err) {
  const error = new HttpError(
    'LogIn failed, please try again.',
    500
  );
  return next(error);
} 

res.json({ 
    message : 'customer logged in successful' , 
    userId : existingUser.id,
    email : existingUser.email , 
    role : existingUser.role ,
    token: token})



}


//update customer password 
const  updateCustomerPassword = async(req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors);
        const error =  new HttpError("invalid input are passed,please pass valid data",422)
        return next(error)
    }
    const { email, oldpassword , newpassword } = req.body;

    let user
    try{
         user = await User.findOne({ email : email  })
    }
    catch(err){
        const error = await new HttpError("something went wrong,update password in failed",500)
        return next(error)
    }

    if(!user){
        const error = new HttpError("user not found could not update password",401)
        return next(error)
    }
  
   let isValidPassword = false; 
   try{
         isValidPassword = await bcrypt.compare(oldpassword, user.password)
   }
   catch(err){
    const error = await new HttpError("invalid password try again",500)
    return next(error)
}
 
 
if(!isValidPassword){
    const error = new HttpError("invalid old password could not update newpassword",401)
    return next(error)
}

// checking if old and new password are same /not if same return error
    if(isValidPassword && oldpassword == newpassword){
        const error = new HttpError(" old password and new password should not be same",401)
        return next(error)
    }


let hashedPassword;
  
try{
 hashedPassword = await bcrypt.hash(newpassword, 12)
 let founduser;
 founduser = await User.findOne({ email : email  })
  
 var updatedRecord = {
     password: hashedPassword
 }

 User.findByIdAndUpdate(founduser, { $set: updatedRecord },{new:true}, (err, docs) => {
     if (!err) res.json({mesage : "password updated sucessfully"})
     else console.log('Error while updating a record : ' + JSON.stringify(err, undefined, 2))
 })
} 
catch(err){
    const error = new HttpError("could not updated hash of user ",500);
    return next(error)
}


}



exports.customerLogin = customerLogin;
exports.updateCustomerPassword = updateCustomerPassword;