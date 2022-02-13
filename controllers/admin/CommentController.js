//packages
const moment = require('jalali-moment');

//models
const Comment = require('../../models/comment');
const Post = require('../../models/post');
const User = require('../../models/user');

class commentController {
    async index(req,res){
        const id = req.session.user._id;
        const posts_count = await Post.count({user:id});
        const user_count = await User.count({_id:{$ne:id}});
        const comment_count = await Comment.count({});

        const date = req.query.date || '';
        const page = req.query.page || 1;
        const search = req.query.search || '';
        const post_id = req.query.post || '';

        if (post_id != ''){
            if (date != ''){
                const t = commentController.convert(date.toString());
                if (req.query.approved != undefined){
                    const approved = req.query.approved;
                    if (approved == 'true'){
                        const comments = await Comment.paginate({$and:[{post:post_id},{date:{$regex: '.*' + t + '.*'}},{approved:true}]},{page,select:{parentId:0,date:0},limit:2,sort:{date:'desc'},populate:[({ path:'user',select:{'name':1}}),({path:'post',select:{'slug':1}})]});
                        return res.render('./admin/comments',{post_id,date,search,approved,comment_count,posts_count,user_count,comments,pageTitle:'صفحه نظرات',user:req.session.user,message:req.flash('message'),layout:'./panel'});
                    }else if(approved == 'false'){
                        const comments = await Comment.paginate({$and:[{post:post_id},{date:{$regex: '.*' + t + '.*'}},{approved:false}]},{page,select:{parentId:0,date:0},limit:2,sort:{date:'desc'},populate:[({ path:'user',select:{'name':1}}),({path:'post',select:{'slug':1}})]});
                        return res.render('./admin/comments',{post_id,date,search,approved,comment_count,posts_count,user_count,comments,pageTitle:'صفحه نظرات',user:req.session.user,message:req.flash('message'),layout:'./panel'});
                    }else{
                        res.redirect('/admin/comments');
                    }
                }else{
                    const comments = await Comment.paginate({$and:[{post:post_id},{date:{$regex: '.*' + t + '.*'}}]},{page,select:{parentId:0,date:0},limit:2,sort:{date:'desc'},populate:[({ path:'user',select:{'name':1}}),({path:'post',select:{'slug':1}})]});
                    return res.render('./admin/comments',{post_id,date,approved:'',search,comment_count,posts_count,user_count,comments,pageTitle:'صفحه نظرات',user:req.session.user,message:req.flash('message'),layout:'./panel'});
                }
            }else{
                if (req.query.approved != undefined){
                    const approved = req.query.approved;
                    if (approved == 'true'){
                        const comments = await Comment.paginate({$and:[{approved:true},{post:post_id}]},{page,select:{parentId:0,date:0},limit:2,sort:{date:'desc'},populate:[({ path:'user',select:{'name':1}}),({path:'post',select:{'slug':1}})]});
                        return res.render('./admin/comments',{post_id,date,search,approved,comment_count,posts_count,user_count,comments,pageTitle:'صفحه نظرات',user:req.session.user,message:req.flash('message'),layout:'./panel'});
                    }else if(approved == 'false'){
                        const comments = await Comment.paginate({$and:[{approved:false},{post:post_id}]},{page,select:{parentId:0,date:0},limit:2,sort:{date:'desc'},populate:[({ path:'user',select:{'name':1}}),({path:'post',select:{'slug':1}})]});
                        return res.render('./admin/comments',{post_id,date,search,approved,comment_count,posts_count,user_count,comments,pageTitle:'صفحه نظرات',user:req.session.user,message:req.flash('message'),layout:'./panel'});
                    }else{
                        res.redirect('/admin/comments');
                    }
                }else{
                    const comments = await Comment.paginate({post:post_id},{page,select:{parentId:0,date:0},limit:2,sort:{date:'desc'},populate:[({ path:'user',select:{'name':1}}),({path:'post',select:{'slug':1}})]});
                    return res.render('./admin/comments',{post_id,date,approved:'',search,comment_count,posts_count,user_count,comments,pageTitle:'صفحه نظرات',user:req.session.user,message:req.flash('message'),layout:'./panel'});
                }
            }
        }else{
            if (date != ''){
                const t = commentController.convert(date.toString());
                if (req.query.approved != undefined){
                    const approved = req.query.approved;
                    if (approved == 'true'){
                        const comments = await Comment.paginate({$and:[{date:{$regex: '.*' + t + '.*'}},{approved:true}]},{page,select:{parentId:0,date:0},limit:2,sort:{date:'desc'},populate:[({ path:'user',select:{'name':1}}),({path:'post',select:{'slug':1}})]});
                        return res.render('./admin/comments',{post_id,date,search,approved,comment_count,posts_count,user_count,comments,pageTitle:'صفحه نظرات',user:req.session.user,message:req.flash('message'),layout:'./panel'});
                    }else if(approved == 'false'){
                        const comments = await Comment.paginate({$and:[{date:{$regex: '.*' + t + '.*'}},{approved:false}]},{page,select:{parentId:0,date:0},limit:2,sort:{date:'desc'},populate:[({ path:'user',select:{'name':1}}),({path:'post',select:{'slug':1}})]});
                        return res.render('./admin/comments',{post_id,date,search,approved,comment_count,posts_count,user_count,comments,pageTitle:'صفحه نظرات',user:req.session.user,message:req.flash('message'),layout:'./panel'});
                    }else{
                        res.redirect('/admin/comments');
                    }
                }else{
                    const comments = await Comment.paginate({date:{$regex: '.*' + t + '.*'}},{page,select:{parentId:0,date:0},limit:2,sort:{date:'desc'},populate:[({ path:'user',select:{'name':1}}),({path:'post',select:{'slug':1}})]});
                    return res.render('./admin/comments',{post_id,date,approved:'',search,comment_count,posts_count,user_count,comments,pageTitle:'صفحه نظرات',user:req.session.user,message:req.flash('message'),layout:'./panel'});
                }
            }else{
                if (req.query.approved != undefined){
                    const approved = req.query.approved;
                    if (approved == 'true'){
                        const comments = await Comment.paginate({approved:true},{page,select:{parentId:0,date:0},limit:2,sort:{date:'desc'},populate:[({ path:'user',select:{'name':1}}),({path:'post',select:{'slug':1}})]});
                        return res.render('./admin/comments',{post_id,date,search,approved,comment_count,posts_count,user_count,comments,pageTitle:'صفحه نظرات',user:req.session.user,message:req.flash('message'),layout:'./panel'});
                    }else if(approved == 'false'){
                        const comments = await Comment.paginate({approved:false},{page,select:{parentId:0,date:0},limit:2,sort:{date:'desc'},populate:[({ path:'user',select:{'name':1}}),({path:'post',select:{'slug':1}})]});
                        return res.render('./admin/comments',{post_id,date,search,approved,comment_count,posts_count,user_count,comments,pageTitle:'صفحه نظرات',user:req.session.user,message:req.flash('message'),layout:'./panel'});
                    }else{
                        res.redirect('/admin/comments');
                    }
                }else{
                    const comments = await Comment.paginate({},{page,select:{parentId:0,date:0},limit:2,sort:{date:'desc'},populate:[({ path:'user',select:{'name':1}}),({path:'post',select:{'slug':1}})]});
                    return res.render('./admin/comments',{post_id,date,approved:'',search,comment_count,posts_count,user_count,comments,pageTitle:'صفحه نظرات',user:req.session.user,message:req.flash('message'),layout:'./panel'});
                }
            }
        }
    }

