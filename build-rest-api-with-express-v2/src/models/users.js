'use strict';

const mongoose  = require('mongoose');
const bcrypt    = require('bcrypt');

const UserSchema = new mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Full Name is required.'],
        trim: true
    },
    emailAddress: {
        type: String,
        required: [true, 'Email is required.'],
        trim: true,
        unique: [true, 'The email address is already taken.'],
        validate: {
            validator: function(email){
              let testEmail = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
              return testEmail.test(email);
            },
            message: '{VALUE} is not a valid email'
        }
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
    }
});

//authenticate input against Database
UserSchema.statics.authenticate = (email, password, callback) => {
  User.findOne({email: email})
      .exec((err, user) => {
        if (err) return callback(err);
        if (!user) {
          let err = new Error('User not found.');
          err.status = 401;
          return callback(err);
        }
        bcrypt.compare(password, user.password, (err, result) => {
          if (result === true) {
            return callback(null, user);
          } else {
            return callback();
          }
        });
      });
};

//hash Password
UserSchema.pre('save',  function(next) {
  let user = this;

  if ( user.isModified('password') ) {
    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(user.password, salt, (err, hash) => {
        if (err) return next(err);
        user.password = hash;
        next();
      });
    });
  } else {
    next();
  }
});

const User = mongoose.model('User', UserSchema);

module.exports = {User};
