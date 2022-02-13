const mongoose = require("mongoose");
const pagination = require('mongoose-paginate-v2');

const postSchema = new mongoose.Schema({
    user:{ref:'User',type:mongoose.Types.ObjectId,required:true},
    title:{type:String,required:true,max:256},
    slug:{type:String,required:true,max:256},
    viewCount:{type:Number,default:0},
    commentCount:{type:Number,default:0},
    likeCount:{type:Number,default:0},
    thumbnail:{type:String,required:true,max:128},
    body:{type:String,required:true,max:16386,min:4},
    tags:{type:String,required:true,max:512,min:2},
    status:{type:String,default:'0'},
    category:{ref:'Category',type:mongoose.Types.ObjectId,required:true},
    date:{type:Date,required:true}
});

postSchema.plugin(pagination);

const Post = mongoose.model('Post',postSchema);

module.exports = Post;