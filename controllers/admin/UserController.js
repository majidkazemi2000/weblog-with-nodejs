//models
const Comment = require('../../models/comment');
const Post = require('../../models/post');
const User = require('../../models/user');

class userController {
    async index(req,res){
        const page = req.query.page || 1;
        const status = req.query.status || '';
        const search = req.query.search || '';
        const id = req.session.user._id;

        const posts_count = await Post.count({user:id});
        const user_count = await User.count({_id:{$ne:id}});
        const comment_count = await Comment.count({});

        if (search != ''){
            if (status == 'true'){
                User.paginate({$and:[{_id:{$ne:id}},{status: true},{$or:[{name:{$regex: '.*' + search + '.*'}},{email:{$regex: '.*' + search + '.*'}}]}]},{page,select:{'password':0,'isAdmin':0,},limit:2,sort:{joint_date:'desc'}}).then(users=>{
                    res.render('admin/users',{status,search,comment_count,posts_count,user_count,users,pageTitle:'صفحه کاربران',user:req.session.user,message:req.flash('message'),layout:'./panel'});
                }).catch(error=>{
                    req.flash('message','error-خطا-خطایی در دریافت کاربران رخ داده است');
                    res.redirect('/admin');
                });
            }else if (status == 'false'){
                User.paginate({$and:[{_id:{$ne:id}},{status: false},{$or:[{name:{$regex: '.*' + search + '.*'}},{email:{$regex: '.*' + search + '.*'}}]}]},{page,select:{'password':0,'isAdmin':0,},limit:2,sort:{joint_date:'desc'}}).then(users=>{
                    res.render('admin/users',{status,search,comment_count,posts_count,user_count,users,pageTitle:'صفحه کاربران',user:req.session.user,message:req.flash('message'),layout:'./panel'});
                }).catch(error=>{
                    req.flash('message','error-خطا-خطایی در دریافت کاربران رخ داده است');
                    res.redirect('/admin');
                });
            }else{
                User.paginate({$and:[{_id:{$ne:id}},{$or:[{name:{$regex: '.*' + search + '.*'}},{email:{$regex: '.*' + search + '.*'}}]}]},{page,select:{'password':0,'isAdmin':0,},limit:2,sort:{joint_date:'desc'}}).then(users=>{
                    res.render('admin/users',{status,search,comment_count,posts_count,user_count,users,pageTitle:'صفحه کاربران',user:req.session.user,message:req.flash('message'),layout:'./panel'});
                }).catch(error=>{
                    req.flash('message','error-خطا-خطایی در دریافت کاربران رخ داده است');
                    res.redirect('/admin');
                });
            }

        }else{
            if (status == 'true'){
                User.paginate({$and:[{_id:{$ne:id}},{status:true}]},{page,select:{'password':0,'isAdmin':0,},limit:2,sort:{joint_date:'desc'}}).then(users=>{
                    res.render('admin/users',{status,search,comment_count,posts_count,user_count,users,pageTitle:'صفحه کاربران',user:req.session.user,message:req.flash('message'),layout:'./panel'});
                }).catch(error=>{
                    req.flash('message','error-خطا-خطایی در دریافت کاربران رخ داده است');
                    res.redirect('/admin');
                });
            }else if (status == 'false'){
                User.paginate({$and:[{_id:{$ne:id}},{status:false}]},{page,select:{'password':0,'isAdmin':0,},limit:2,sort:{joint_date:'desc'}}).then(users=>{
                    res.render('admin/users',{status,search,comment_count,posts_count,user_count,users,pageTitle:'صفحه کاربران',user:req.session.user,message:req.flash('message'),layout:'./panel'});
                }).catch(error=>{
                    req.flash('message','error-خطا-خطایی در دریافت کاربران رخ داده است');
                    res.redirect('/admin');
                });
            }else{
                User.paginate({_id:{$ne:id}},{page,select:{'password':0,'isAdmin':0,},limit:2,sort:{joint_date:'desc'}}).then(users=>{
                    res.render('admin/users',{status,search,comment_count,posts_count,user_count,users,pageTitle:'صفحه کاربران',user:req.session.user,message:req.flash('message'),layout:'./panel'});
                }).catch(error=>{
                    req.flash('message','error-خطا-خطایی در دریافت کاربران رخ داده است');
                    res.redirect('/admin');
                });
            }
        }
    }
    async destroy(req,res){

        const search = req.query.search || '';
        const page = req.query.page || 1;
        const status = req.query.status || '';

        const user = await User.findOne({_id:req.params.user});
        if (user){
            try {
                await user.remove();
                req.flash('message','success-تبریک-کاربر مورد نظر با موفقیت حذف شد');
                if (status == 'true'){
                    if (search != ''){
                        return res.redirect('/admin/users?status=true&search='+search);
                    }
                    return res.redirect('/admin/users?status=true');
                }else if (status == 'false'){
                    if (search != ''){
                        return res.redirect('/admin/users?status=false&search='+search);
                    }
                    return res.redirect('/admin/users?status=false');
                }else{

                    return res.redirect('/admin/users');
                }
            }catch (err) {
                if (err){
                    req.flash('message','error-هشدار-خطایی در حذف کردن رخ داده است');
                    return res.redirect('/admin/users');
                }
            }
        }else{
            req.flash('message','error-خطا-چنین کاربری وجود ندارد');
            return res.redirect('/admin/users');
        }




    }
    async show(req,res){
        const user_id = req.params.user;
        try {
            const user = await User.findOne({_id:user_id}).select({password:0,isAdmin:0,status:0});
            if (user){

                const commentCount = await Comment.find({user:user_id}).count();
                const likeCount = await Like.find({user:user_id}).count();


                return res.json({statusCode:200,message:'عملیات موفقیت آمیز بود',user,commentCount,likeCount});
            }else{
                return res.json({statusCode:404,message:'چنین کاربری وجود ندارد'});
            }
        }catch (error) {
            console.log(error.message);
            return res.json({statusCode:404,message:'خطایی در دریافت اطلاعات رخ داده است'});
        }
    }

