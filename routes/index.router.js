const express = require('express');
const router = express.Router();

const ctrlUser = require('../controllers/user.controller');
const ctrlpost = require('../controllers/post.controller');
const jwtHelper = require('../config/jwtHelper');

router.post('/register', ctrlUser.register);
router.post('/authenticate', ctrlUser.authenticate);
router.get('/userProfile',jwtHelper.verifyJwtToken, ctrlUser.userProfile);
router.get('/getname/:email', ctrlUser.getname);
router.put('/rstpw',ctrlUser.puttoken);
router.get('/resetpassword/:token', ctrlUser.rstpw);
router.put('/savepassword',ctrlUser.savepassword);



// ---------------------------------------------------------------------------------------------------
router.post('/newpost',ctrlpost.newpost);
router.get('/all',ctrlpost.all);
router.post('/post/:id',ctrlpost.post);


router.post('/like',ctrlpost.like);
router.post('/rate',ctrlpost.rate);
router.post('/dislike',ctrlpost.dislike);
router.post('/comment',ctrlpost.comment);
router.post('/delete',ctrlpost.delete);
module.exports = router;



