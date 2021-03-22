
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

let geoip = require('geoip-lite');


const { validationResult } = require('express-validator')
const  User = require('../models/users-schema')

const HttpError = require('../models/httpError');



//creating users
const createUser = async (req, res, next) => {
    // const errors = validationResult(req);
    // if(!errors.isEmpty()){
    //     console.log(errors);
    //     const error =  new HttpError("invalid input are passed,please pass valid data",422)
    //     return next(error)
    // }


    const { firstname, lastname, gender, email, password, profilePic, role, status,countryCode, phoneNumber, city, state, pincode, address  , location } = req.body;
   

    //console.log('IP: ' + JSON.stringify(req.ip));

    var geo = geoip.lookup(req.ip);

    const browser = req.headers["user-agent"];
    const ip = JSON.stringify(req.ip);
  
    let existingUser
    try{
         existingUser = await User.findOne({ email : email })
    }
    catch(err){
        const error = await new HttpError("something went wrong,creating a user failed",500)
        return next(error)
    }
    if(existingUser){
        const error = new HttpError("user already exists",422)
        return next(error)
    }
  
    
    let hashedPassword;
  
   try{
    hashedPassword = await bcrypt.hash(password, 12)
   } 
   catch(err){
       const error = new HttpError("cold not create user",500);
       return next(error)
   }


    const createdUser = new User({
        firstname,
        lastname,
        gender,
        email,
        password: hashedPassword,
        profilePic : req.file.path,
        role,
        status,
        countryCode,
        phoneNumber,
        city,
        state,
        pincode,
        address,
        ip,
        browser,
        location
    })

    try {
        await createdUser.save();
      } catch (err) {
        const error = new HttpError(
          'Creating user failed, please try again.',
          500
        );
        return next(error);
      }

      let token;
      try{
        token = await jwt.sign({
            userId : createdUser.id,
            email : createdUser.email,
            role: createUser.role },
            process.env.JWT_KEY,
            {expiresIn :'1h'}
            )

      }
     catch (err) {
        const error = new HttpError(
          'CreatingUser failed, please try again.',
          500
        );
        return next(error);
      }
    
     
    res.status(201).json({ userId : createdUser.id,email : createdUser.email ,role : createdUser.role, token: token})
}


//admin login 
const  adminLogin = async(req, res, next) => {
    const { email,password } = req.body;

    let existingUser
    try{
         existingUser = await User.findOne({ email : email , role : 'admin' })
    }
    catch(err){
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
    const error = await new HttpError("invalid credentials try again",500)
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
    message : 'admin logged in successful' , 
    userId : existingUser.id,
    email : existingUser.email , 
    role : existingUser.role ,
    token: token})



}

//update admin password 
const  updateAdminPassword = async(req, res, next) => {
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        console.log(errors);
        const error =  new HttpError("invalid input are passed,please pass valid data",422)
        return next(error)
    }
    const { email, oldpassword , newpassword } = req.body;

    let admin
    try{
         admin = await User.findOne({ email : email  })
    }
    catch(err){
        const error = await new HttpError("something went wrong,update password in failed",500)
        return next(error)
    }

    if(!admin){
        const error = new HttpError("admin not found could not update password",401)
        return next(error)
    }
  
   let isValidPassword = false; 
   try{
         isValidPassword = await bcrypt.compare(oldpassword, admin.password)
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
        const error = new HttpError(" old password and newpassword should not be same",401)
        return next(error)
    }


let hashedPassword;
  
try{
 hashedPassword = await bcrypt.hash(newpassword, 12)
 let foundadmin;
 foundadmin = await User.findOne({ email : email  })
  
 var updatedRecord = {
     password: hashedPassword
 }

 User.findByIdAndUpdate(foundadmin, { $set: updatedRecord },{new:true}, (err, docs) => {
     if (!err) res.json({mesage : "password updated sucessfully"})
     else console.log('Error while updating a record : ' + JSON.stringify(err, undefined, 2))
 })
} 
catch(err){
    const error = new HttpError("could not updated hash of admin ",500);
    return next(error)
}


}

//update status of customer Status
const updateCustomerStatus = async(req, res, next) => {    

    const { email , setStatus } = req.body;

   let existingUser
   try{
        existingUser = await User.findOne({ email : email })
   }
   catch(err){
       const error = await new HttpError("something went wrong, updating failed",500)
       return next(error)
   }
   if(!existingUser){
       const error = new HttpError("user not exists",422)
       return next(error)
   }

     //updating customer status 
     let user
     try {
      user = await User.updateOne(
         { email: email },
         {
           status : setStatus
         }
       );
     }
     catch(err){
         console.log("error",err)
         const error = await new HttpError("something went wrong, in failed",500)
         return next(error)
       }
       if(!user){
         const error = new HttpError("customer not found could not update profile details",401)
         return next(error)
       }

res.json({message :" status updated "})


}


//getList of customers
const getCustomersList = async (req, res, next) => {
    let users
    try{
        users = await User.find({ role : 'customer' },'-password')
    }
    catch(err){
        const error = new HttpError("can not fetch users complete request",500)
        return next(error)
    }
    res.json({ users : users.map( user => user.toObject({ getters : true}))})
    
}

//send otp to via email for verfication
const forgetPassword = async (req, res) => {
    const { email } = req.body;
    if (email) {
      try {
        const user = await User.findOne({
          email,
        });
        if (!user) {
          return res.send({ code: 404, msg: 'User not found' });
        }
        const otp = generateOTP();
        const html = forgetHTML(user.name, otp);
  
        await User.updateOne({ _id: user._id }, { otpHex: otp });
        await sendEmail(user.email, html);
        return res.send({
          code: 200,
          email: user.email,
          msg: 'OTP send to Your Email.',
        });
      } catch (err) {
        
        console.log(err);
        return res.send({ code: 500, msg: 'Internal server error' });
      }
    }
    return res.send({
      code: 400,
      msg: 'Email is required',
    });
  };



exports.createUser = createUser;
exports.adminLogin = adminLogin;
exports.updateAdminPassword = updateAdminPassword;
exports.updateCustomerStatus = updateCustomerStatus;
exports.getCustomersList = getCustomersList;