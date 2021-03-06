require("dotenv").config()

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const HttpError = require('./models/httpError')

const homepageRoutes = require('./routes/homepage-Routes')

//adminPageRoutes
const adminPageRoutes = require('./routes/adminpage-Routes')

//customerPageRoutes
const customerPageRoutes = require('./routes/customerpage-Routes')


const app = express();

app.set('trust proxy', true);

//body parsing jsonData
app.use(bodyParser.json())
//routes

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'Origin, X-Requested-With, Content-Type, Accept, Authorization'
  );
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
  next();
});




app.use(homepageRoutes);

//adimn Routes
app.use('/api/admin/', adminPageRoutes);

//customer Routes
app.use('/api/customer/',customerPageRoutes);


app.use((req, res, next)=>{
    const error = new HttpError('could not found this Route', 404);
    throw error;
})


// error model middleware
app.use((error, req, res, next) => {

    if (res.headerSent) {
      return next(error);
    }
    res.status(error.code || 500)
    res.json({message: error.message || 'An unknown error occurred!'});
  });

  mongoose.connect(process.env.MONGO_PROD_URI,{  useNewUrlParser: true , useUnifiedTopology: true  ,'useCreateIndex' : true })
  .then(() => {
    console.log("server is live");
    app.listen(process.env.PORT || 8001, function(){
      console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
    });;
  
  })
  .catch(err => {
    console.log(err);
  });