//models
const Post = require('../models/post');
const User = require('../models/user');
const Category = require('../models/category');
const Setting = require('../models/setting');
const Comment = require('../models/comment');

//packages
const Joi = require('joi');
const axios = require('axios').default;
require('dotenv').config();
const fetch = require('node-fetch');
const {getLink,oauth2Client} = require('./../configs/oauth');
const moment = require('jalali-moment');
const path = require('path');
const {convertDate} = require('../utils/date');
const {extractContent} = require('../utils/extract');
const {convertNumbers} = require('../utils/persianNumber');
const {convertEnglish} = require('../utils/englishNumber');
const {sendMail} = require('../utils/mailer');

class MainController {

    async index(req,res){

        const page = req.query.page || 1;
        const search = req.query.search || '';


        const headerPosts = await Post.find({status:'1'}).select({'tags':0,'status':0,'likeCount':0,'commentCount':0,'viewCount':0,'body':0}).populate({path:'category',select:{'title':1,'slug':1}}).populate({ path:'user',select:{'_id':1,'name':1}}).sort({date:'desc'}).limit(4);
        const popularPosts = await Post.find({status:'1'}).select({'title':1,'slug':1,'thumbnail':1}).sort({viewCount:'desc'}).limit(4);
        const categories = await Category.find({});
        const s = await Setting.find({});
        const setting = s[0];

        if (search == ''){
            const posts = await Post.paginate({status:'1'},{page,select:{'tags':0,'status':0,'commentCount':0,'likeCount':0,'viewCount':0},limit:4,sort:{date:'desc'},populate:[({ path:'user',select:{'name':1,'_id':1}}),({path:'category',select:{'slug':1,'title':1}})]});
            res.render('blog',{search,setting,extractContent,posts,popularPosts,convertDate,moment,path,headerPosts,categories,pageTitle:setting.title,message:req.flash('message'),user:req.session.user,isAdmin:req.session.isAdmin,layout:'./blogLayout'});
        }else{
            const posts = await Post.paginate({$and:[{$or:[{title:{$regex: '.*' + search + '.*'}},{body:{$regex: '.*' + search + '.*'}},{tags:{$regex: '.*' + search + '.*'}}]},{status:'1'}]},{page,select:{'tags':0,'status':0,'commentCount':0,'likeCount':0,'viewCount':0},limit:4,sort:{date:'desc'},populate:[({ path:'user',select:{'name':1,'_id':1}}),({path:'category',select:{'slug':1,'title':1}})]});
            res.render('blog',{search,setting,extractContent,posts,popularPosts,convertDate,moment,path,headerPosts,categories,pageTitle:setting.title,message:req.flash('message'),user:req.session.user,isAdmin:req.session.isAdmin,layout:'./blogLayout'});
        }

    }

    async getPostFromCategory(req,res){

        const page = req.query.page || 1;
        const search = req.query.search || '';

        const cat = req.params.category;
        const c = await Category.findOne({slug:cat});
        if (c){
            const categories = await Category.find({});
            const s = await Setting.find({});
            const setting = s[0];

            if (search == ''){
                const posts = await Post.paginate({status:'1',category:c._id},{page,select:{'tags':0,'status':0,'commentCount':0,'likeCount':0,'viewCount':0},limit:4,sort:{date:'desc'},populate:[({ path:'user',select:{'name':1,'_id':1}}),({path:'category',select:{'slug':1,'title':1}})]});
                res.render('search',{catt:c.title,cat:c.slug,search,setting,extractContent,posts,convertDate,moment,path,categories,pageTitle:setting.title,message:req.flash('message'),user:req.session.user,isAdmin:req.session.isAdmin,layout:'./blogLayout'});
            }else{
                const posts = await Post.paginate({$and:[{$or:[{title:{$regex: '.*' + search + '.*'}},{body:{$regex: '.*' + search + '.*'}},{tags:{$regex: '.*' + search + '.*'}}]},{status:'1'},{category:c._id}]},{page,select:{'tags':0,'status':0,'commentCount':0,'likeCount':0,'viewCount':0},limit:4,sort:{date:'desc'},populate:[({ path:'user',select:{'name':1,'_id':1}}),({path:'category',select:{'slug':1,'title':1}})]});
                res.render('search',{catt:c.title,cat:c.slug,search,setting,extractContent,posts,convertDate,moment,path,categories,pageTitle:setting.title,message:req.flash('message'),user:req.session.user,isAdmin:req.session.isAdmin,layout:'./blogLayout'});
            }
        }else{
            res.render('errors/404',{pageTitle:'404'});
        }

    }