    async changeStatus(req,res){

        const user_id = req.params.user || 1;
        const page = req.query.page || 1;
        const status = req.query.status || '';
        const search = req.query.search || '';

        const user = await User.findOne({_id:user_id});
        if (user){
            if (!user.status){
                user.status = true;
                await user.save();
                req.flash('message','success-تبریک-کاربر فعال شد');
                if (status != ''){
                    if (search != ''){
                        return res.redirect('/admin/users?page='+page+'&status='+status+'&search='+search);
                    }
                    return res.redirect('/admin/users?page='+page+'&status='+status);
                }
                if (search != ''){
                    return res.redirect('/admin/users?page='+page+'&search='+search);
                }
                return res.redirect('/admin/users?page='+page);
            } else{
                user.status = false;
                await user.save();
                req.flash('message','success-تبریک-کاربر غیر فعال شد');
                if (status != ''){
                    if (search != ''){
                        return res.redirect('/admin/users?page='+page+'&status='+status+'&search='+search);
                    }
                    return res.redirect('/admin/users?page='+page+'&status='+status);
                }
                if (search != ''){
                    return res.redirect('/admin/users?page='+page+'&search='+search);
                }
                return res.redirect('/admin/users?page='+page);
            }
        } else{
            req.flash('message','error-خطا-چنین کاربری وجود ندارد');
            if (status != ''){
                if (search != ''){
                    return res.redirect('/admin/users?page='+page+'&status='+status+'&search='+search);
                }
                return res.redirect('/admin/users?page='+page+'&status='+status);
            }
            if (search != ''){
                return res.redirect('/admin/users?page='+page+'&search='+search);
            }
            return res.redirect('/admin/users?page='+page);
        }
    }
}
module.exports = new userController();