const express = require("express");
const app = express();
const path = require('path');
const express_session = require('express-session');
const cookie_parser = require('cookie-parser');
const flash = require('connect-flash');
const postRoutes = require('./routes/routes');
const adminRoutes = require('./routes/admin');
require('dotenv').config();
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');


//config for method-override
app.use(methodOverride('_method'));

//configs for body-parser in express
app.use(express.json());
app.use(express.urlencoded({extended:false}));


//config for select public directory as static public
app.use(express.static(path.join(__dirname,'public')));



//config for express-session
app.use(express_session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}));


//config for flash messaging
app.use(flash());

//select ejs as view engine
app.use(expressLayouts);
app.set('layout', './main');
app.set('view engine', 'ejs');

//config for mongoose
require('./configs/mongoose');



//adding routes to project
app.use(postRoutes);
app.use('/admin',adminRoutes);
app.use((req,res)=>{
   res.render('errors/404',{pageTitle:'404'});
});

app.listen(process.env.PORT,()=>{
   console.log(`app running on port ${process.env.PORT}`);
});