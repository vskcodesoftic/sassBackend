const express = require('express');
const { check } = require('express-validator')

const customerController = require('../controllers/customer-Controler')

const router = express.Router();

router.get('/', (req, res, next) => {
 
  res.json({message: 'customer routes'});
});

//for creating a new customer
router.post('/login',
[ 
  check('email').isEmail(),
  check('password').not().isEmpty(),
],customerController.customerLogin);

// change password based on the previous password
router.post('/changePassword', customerController.updateCustomerPassword)

//sending password reset link for the registerd user on db
router.post('/forgetPassword', customerController.forgetCustomerPassword)

// password resting after user clicks the link on the email
router.post('/resetPasswordLink/:token', customerController.newPasswordReset);


module.exports = router;