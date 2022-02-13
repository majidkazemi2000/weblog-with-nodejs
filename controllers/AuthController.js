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



class AuthController{


    login(req,res){

        if (req.session.user != undefined){
            if (req.session.isAdmin != undefined && req.session.isAdmin){
                res.redirect('/admin');
            } else{
                res.redirect('/');
            }
        } else{

            res.render('login',{pageTitle:'صفحه ورود',google_link:getLink(),message:req.flash('message'),email_error:req.flash('email'),password_error:req.flash('password'),recaptcha_error:req.flash('recaptcha')});
        }
    }
    async handleLogin(req,res){
        if (req.session.user != undefined){
            return res.redirect('/');
        } else{
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

                //console.log(typeof json.success);
                if (json.success){
                    const {email,password}=req.body;
                    const schema = Joi.object({
                        email:Joi.string().email().required().messages({
                            "string.email":"ایمیل وارد شده نامعتبر می باشد",
                            "string.empty":"وارد کردن ایمیل الزامی می باشد"
                        }),
                        password:Joi.string().min(4).max(128).required().messages({
                            "string.min":"رمز عبور حداقل باید 4 کاراکتر باشد",
                            "string.max":"رمز عبور نمی تواند بیشتر از 128 کاراکتر باشد",
                            "string.empty":"وارد کردن رمز عبور الزامی می باشد"
                        })
                    });

                    try {
                        await schema.validateAsync({email:req.body.email,password:req.body.password},{abortEarly:false});
                    }catch (error) {
                        for (const x of error.details){
                            req.flash([x.context.key],x.message);
                        }
                        return res.redirect('/login');
                    }


                    const user = await User.findOne({email:email});
                    if (user){
                        user.comparePassword(password,(cb)=>{
                            if (cb){
                                req.session.user = {
                                    _id:user._id,
                                    name:user.name,
                                    email:user.email,
                                    isAdmin:user.isAdmin,
                                    status:user.status
                                };
                                if (user.isAdmin){
                                    req.session.isAdmin = true;
                                    return res.redirect('/admin');
                                }else{
                                    req.session.isAdmin = false;
                                    return res.redirect('/');
                                }
                            }  else{
                                req.flash('message','error-خطا-نام کاربری یا رمز عبور اشتباه است')
                                return res.redirect('/login');
                            }
                        });

                    } else{
                        req.flash('message','error-خطا-چنین کاربری وجود ندارد')
                        return res.redirect('/login');
                    }

                }else{
                    req.flash('recaptcha','لطفا دوباره گزینه { من ربات نیستم } را انتخاب کنید');
                    return res.redirect('/login');
                }
            }else{
                req.flash('recaptcha','انتخاب کردن گزینه { من ربات نیستم } الزامی است');
                return res.redirect('/login');
            }
        }
    }
    register(req,res){
        if (req.session.user != undefined){
            if (req.session.isAdmin != undefined && req.session.isAdmin){
                res.redirect('/admin');
            } else{
                res.redirect('/');
            }
        } else{
            res.render('register',{pageTitle:'ثبت نام',google_link:getLink(),message:req.flash('message'),name_error:req.flash('name'),email_error:req.flash('email'),password_error:req.flash('password')});
        }
    }
    async handleRegister(req,res){
        if (req.session.user != undefined){
            res.redirect('/');
        } else{
            const {name,email,password} = req.body;
            const device = req.headers["user-agent"];

            const schema = Joi.object({
                name:Joi.string().max(128).required().messages({
                    "string.max":"نام شما نمی تواند بیشتر از 128 کاراکتر باشد",
                    "string.empty":"وارد کردن نام الزامی می باشد"
                }),
                email:Joi.string().email().required().messages({
                    "string.email":"ایمیل وارد شده نامعتبر می باشد",
                    "string.empty":"وارد کردن ایمیل الزامی می باشد"
                }),
                password:Joi.string().min(4).max(128).required().messages({
                    "string.min":"رمز عبور حداقل باید 4 کاراکتر باشد",
                    "string.max":"رمز عبور نمی تواند بیشتر از 128 کاراکتر باشد",
                    "string.empty":"وارد کردن رمز عبور الزامی می باشد"
                })
            });

            try {
                await schema.validateAsync(req.body,{abortEarly:false});
            }catch (error) {
                for (const x of error.details){
                    req.flash([x.context.key],x.message);
                }
                return res.redirect('/register');
            }



            const user = await User.findOne({email:email});
            const joint_date = moment(Date.now()).locale('fa').format('YYYY/MM/DD,HH:mm');
            if (user){
                req.flash('message','error-خطا-چنین کاربری وجود دارد');
                res.redirect('/register');
            } else{
                const newUser = await User.create({
                    name,
                    email,
                    password,
                    device,
                    joint_date
                });
                req.session.isAdmin = false;
                req.session.user = {
                    _id:newUser._id,name,email,isAdmin:false,status:true
                };

                sendMail(email,(response=>{
                    if (response){
                        req.flash('message','success-تبریک-ثبت نام شما با موفقیت انجام شد');
                        res.redirect('/');
                    }else{
                        req.flash('message','error-هشدار-خطایی در ارسال ایمیل تایید رخ داده است');
                        res.redirect('/');
                    }
                }));
            }
        }
    }
    async handleGoogle(req,res){
        const code = req.query.code;

        const {tokens} = await oauth2Client.getToken(code)
        oauth2Client.setCredentials(tokens);
        axios.get('https://www.googleapis.com/oauth2/v2/userinfo',{headers:{Authorization:'Bearer '+tokens.access_token}})
            .then(async function (response) {
                const user = response.data;

                 if (user.verified_email){

                     const userDatabase = await User.findOne({email:user.email});
                        if (userDatabase){

                            userDatabase.comparePassword(user.id,(cb)=>{
                               if (cb){
                                   req.session.user = userDatabase;

                                    if (userDatabase.isAdmin){
                                        req.session.isAdmin = true;
                                        res.redirect('/admin');
                                    } else{
                                        req.session.isAdmin = false;
                                        res.redirect('/');
                                    }
                               }  else{
                                   req.flash('mesasge','error-خطا-خطایی در احراز هویت رخ داده است');
                                   res.redirect('/login');
                               }
                            });
                        } else{


                            //register user in database
                            const name = user.email.split("@")[0];

                            const device = req.headers["user-agent"];
                            const joint_date = moment(Date.now()).locale('fa').format('YYYY/MM/DD,HH:mm');

                            const newUser = await User.create({
                                name,
                                email :user.email,
                                password : user.id,
                                device,
                                joint_date
                            });
                            req.session.isAdmin = false;
                            req.session.user = newUser;


                            sendMail(user.email,(response=>{
                                if (response){
                                    req.flash('message','success-تبریک-ثبت نام شما با موفقیت انجام شد');
                                    res.redirect('/');
                                }else{
                                    req.flash('message','error-هشدار-خطایی در ارسال ایمیل تایید رخ داده است');
                                    res.redirect('/');
                                }
                            }));

                        }

                 }else{
                     req.flash('mesasge','error-خطا-ایمیل شما تایید نشده است');
                     res.redirect('/login');
                 }
            })
            .catch(function (error) {
                req.flash('mesasge','error-خطا-احراز هویت شما تکمیل نشد ,لطفا دوباره تلاش کنید');
                res.redirect('/login');
            });
    }

    logout(req,res){
        req.session.destroy();
        res.redirect('/');
    }

}

module.exports = new AuthController();