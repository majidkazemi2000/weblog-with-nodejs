//models
const User = require('../../models/user');
const Post = require('../../models/post');
const Comment = require('../../models/comment');
const Category = require('../../models/category');

//packages
const Joi = require('joi');
const fs = require('fs');
const path = require('path');

const {slug} = require('../../utils/slug');


class categoryController {
    async index(req,res){

        const search = req.query.search || '';
        const page = req.query.page || 1;
        const id = req.session.user._id;

        const posts_count = await Post.count({user:id});
        const user_count = await User.count({_id:{$ne:id}});
        const comment_count = await Comment.count({});


        if (search == ''){
            Category.paginate({user:id},{page,select:{'user':0},limit:2}).then(categories=>{
                res.render('admin/categories',{search,comment_count,posts_count,user_count,categories,pageTitle:'صفحه دسته بندی ها',user:req.session.user,message:req.flash('message'),layout:'./panel'});
            }).catch(error=>{
                req.flash('message','error-خطا-خطایی در دریافت داده ها رخ داده است');
                res.redirect('/admin');
            });
        }else{
            Category.paginate({$or:[{title:{$regex: '.*' + search + '.*'}}]},{page,select:{'user':0},limit:2}).then(categories=>{
                res.render('admin/categories',{search,comment_count,posts_count,user_count,categories,pageTitle:'صفحه دسته بندی ها',user:req.session.user,message:req.flash('message'),layout:'./panel'});
            }).catch(error=>{
                req.flash('message','error-خطا-خطایی در دریافت داده ها رخ داده است');
                res.redirect('/admin');
            });
        }
    }
    create(req,res){
        res.render('admin/createCategory',{pageTitle:'ساخت دسته بندی جدید',user:req.session.user,layout:'./panel',message:req.flash('message'),title_error:req.flash('title')});
    }
    async store(req,res){

        const schema = Joi.object({
            title:Joi.string().required().min(2).max(256).messages({
                "string.min":"عنوان دسته بندی حداقل باید 2 کاراکتر باشد",
                "string.max":"عنوان دسته بندی می تواند حداکثر 256 کاراکتر باشد",
                "string.empty":"وارد کردن عنوان دسته بندی الزامی می باشد"
            })
        });

        try {
            await schema.validateAsync({title:req.body.title},{abortEarly:false});
        }catch (error) {
            for (const x of error.details){
                req.flash([x.context.key],x.message);
            }
            return res.redirect('/admin/categories/create');
        }

        const {title} = req.body;
        var s = slug(title);

        const user = req.session.user._id;

        const category = await Category.create({
            title,slug:s,user
        });

        req.flash('message','success-تبریک-دسته بندی جدید با موفقیت اضافه شد');
        return res.redirect('/admin/categories');

    }
    async edit(req,res){
        const category_id = req.params.category || 1;
        const category = await Category.findOne({_id:category_id,user:req.session.user._id}).select({'user':0,'slug':0});
        if (category){
            res.render('admin/editCategory',{category,pageTitle:'ویرایش دسته بندی',user:req.session.user,layout:'./panel',message:req.flash('message'),title_error:req.flash('title')});
        } else{
            req.flash('message','error-خطا-چنین دسته بندی وجود ندارد');
            return res.redirect('/admin/categories');
        }
    }
    async update(req,res){

        const category_id = req.params.category;
        const c = await Category.findOne({_id:category_id,user:req.session.user._id});

        if (c){
            const schema = Joi.object({
                title:Joi.string().required().min(2).max(256).messages({
                    "string.min":"عنوان دسته بندی حداقل باید 2 کاراکتر باشد",
                    "string.max":"عنوان دسته بندی می تواند حداکثر 256 کاراکتر باشد",
                    "string.empty":"وارد کردن عنوان دسته بندی الزامی می باشد"
                })
            });

            try {
                await schema.validateAsync({title:req.body.title},{abortEarly:false});
            }catch (error) {
                for (const x of error.details){
                    req.flash([x.context.key],x.message);
                }
                return res.redirect('/admin/categories/'+category_id+'/edit');
            }

            const {title} = req.body;
            var s = slug(title);

            const user = req.session.user._id;

            c.title = title;
            c.slug = s;

            c.save(err=>{
                if (err){
                    req.flash('message','error-هشدار-خطایی در ویرایش کردن رخ داده است');
                    return res.redirect('/admin/categories/'+category_id+'/edit');
                }
                req.flash('message','success-تبریک-دسته بندی شما با موفقیت ویرایش شد');
                res.redirect('/admin/categories');

            });

        } else{
            req.flash('message','error-خطا-چنین دسته بندی وجود ندارد');
            return res.redirect('/admin/categories');
        }
    }
    async destroy(req,res){
        const category_id = req.params.category || 1;
        const category = await Category.findOne({_id:category_id,user:req.session.user._id});
        if (category){

            //remove all posts that relate with this category

            category.remove({_id: category_id}, async function(err){
                if(err){
                    req.flash('message','error-خطا-خطایی در حذف کردن دسته بندی رخ داده است');
                    return res.redirect('/admin/categories');
                }

                // remove all posts that related with this category
                Post.find({category:category_id},function (err,post) {
                    post.forEach(async (p)=>{

                        //remove all images in post body
                        const urls = [];
                        const rex = /src\s*=\s*"(.+?)"/g;
                        const str = p.body;
                        var m;
                        while ( m = rex.exec( str ) ) {
                            urls.push( m[1] );
                        }
                        urls.forEach(url=>{
                            fs.unlinkSync(path.join(__dirname,'..','..','public',url.slice(1,url.length)));
                        });


                        await Comment.remove({post:p._id});
                        fs.unlinkSync(p.thumbnail);
                        p.remove();
                    });
                });



                req.flash('message','success-تبریک-دسته بندی مورد نظر با موفقیت حذف شد');
                res.redirect('/admin/categories');

            });

        } else{
            req.flash('message','error-خطا-چنین دسته بندی وجود ندارد');
            return res.redirect('/admin/categories');
        }
    }
}

module.exports = new categoryController();