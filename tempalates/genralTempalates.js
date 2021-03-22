
 const signupHTML = (name, otp) => `
 <h2>Hi, ${name} </h2>
 <h3>Your verification OTP is ${otp}</h3>
 `;
  const forgetHTML = (name, otp) => `
 <h2>Hi, ${name} </h2>
 <h3>Your verification OTP is ${otp} to change your password</h3>
 `;
 const addAdminMail = (name, otp, password) => `
 <h2>Hi, ${name} </h2>
 <h3>Your verification OTP is ${otp}</h3>
 <h3>& Your Password is ${password}, Please reset your password after logging in</h3>
 `;
 
 exports.signupHTML = signupHTML ;
 exports.forgetHTML = forgetHTML ;
 exports.addAdminMail = addAdminMail ;