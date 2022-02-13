const mongoose = require('mongoose');
const pagination = require('mongoose-paginate-v2');

const bcrypt = require('bcrypt');
const saltRounds = 10;

const userSchema = new mongoose.Schema({
    name:{type:String,required:true,min:2,max:128},
    email:{type:String,unique:true,required:true,min:4,max:256},
    password:{type:String,required:true,min:4,max:128},
    device:{type:String,required:true,max:256},
    status:{type:Boolean,default:true},
    isAdmin:{type:Boolean,default:false},
    joint_date:{type:String,required:true}
});
userSchema.pre("save",function (next) {
   var user = this;
   if(!user.isModified('password')) return next();

   bcrypt.genSalt(saltRounds,function (err,salt) {
      if (err) return next(err);
      bcrypt.hash(user.password,salt,(err,hash)=>{
          if (err) return next(err);
          user.password = hash;
          next();
      });
   });

});

userSchema.methods.comparePassword = function(pass,cb){
    bcrypt.compare(pass,this.password,function (err,isMatched) {
       if (err) cb(false);
       if (isMatched){
           cb(true);
       } else{
           cb(false);
       }
    });
}

userSchema.plugin(pagination);
const User = mongoose.model('User',userSchema);

module.exports = User;