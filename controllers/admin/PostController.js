//models
const User = require('../../models/user');
const Post = require('../../models/post');
const Comment = require('../../models/comment');
const Category = require('../../models/category');

//packages
const fs = require('fs');
const path = require('path');
const Joi = require('joi');
Joi.objectId = require('joi-objectid')(Joi);

const {slug} = require('../../utils/slug');

class postController {
    async index(req,res){

        const search = req.query.search || '';
        const category = req.query.category || '';
        const page = req.query.page || 1;
        const id = req.session.user._id;

        const posts_count = await Post.count({user:id});
        const user_count = await User.count({_id:{$ne:id}});
        const comment_count = await Comment.count({});


        if (search == ''){
            if (category == ''){
                Post.paginate({user:id},{page,select:{'user':0,'viewCount':0,'commentCount':0,'likeCount':0,'thumbnail':0,'body':0,'tags':0,'category':0,'date':0},limit:2,sort:{date:'desc'}}).then(posts=>{
                    res.render('admin/posts',{category,search,comment_count,posts_count,user_count,posts,pageTitle:'صفحه پست ها',user:req.session.user,message:req.flash('message'),layout:'./panel'});
                }).catch(error=>{
                    req.flash('message','error-خطا-خطایی در دریافت داده ها رخ داده است');
                    res.redirect('/admin');
                });
            }else{
                Post.paginate({user:id,category:category},{page,select:{'user':0,'viewCount':0,'commentCount':0,'likeCount':0,'thumbnail':0,'body':0,'tags':0,'category':0,'date':0},limit:2,sort:{date:'desc'}}).then(posts=>{
                    res.render('admin/posts',{category,search,comment_count,posts_count,user_count,posts,pageTitle:'صفحه پست ها',user:req.session.user,message:req.flash('message'),layout:'./panel'});
                }).catch(error=>{
                    req.flash('message','error-خطا-خطایی در دریافت داده ها رخ داده است');
                    res.redirect('/admin');
                });
            }
        }else{
            if (category == ''){
                Post.paginate({$or:[{title:{$regex: '.*' + search + '.*'}},{body:{$regex: '.*' + search + '.*'}},{tags:{$regex: '.*' + search + '.*'}}]},{page,select:{'user':0,'viewCount':0,'commentCount':0,'likeCount':0,'thumbnail':0,'body':0,'tags':0,'category':0,'date':0},limit:2,sort:{date:'desc'}}/*,{select:{'_id':0}}*//*,{populate:({ path:'user',select:{'_id':0,'password':0,'device':0,'isAdmin':0,'joint_date':0,'status':0}})}*/).then(posts=>{
                    res.render('admin/posts',{category,search,comment_count,posts_count,user_count,posts,pageTitle:'صفحه پست ها',user:req.session.user,message:req.flash('message'),layout:'./panel'});
                }).catch(error=>{
                    req.flash('message','error-خطا-خطایی در دریافت داده ها رخ داده است');
                    res.redirect('/admin');
                });
            }else{
                Post.paginate({$and:[{$or:[{title:{$regex: '.*' + search + '.*'}},{body:{$regex: '.*' + search + '.*'}},{tags:{$regex: '.*' + search + '.*'}}]},{category:category}]},{page,select:{'user':0,'viewCount':0,'commentCount':0,'likeCount':0,'thumbnail':0,'body':0,'tags':0,'category':0,'date':0},limit:2,sort:{date:'desc'}}/*,{select:{'_id':0}}*//*,{populate:({ path:'user',select:{'_id':0,'password':0,'device':0,'isAdmin':0,'joint_date':0,'status':0}})}*/).then(posts=>{
                    res.render('admin/posts',{category,search,comment_count,posts_count,user_count,posts,pageTitle:'صفحه پست ها',user:req.session.user,message:req.flash('message'),layout:'./panel'});
                }).catch(error=>{
                    req.flash('message','error-خطا-خطایی در دریافت داده ها رخ داده است');
                    res.redirect('/admin');
                });
            }
        }
    }
    async create(req,res){
        try{
            const categories = await Category.find({user:req.session.user._id});
            res.render('admin/createPost',{categories,pageTitle:'ساخت پست جدید',user:req.session.user,layout:'./panel',message:req.flash('message'),title_error:req.flash('title'),body_error:req.flash('body'),tags_error:req.flash('tags'),category_error:req.flash('category'),status_error:req.flash('status'),image_error:req.flash('image')});
        }catch (err) {
            if (err){
                req.flash('message','error-هشدار-خطایی در دریافت دسته بندی ها رخ داده است');
                return res.redirect('/admin/posts');
            }
        }
    }
    async store(req,res){

        if (req.session.fileName != undefined && req.session.fileName.length > 0){
            const schema = Joi.object({
                title:Joi.string().required().min(4).max(256).messages({
                    "string.min":"عنوان پست حداقل باید 4 کاراکتر باشد",
                    "string.max":"عنوان پست می تواند حداکثر 256 کاراکتر باشد",
                    "string.empty":"وارد کردن عنوان پست الزامی می باشد"
                }),
                body:Joi.string().required().min(4).max(16386).messages({
                    "string.min":"متن پست حداقل باید 4 کاراکتر باشد",
                    "string.max":"متن پست می تواند حداکثر 16386 کاراکتر باشد",
                    "string.empty":"متن کردن عنوان پست الزامی می باشد"
                }),
                tags:Joi.string().min(2).max(256).required().messages({
                    "string.min":"تگ های پست حداقل باید 2 کاراکتر باشد",
                    "string.max":"تگ های پست نمی تواند بیشتر از 512 کاراکتر باشد",
                    "string.empty":"تگ های پست رمز عبور الزامی می باشد"
                }),
                status:Joi.valid('1','0').required().messages({
                    "string.valid":"وضعیت پست فقط می تواند یکی از دو اعداد 0 یا 1 باشد",
                    "string.empty":"وضعیت پست الزامی می باشد"
                }),
                category:Joi.objectId().required().messages({
                    "string.objectId":"دسته بندی وارد شده نامعتبر می باشد",
                    "string.empty":"دسته بندی پست الزامی می باشد"
                })
            });

            try {
                await schema.validateAsync(req.body,{abortEarly:false});
            }catch (error) {
                for (const x of error.details){
                    req.flash([x.context.key],x.message);
                }
                return res.redirect('/admin/posts/create');
            }

            const {title,body,tags,category,status} = req.body;


            var s = slug(title);

            const user = req.session.user._id;
            const thumbnail = req.session.fileName;

            const post = await Post.create({
                thumbnail,slug:s,
                title,body,tags,category,status,user,date:Date.now()
            });

            req.session.fileName = null;
            req.flash('message','success-تبریک-پست جدید با موفقیت اضافه شد');
            res.redirect('/admin/posts');

        } else {
            req.flash('image','تصویر پست الزامی می باشد');
            return res.redirect('/admin/posts/create');
        }

    }
    async edit(req,res){
        const post_id = req.params.post || 1;
        const post = await Post.findOne({_id:post_id,user:req.session.user._id}).select({'user':0,viewCount:0,commentCount:0,likeCount:0,slug:0,date:0});
        if (post){
            req.session.fileName = post.thumbnail;

            try {
                const categories = await Category.find({user:req.session.user._id});
                res.render('admin/editPost',{path,categories,post,pageTitle:'ویرایش پست',user:req.session.user,layout:'./panel',message:req.flash('message'),title_error:req.flash('title'),body_error:req.flash('body'),tags_error:req.flash('tags'),category_error:req.flash('category'),status_error:req.flash('status'),image_error:req.flash('image')});

            }catch (err) {
                if (err){
                    req.flash('message','error-هشدار-خطایی در دریافت دسته بندی ها رخ داده است');
                    return res.redirect('/admin/posts');
                }
            }
        } else{
            req.flash('message','error-خطا-چنین پستی وجود ندارد');
            return res.redirect('/admin/posts');
        }
    }
    async update(req,res){

        const post_id = req.params.post;
        const p = await Post.findOne({_id:post_id,user:req.session.user._id});

        if (p){
            if (req.session.fileName != undefined && req.session.fileName.length > 0){
                const schema = Joi.object({
                    title:Joi.string().required().min(4).max(256).messages({
                        "string.min":"عنوان پست حداقل باید 4 کاراکتر باشد",
                        "string.max":"عنوان پست می تواند حداکثر 256 کاراکتر باشد",
                        "string.empty":"وارد کردن عنوان پست الزامی می باشد"
                    }),
                    body:Joi.string().required().min(4).max(16386).messages({
                        "string.min":"متن پست حداقل باید 4 کاراکتر باشد",
                        "string.max":"متن پست می تواند حداکثر 16386 کاراکتر باشد",
                        "string.empty":"متن کردن عنوان پست الزامی می باشد"
                    }),
                    tags:Joi.string().min(2).max(256).required().messages({
                        "string.min":"تگ های پست حداقل باید 2 کاراکتر باشد",
                        "string.max":"تگ های پست نمی تواند بیشتر از 256 کاراکتر باشد",
                        "string.empty":"تگ های پست رمز عبور الزامی می باشد"
                    }),
                    status:Joi.valid('1','0').required().messages({
                        "string.valid":"وضعیت پست فقط می تواند یکی از دو اعداد 0 یا 1 باشد",
                        "string.empty":"وضعیت پست الزامی می باشد"
                    }),
                    category:Joi.objectId().required().messages({
                        "string.objectId":"دسته بندی وارد شده نامعتبر می باشد",
                        "string.empty":"دسته بندی پست الزامی می باشد"
                    })
                });

                try {
                    await schema.validateAsync(req.body,{abortEarly:false});
                }catch (error) {
                    for (const x of error.details){
                        req.flash([x.context.key],x.message);
                    }
                    return res.redirect('/admin/posts/'+post_id+'/edit');
                }

                const {title,body,tags,category,status} = req.body;


                var s = slug(title);

                const user = req.session.user._id;
                const thumbnail = req.session.fileName;

                p.title = title;
                p.thumbnail = thumbnail;
                p.slug = s;
                p.body = body;
                p.tags = tags;
                p.category = category;
                p.status = status;
                p.date = Date.now();

                p.save(err=>{
                    if (err){
                        req.flash('message','خطایی در ویرایش کردن رخ داده است');
                        return res.redirect('/admin/posts/'+post_id+'/edit');
                    }
                    req.session.fileName = null;
                    req.flash('message','success-تبریک-پست شما با موفقیت ویرایش شد');
                    res.redirect('/admin/posts');

                });

            } else {
                req.flash('image','تصویر پست الزامی می باشد');
                return res.redirect('/admin/posts/'+post_id+'/edit');
            }
        } else{
            req.flash('message','error-خطا-چنین پستی وجود ندارد');
            return res.redirect('/admin/posts');
        }
    }
    async destroy(req,res){
        const post_id = req.params.post || 1;
        const post = await Post.findOne({_id:post_id,user:req.session.user._id});
        if (post){
            try{
                fs.unlinkSync(post.thumbnail);
            }catch (e) {
                if (e){
                    req.flash('message','error-خطا-تصویری برای پست وجود ندارد');
                    return res.redirect('/admin/posts');
                }
            }


            //remove all images in post body
            const urls = [];
            const rex = /src\s*=\s*"(.+?)"/g;
            const str = post.body;
            var m;
            while ( m = rex.exec( str ) ) {
                urls.push( m[1] );
            }
            urls.forEach(url=>{
                fs.unlinkSync(path.join(__dirname,'..','..','public',url.slice(1,url.length)));
            });

            post.remove({_id: post_id},async function(err){
                if(err){
                    req.flash('message','error-خطا-خطایی در حذف کردن رخ داده است');
                    return res.redirect('/admin/posts');
                }

                try {
                    await Comment.remove({post:post_id});
                    req.flash('message','success-تبریک-پست مورد نظر با موفقیت حذف شد');
                    res.redirect('/admin/posts');
                }catch (err) {
                    if (err){
                        req.flash('message','error-هشدار-خطایی در حذف کردن نظرات مرتبط با پست رخ داده است');
                    }
                }
            });

        } else{
            req.flash('message','error-خطا-چنین پستی وجود ندارد');
            return res.redirect('/admin/posts');
        }
    }
    async changeStatus(req,res){
        const post_id = req.params.post || 1;
        const page = req.query.page || 1;
        const category = req.query.category || '';
        const search = req.query.search || '';

        const post = await Post.findOne({_id:post_id});
        if (post){
            if (post.status === '0'){
                post.status = '1';
                await post.save();
                req.flash('message','success-تبریک-پست شما نمایش داده شد');
                if (category != ''){
                    if (search != ''){
                        return res.redirect('/admin/posts?page='+page+'&category='+category+'&search='+search);
                    }
                    return res.redirect('/admin/posts?page='+page+'&category='+category);
                }
                return res.redirect('/admin/posts?page='+page);
            } else{
                post.status = '0';
                await post.save();
                req.flash('message','success-تبریک-پست شما مخفی شد');
                if (category != ''){
                    if (search != ''){
                        return res.redirect('/admin/posts?page='+page+'&category='+category+'&search='+search);
                    }
                    return res.redirect('/admin/posts?page='+page+'&category='+category);
                }
                return res.redirect('/admin/posts?page='+page);
            }
        } else{
            req.flash('message','error-خطا-چنین پستی وجود ندارد');
            if (category != ''){
                if (search != ''){
                    return res.redirect('/admin/posts?page='+page+'&category='+category+'&search='+search);
                }
                return res.redirect('/admin/posts?page='+page+'&category='+category);
            }
            if (search != ''){
                return res.redirect('/admin/posts?page='+page+'&search='+search);
            }
            return res.redirect('/admin/posts?page='+page);
        }
    }
}

module.exports = new postController();