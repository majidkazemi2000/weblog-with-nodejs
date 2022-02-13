const mongoose = require('mongoose');
const pagination = require('mongoose-paginate-v2');

const categorySchema = new mongoose.Schema({
    user:{ref:'User',required:true,type:mongoose.Types.ObjectId},
    title:{type:String,required:true,min:3,max:128},
    slug:{type:String,required:true,min:3,max:128}
});
categorySchema.plugin(pagination);

const Category = mongoose.model('Category',categorySchema);

module.exports = Category;