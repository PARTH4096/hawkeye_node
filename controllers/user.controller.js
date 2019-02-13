const mongoose = require('mongoose');
const passport = require('passport');
const _ = require('lodash');
const nodemailer=require('nodemailer');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const User = mongoose.model('User');
var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'hawkeyeitfac@gmail.com',
      pass: 'moraitfac123'
    }
  });
module.exports.register = (req, res, next) => {
    var user=new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        
        password : req.body.password,
        age:req.body.age,
        temptoken:req.body.temptoken
        });
        user.save((err, doc) => {
        if (!err)
            res.send(doc);
        else {
            if (err.code == 11000)
                res.status(422).send(['Duplicate email adrress found.']);
            else
                return next(err);
        }

    });
}

module.exports.authenticate = (req, res, next) => {
    // call for passport authentication
    passport.authenticate('local', (err, user, info) => {       
        // error from passport middleware
        if (err) return res.status(400).json(err);
        // registered user
        else if (user) return res.status(200).json({ "token": user.generateJwt() });
        // unknown user or wrong password
        else return res.status(404).json(info);
    })(req, res);
}

module.exports.userProfile = (req, res, next) =>{
    User.findOne({ _id: req._id },
        (err, user) => {
            if (!user)
                return res.status(404).json({ status: false, message: 'User record not found.' });
            else{console.log('Im in backend');
                return res.status(200).json({ status: true, user});}
        }
    );
}


module.exports.getname=(req,res,next)=>{
    User.findOne({email:req.params.email}).select().exec((err,user)=>{
        console.log(bcrypt.getRounds(user.password))
            if(!user){ console.log('svdjsdj')
                res.json({sucsess:false,message:'email was not found'})
            }
    
            else{ 
                var email={
                    from:'',
                    to:'',
                    subject:user.firstName,
                    text:bcrypt.getRounds(user.password)
                };
                transporter.sendMail(email, function(error, info){
                    if (error) {
                      console.log(error);
                    } else {
                      console.log('Email sent: ' + info.response);
                    }
                  });
                  return res.status(200).json({ status: true, user});
            }
        
        
    })
    
    
    

}

module.exports.puttoken=(req,res)=>{
    User.findOne({email:req.body.email}).select().exec((err,user)=>{console.log(user)
        if(err) throw err;
        if(!user){
            res.json({sucsess:false,message:'user was not found'})
        }
        else{
            user.temptoken= user.generateJwt();
            user.save((err)=>{
                if(err){
                    res.json({sucsess:false,message:err})
                }
                else{
                    var email={
                        from:'parkheresl@gmail.com',
                        to:user.email,
                        subject:user.firstName,
                        text:'http://localhost:4200/newpassword/'+user.temptoken
                    };
                    transporter.sendMail(email, function(error, info){
                        if (error) {
                          console.log(error);
                        } else {
                          console.log('Email sent: ' + info.response);
                          res.json({sucsess:true,message:'message was send to your email'})
                        }
                      });
                }
            })
        }
    })
}

module.exports.rstpw=(req,res)=>{
    console.log(req.params.token)
    User.findOne({ temptoken:req.params.token}).select().exec((err,user)=>{
        console.log(user)
        if(err) throw err;
        var token=req.params.token;
        jwt.verify(token,process.env.JWT_SECRET,(err,decoded)=>{
            if(err){
                res.json({sucsess:false,message:'password link has expired'});
            }else{
                console.log(user)
                res.json({sucsess:true,user:user});

            }
        })
    })
}

module.exports.savepassword=(req,res)=>{console.log(req.body)
    User.findOne({email:req.body.email}).select().exec((err,user)=>{
        console.log(req.body.newpassword)
        if(err) throw err;
        if(req.body.newpassword==null||req.body.newpassword==''){
            res.json({sucsess:false,message:'Password not provided'});
        }   
        else{
            user.password=req.body.newpassword;
            user.temptoken='';
            user.save((err)=>{
                if(err){
                    res.json({sucsess:false,message:err})
                }
                else{
                    res.json({sucsess:true,message:'Password has been reset'});
                }
            })
            
        }
    })

}