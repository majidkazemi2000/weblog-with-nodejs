const User = require('../models/user');

module.exports = async(req,res,next)=>{
    if (req.session.user != undefined && req.session.isAdmin != undefined && req.session.isAdmin){
        next();
    } else{
        res.render('errors/404',{pageTitle:'404'});
    }
}