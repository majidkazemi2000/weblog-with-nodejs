//models
const Setting = require('../../models/setting');
const User = require('../../models/user');
const Comment = require('../../models/comment');
const Post = require('../../models/post');

//moduels
const path = require('path');
const Joi = require('joi');
const fs =require('fs');

class AdminController {
    async index(req,res){
        const id = req.session.user._id;
        const posts_count = await Post.count({user:id});
        const user_count = await User.count({_id:{$ne:id}});
        const comment_count = await Comment.count({});
        var platforms = {"windows":0,"linux":0,"android":0,"ios":0,"windowsPhone":0,"mac":0,"other":0};
        var browsers = {"firefox":0,"chrome":0,"safari":0,"opera":0,"edge":0,"ie":0,"other":0};
        User.find({},(err,users)=>{
           if (err) return res.redirect('/');
           users.forEach(user=>{
              if (user.device.search('Windows NT') != -1){
                  platforms.windows += 1;
              }else if (user.device.search('Android') != -1){
                  platforms.android += 1;
              }else if (user.device.search('Macintosh') != -1){
                  platforms.mac += 1;
              }else if(user.device.search('iPhone') != -1 || user.device.search('iPad') != -1){
                  platforms.ios += 1;
              }else if(user.device.search('X11') != -1){
                  platforms.linux += 1;
              }else if (user.device.search('Windows Phone') != -1){
                  platforms.windowsPhone += 1
              }else{
                  platforms.other += 1;
              }



               if (user.device.search('Firefox') != -1){
                   browsers.firefox += 1;
               }else if (user.device.search('Edge') != -1 || user.device.search('Edg') != -1){
                   browsers.edge += 1;
               }else if ((user.device.search('Windows') != -1 || user.device.search("x11") != -1 || user.device.search('Macintosh') != -1 || user.device.search('Linux') != -1) && user.device.search('Chrome') != -1 ){
                   browsers.chrome += 1;
               }else if((user.device.search('iPhone') != -1 || user.device.search('iPad') != -1) && user.device.search('Safari') != -1){
                   browsers.safari += 1;
               }else if(user.device.search('Opera') != -1 || user.device.search('OPR') != -1){
                   browsers.opera += 1;
               }else if (user.device.search('compatible') != -1 || user.device.search('Trident') != -1){
                   browsers.ie += 1
               }else{
                   browsers.other += 1;
               }
           });
           var plats = JSON.stringify(platforms);
           var browes = JSON.stringify(browsers);
            res.render('admin/index',{browes,plats,posts_count,user_count,comment_count,message:req.flash('message'),pageTitle:'صفحه مدیریت',user:req.session.user,layout:'./panel'});

        });

    }
    async setting(req,res){
        const s = await Setting.find({});
        const setting = s[0];
        res.render('admin/setting',{setting,path,pageTitle:'تنظیمات',user:req.session.user,layout:'./panel',message:req.flash('message'),title_error:req.flash('title'),description_error:req.flash('description'),tags_error:req.flash('tags'),commentSystem_error:req.flash('commentSystem')});
    }
    async handleSetting(req,res){
        const schema = Joi.object({
            title:Joi.string().required().min(2).max(256).messages({
                "string.min":"عنوان سایت حداقل باید 2 کاراکتر باشد",
                "string.max":"عنوان سایت می تواند حداکثر 256 کاراکتر باشد",
                "string.empty":"وارد کردن عنوان سایت الزامی می باشد"
            }),
            description:Joi.string().required().min(2).max(256).messages({
                "string.min":"توضیحات سایت حداقل باید 2 کاراکتر باشد",
                "string.max":"توضیحات سایت می تواند حداکثر 256 کاراکتر باشد",
                "string.empty":"وارد کردن توضیحات سایت الزامی می باشد"
            }),
            tags:Joi.string().min(2).max(256).required().messages({
                "string.min":"تگ های پست حداقل باید 2 کاراکتر باشد",
                "string.max":"تگ های پست نمی تواند بیشتر از 256 کاراکتر باشد",
                "string.empty":"تگ های پست رمز عبور الزامی می باشد"
            }),
            commentSystem:Joi.valid('true','false').required().messages({
                "string.valid":"وضعیت سیستم نظردهی فقط می تواند یکی از دو وضعیت true یا false باشید",
                "string.empty":"وضعیت سیستم نظردهی الزامی می باشد"
            })
        });

        try {
            await schema.validateAsync(req.body,{abortEarly:false});
        }catch (error) {
            for (const x of error.details){
                req.flash([x.context.key],x.message);
            }
            return res.redirect('/admin/settings');
        }

        const {title,description,tags,commentSystem} = req.body;

        const user_id = req.session.user._id;

        const user = await User.findOne({_id:user_id});
        if (user && user.isAdmin){

            const s = await Setting.find({});
            const setting = s[0];
            setting.title = title;
            setting.description = description;
            if (req.session.iconName != undefined && req.session.iconName.length > 0){
                fs.unlinkSync(path.join(__dirname,'..','..','public',setting.image));

                setting.image = req.session.iconName;
            }
            setting.commentSystem = commentSystem;
            setting.tags = tags;
            await setting.save();
            req.session.iconName = null;
            req.flash('message','success-تبریک-تنظیمات با موفقیت ذخیره شد');
            res.redirect('/admin');
        }else{
            req.flash('message','error-خطا-شما اجازه دسترسی ندارید');
            res.redirect('/admin/settings');
        }
    }
}

module.exports = new AdminController();