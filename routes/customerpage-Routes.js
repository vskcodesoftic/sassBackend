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



module.exports = router;