    async changeStatus(req,res){
        const comment_id = req.params.comment;
        const page = req.query.page || 1;
        const approved = req.query.approved || '';
        const post_id = req.query.post || '';

        const comment = await Comment.findOne({_id:comment_id});
        if (comment){
            if (comment.parentId != undefined){
                const parent = await Comment.findOne({_id:comment.parentId});
                if (parent){
                    if (parent.approved){

                        // change number of comments for post
                        const post = await Post.findOne({_id:comment.post});
                        if (comment.approved){
                            //decease
                            if (post.commentCount > 0){
                                post.commentCount -= 1;
                            }
                        }else{
                            //increase
                            post.commentCount += 1;
                        }
                        await post.save();

                        comment.approved = !comment.approved;
                        await comment.save();
                        if (post_id != ''){
                            if (approved == 'true'){
                                return res.redirect('/admin/comments?page='+page+'&approved=true&post='+post_id);
                            }else if (approved == 'false'){
                                return res.redirect('/admin/comments?page='+page+'&approved=false&post='+post_id);
                            }else{
                                return res.redirect('/admin/comments?page='+page+'&post='+post_id);
                            }
                        }else{
                            if (approved == 'true'){
                                return res.redirect('/admin/comments?page='+page+'&approved=true');
                            }else if (approved == 'false'){
                                return res.redirect('/admin/comments?page='+page+'&approved=false');
                            }else{
                                return res.redirect('/admin/comments?page='+page);
                            }
                        }
                    }else{
                        req.flash('message','error-خطا-ابتدا نظری که به آن پاسخ داده است را تایید کنید');
                        return res.redirect('/admin/comments?page='+page);
                    }
                }else{
                    req.flash('message','error-خطا-نظری که به آن پاسخ داده است موجود نمی باشد');
                    return res.redirect('/admin/comments?page='+page);
                }
            }

            // change number of comments for post
            const post = await Post.findOne({_id:comment.post});
            if (comment.approved){
                //decease
                if (post.commentCount > 0){
                    post.commentCount -= 1;
                }
            }else{
                //increase
                post.commentCount += 1;
            }
            await post.save();

            comment.approved = !comment.approved;
            await comment.save();

            if (post_id != ''){
                if (approved == 'true'){
                    return res.redirect('/admin/comments?page='+page+'&approved=true&post='+post_id);
                }else if (approved == 'false'){
                    return res.redirect('/admin/comments?page='+page+'&approved=false&post='+post_id);
                }else{
                    return res.redirect('/admin/comments?page='+page+'&post='+post_id);
                }
            }else{
                if (approved == 'true'){
                    return res.redirect('/admin/comments?page='+page+'&approved=true');
                }else if (approved == 'false'){
                    return res.redirect('/admin/comments?page='+page+'&approved=false');
                }else{
                    return res.redirect('/admin/comments?page='+page);
                }
            }
        }else{
            req.flash('message','error-خطا-چنین نظری وجود ندارد');
            return res.redirect('/admin/comments');
        }

    }

    async destroy(req,res){
        const comment_id = req.params.comment;

        const comment = await Comment.findOne({_id:comment_id});
        if (comment){
            commentController.delete(comment);
            req.flash('message','success-تبریک-نظر شما با موفقیت حذف شد');
            res.redirect('/admin/comments');

        }else{
            req.flash('message','error-هشدار-چنین نظری وجود ندارد');
            return res.redirect('/admin/comments');
        }
    }
    static async delete(comment){
        const subComments = await Comment.find({parentId:comment._id});

        if (subComments.length > 0){
            subComments.forEach(c=>{
                commentController.delete(c)
            });
        }
        await comment.remove();
    }

    static convert(date){
        var str = date.replaceAll("۰","0").replaceAll("۱","1").replaceAll("۲","2").replaceAll("۳","3").replaceAll("۴","4")
            .replaceAll("۵","5").replaceAll("۶","6").replaceAll("۷","7").replaceAll("۸","8").replaceAll("۹","9");
        return str;
    }
}

module.exports = new commentController();