'use strict';

const mongoose    = require('mongoose');
const express     = require('express');
const router      = express.Router();
const {User}      = require('./models/users');
const {Review}    = require('./models/reviews');
const {Course}    = require('./models/courses');
const {authUser}  = require('./auth');


//////////////////////USER PATHS//////////////////////////////

router.get('/users', authUser, (req, res) => {
  res.json(req.authUser);
  res.status(200);
});

router.post('/users', (req, res, next) => {
  User.findOne({emailAddress: req.body.emailAddress})
      .exec((err, user) => {
        if (err) return next(err);
        else {
          if (user) {
            err = new Error();
            err.message = 'Email already in use.';
            err.status = 400;
            return next(err);
          } else {
            User.create(req.body, (err, user) => {
              if (!user.emailAddress || !user.fullName || !user.password) {
                err.status = 400;
                return next(err);
              } else if (err) {
                return next (err)
              } else {
                res.location('/');
                res.status(201).json();
              }
            });
          }
        }
      });
});

module.exports = router;
