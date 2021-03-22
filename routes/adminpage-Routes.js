const express = require('express');
const { check } = require('express-validator')

const router = express.Router();

const adminController = require('../controllers/admin-controller')

const fileUpload = require('../middleware/file-upload');


router.get('/', (req, res, next) => {
   res.jsonp({ message : "in admin routes"})
});



//for creating a new user
router.post('/createUser', fileUpload.single('profilePic'),
adminController.createUser);

//for creating a new user
router.post('/login',
adminController.adminLogin);

//for change Password
router.post('/changePassword',
adminController.updateAdminPassword);

//for change Customer Status
router.post('/updateCustomerStatus',
adminController.updateCustomerStatus);

//list of al customers
router.get('/getCustomersList', adminController.getCustomersList);


module.exports = router;