    async singlePost(req,res){

        const settingArray = await Setting.find({});
        const settings = settingArray[0];

        const post = await Post.findOne({$and:[{slug:req.params.post},{status:'1'}]}).select({'status':0}).populate({ path:'user',select:{'_id':1,'name':1}}).populate({ path:'category',select:{'slug':1,'title':1}});
        if (post){
            const s = await Setting.find({});
            const setting = s[0];

            const categories = await Category.find({});

            post.viewCount = post.viewCount+1;
            await post.save();


            const comments = await Comment.find({$and:[{approved:true},{post:post._id},{parent:null}]}).select({'post':0,'approved':0,'likeCount':0}).sort({dete:'desc'}).populate({path:'user',select:{'name':1}});
            const relatedPost = await Post.find({$and:[{status:'1'},{category:post.category._id},{_id:{$ne:post._id}}]}).select({'thumbnail':1,'title':1,'slug':1}).sort({date:'desc'}).limit(5);
            res.render('single',{settings,comments,relatedPost,convertEnglish,convertNumbers,moment,path,categories,extractContent,convertDate,post,setting,layout:'./blogLayout',pageTitle:post.title,user:req.session.user,isAdmin:req.session.isAdmin,message:req.flash('message')});
        }else{
            res.render('errors/404',{pageTitle:'404'});
        }
    }

    

    async commentHandle(req,res){

        const post = await Post.findOne({$and:[{status:'1'},{_id:req.params.post}]});

        if (post){
            if (req.session.user != undefined){

                if (req.body['g-recaptcha-response']){
                    const recaptcha = req.body['g-recaptcha-response'];

                    const verifyUrl = `https://google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptcha}&remoteip=${req.connection.remoteAddress}`;

                    const response = await fetch(verifyUrl, {
                        method: "POST",
                        headers: {
                            Accept: "application/json",
                            "Content-Type": "application/x-www-form-urlencoded; charset=utf-8",
                        },
                    });

                    const json = await response.json();

                    if (json.success){

                        if (req.body.text.trim().length < 2 || req.body.text.trim().length > 256){
                            req.flash('message','error-هشدار-نظر شما باید حداقل 2 کاراکتر و حداکثر 256 کاراکتر باشد');
                            return res.redirect('/posts/'+post.slug);
                        }else{
                            try{
                                const joint_date = moment(Date.now()).locale('fa').format('YYYY/MM/DD,HH:mm');

                                await Comment.create({
                                    user:req.session.user._id,
                                    post:post._id,
                                    body:req.body.text.trim(),
                                    date:joint_date
                                });
                                req.flash('message','success-تبریک-دیدگاه شما پس از تایید نمایش داده می شود');
                                return res.redirect('/posts/'+post.slug);

                            }catch (error) {
                                req.flash('message','error-هشدار-خطایی در ذخیره کردن دیدگاه رخ داده است');
                                return res.redirect('/posts/'+post.slug);
                            }
                        }

                    }else{
                        req.flash('message','error-هشدار-لطفا دوباره گزینه { من ربات نیستم } را انتخاب کنید');
                        return res.redirect('/posts/'+post.slug);
                    }
                }else{
                    req.flash('message','error-هشدار-انتخاب گزینه { من ربات نیستم } برای ثبت دیدگاه الزامی است');
                    return res.redirect('/posts/'+post.slug);
                }

            }else{
                req.flash('message','error-هشدار-برای ثبت نظر باید در سایت ثبت نام کنید');
                return res.redirect('/posts/'+post.slug);
            }
        }else{
            req.flash('message','error-هشدار-پست مورد نظر برای ثبت دیدگاه وجود ندارد')
            return res.redirect('/');
        }

    }

    
}
module.exports = new MainController();