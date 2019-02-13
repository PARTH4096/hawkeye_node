const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

var userSchema = new mongoose.Schema({
    firstName: { type: String },
    lastName: { type: String },
    email: {
        type: String,
        required: 'Email can\'t be empty',
        unique: true
    },
    password: {
        type: String,
        required: 'Password can\'t be empty',
        minlength: [4, 'Password must be atleast 4 character long']
    },
age:{type:Number},
    freeland : { type:  String  },
    sheltered: { type:  String  },
    car: { type:  String  },
    bus: { type: String  },
    bicycle:{ type: String  },
    van: { type:  String },
    lorry:{ type: String  },
    other : { type:  String },
    mweight : { type:  String  },
    mheight:{ type: String  },
    vehicles: { type: String },
    street:{ type:  String  },
    city: { type:  String },
    state: { type:  String  },
    zip:{ type:  String },
    saltSecret:{type: String},
    temptoken:{type : String},
    role:{type:String,default:"user"}
});

// Custom validation for email
userSchema.path('email').validate((val) => {
    emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(val);
}, 'Invalid e-mail.');

// Events
userSchema.pre('save', function (next) {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(this.password, salt, (err, hash) => {
            this.password = hash;
            this.saltSecret = salt;
            next();
        });
    });
});


// Methods
userSchema.methods.verifyPassword = function (password) {
    return bcrypt.compareSync(password, this.password);
};

userSchema.methods.generateJwt = function () {
    return jwt.sign({ _id: this._id},
        process.env.JWT_SECRET,
    {
        expiresIn: process.env.JWT_EXP
    });
}



mongoose.model('User', userSchema);