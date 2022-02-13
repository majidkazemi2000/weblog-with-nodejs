const mongoose = require('mongoose');
const settingSchema = new mongoose.Schema({
    title:{type:String,required:true,max:256,min:2},
    description:{type:String,required:true,max:256,min:2},
    commentSystem:{type:Boolean,required:true},
    tags:{type:String,required:true,min:2,max:512},
    image:{type:String,required:true,min:2,max:256}
});

const setting = mongoose.model('Setting',settingSchema);
module.exports = setting;