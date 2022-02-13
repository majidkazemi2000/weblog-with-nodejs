const mongoose = require('mongoose');
const pagination =require('mongoose-paginate-v2');


const commentSchema = new mongoose.Schema({
    user:{ref:'User',required:true,type:mongoose.Types.ObjectId},
    post:{ref:'Post',required:true,type:mongoose.Types.ObjectId},
    parent:{type:mongoose.Types.ObjectId,ref:'Comment',default:null},
    body:{required:true,type:String,min:1,max:512},
    approved:{type:Boolean,default:false},
    likeCount:{type:Number,default:0},
    date:{type:String,required:true,max:256,min:4}
});

commentSchema.virtual('comments' , {
    ref : 'Comment',
    localField : '_id',
    foreignField : 'parent'
});

commentSchema.plugin(pagination);

const Comment = mongoose.model('Comment',commentSchema);
module.exports = Comment;
