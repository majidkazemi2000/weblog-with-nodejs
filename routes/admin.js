//packages
const express = require('express');
const router = express.Router();
const {imageUpload} = require('../configs/multer');
const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

//middlewares
const isAuthenticated = require('../middlewares/authenticated');


//controllers
const AdminController = require('../controllers/admin/AdminController');
const PostController = require('../controllers/admin/PostController');
const CategoryController = require('../controllers/admin/CategoryController');
const CommentController = require('../controllers/admin/CommentController');
const UserController = require('../controllers/admin/UserController');


//panel route
router.get('/',isAuthenticated,AdminController.index);

//post routes
router.get('/posts',isAuthenticated,PostController.index);
router.get('/posts/create',isAuthenticated,PostController.create);
router.post('/fileUploader',isAuthenticated,imageUpload.single('upload'),async(req,res)=>{
    sharp(path.join(__dirname,'..',req.file.path))
        .jpeg({ quality: 60 })
        .toFile(path.join(__dirname,'..','public',req.file.filename),(err)=>{
            fs.unlinkSync(path.join(__dirname,'..',req.file.path));
            res.json({'fileName':req.file.filename,'uploaded':1,'url':'/'+req.file.filename});
        });
}, (error, req, res, next) => {
    res.send('error');
});
router.post('/fileUploadThumbnail',isAuthenticated,imageUpload.single('file'),async(req,res)=>{

    if (req.session.fileName){
        try {
            fs.unlinkSync(req.session.fileName);
        }catch (e) {
            res.send('error');
        }
    }

    sharp(path.join(__dirname,'..',req.file.path))
        .jpeg({ quality: 60 })
        .toFile(path.join(__dirname,'..','public',req.file.filename),(err)=>{

            fs.unlinkSync(path.join(__dirname,'..',req.file.path));
            req.session.fileName = path.join(__dirname,'..','public',req.file.filename);
            return res.send(path.join(__dirname,'..','public',req.file.filename));
        });
}, (error, req, res, next) => {
    req.session.fileName = null;
    res.send('error');
});
router.post('/posts',isAuthenticated,PostController.store);
router.put('/posts/:post',isAuthenticated,PostController.update);
router.get('/posts/:post/edit',isAuthenticated,PostController.edit);
router.delete('/posts/:post',isAuthenticated,PostController.destroy);
router.get('/posts/changeStatus/:post',isAuthenticated,PostController.changeStatus);


//category routes
router.get('/categories',isAuthenticated,CategoryController.index);
router.get('/categories/create',isAuthenticated,CategoryController.create);
router.post('/categories',isAuthenticated,CategoryController.store);
router.put('/categories/:category',isAuthenticated,CategoryController.update);
router.get('/categories/:category/edit',isAuthenticated,CategoryController.edit);
router.delete('/categories/:category',isAuthenticated,CategoryController.destroy);


//comment routes
router.get('/comments',isAuthenticated,CommentController.index);
router.delete('/comments/:comment',isAuthenticated,CommentController.destroy);
router.get('/comments/changeStatus/:comment',isAuthenticated,CommentController.changeStatus);



//user routes
router.get('/users',isAuthenticated,UserController.index);
router.get('/users/:user',isAuthenticated,UserController.show);
router.delete('/users/:user',isAuthenticated,UserController.destroy);
router.get('/users/changeStatus/:user',isAuthenticated,UserController.changeStatus);

//setting route
router.get('/settings',isAuthenticated,AdminController.setting);
router.post('/settings',isAuthenticated,AdminController.handleSetting);
router.post('/iconUploader',isAuthenticated,imageUpload.single('file'),async(req,res)=>{
    sharp(path.join(__dirname,'..',req.file.path))
        .toFile(path.join(__dirname,'..','public',req.file.filename),(err)=>{
            fs.unlinkSync(path.join(__dirname,'..',req.file.path));
        });
    req.session.iconName = req.file.filename;
    return res.json({'message':'success'});

}, (error, req, res, next) => {
    console.log(error);
});

module.exports = router;