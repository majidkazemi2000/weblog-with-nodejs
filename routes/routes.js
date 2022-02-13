const express = require('express');
const router = express.Router();

//controllers
const MainController = require('../controllers/MainController');
const AuthController = require('../controllers/AuthController');


//main routes
router.get('/',MainController.index);
router.get('/posts/category/:category',MainController.getPostFromCategory);
router.get('/posts/:post',MainController.singlePost);
router.post('/comment/:post',MainController.commentHandle);


//authentication routes
router.get('/login',AuthController.login);
router.post('/login',AuthController.handleLogin);
router.get('/register',AuthController.register);
router.post('/register',AuthController.handleRegister);
router.get('/verify-google',AuthController.handleGoogle);
router.get('/logout',AuthController.logout);


module.exports = router;


