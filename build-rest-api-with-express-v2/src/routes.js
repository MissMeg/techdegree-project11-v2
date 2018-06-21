'use strict';

const mongoose    = require('mongoose');
const express     = require('express');
const router      = express.Router();
const {User}      = require('./models/users');
const {Review}    = require('./models/reviews');
const {Course}    = require('./models/courses');
const {authUser}  = require('./auth');

//////////////////////////////////////////////////////////////
//////////////////////USER PATHS//////////////////////////////
//////////////////////////////////////////////////////////////


//get currently logged in user
router.get('/users', authUser, (req, res) => {
  res.json(req.authUser);
  res.status(200);
});

//create new user
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

//////////////////////////////////////////////////////////////
//////////////////////COURSE PATHS////////////////////////////
//////////////////////////////////////////////////////////////

//get all course ids and titles
router.get('/courses', (req, res, next) => {
  Course.find({}, '_id title', (err, courses) => {
    if (err) {
      err.status = 400;
      return next(err);
    }
    res.status(200);
    res.json(courses);
  });
});

//get all info on a specific course
router.get('/courses/:id', (req, res, next) => {
  Course.findById(req.params.id)
        .populate({ path: 'user', select: 'fullName'})
        .populate({ path: 'reviews', populate: {path: 'user', model: 'User', select: 'fullName'} })
        .exec( (err, course) => {
          if (err) {
            err.status = 400;
            return next(err);
          }
          res.status(200);
          res.json(course);
        });
});

//create a new course
router.post('/courses', authUser, (req, res, next) => {
  Course.create(req.body, (err) => {
    if (err) {
      err.status = 400;
      return next(err);
    }
    res.location('/');
    res.status(201).json();
  });
});

//update a course
router.put('/courses/:id', authUser, (req, res, next) => {
  Course.findByIdAndUpdate(req.params.id, req.body, (err) => {
    if (err) {
      err.status = 400;
      return next(err);
    }
    res.body = req.body;
    res.status(204).json();
  });
});

//////////////////////////////////////////////////////////////
//////////////////////REVIEW PATHS////////////////////////////
//////////////////////////////////////////////////////////////

//create a new review
router.post('/courses/:id/reviews', authUser, (req, res, next) => {
  Review.create(req.body, (err, review) => {
    if (err) {
      err.status = 400;
      return next(err);
    }
    Course.findByIdAndUpdate(req.params.id, {$push: { reviews: review._id}})
          .populate('user')
          .exec( (err, course) => {
            if (err) {
              return next(err);
            }
            res.location('/courses/:id');
            res.status(201).json();
          });
  });
});

module.exports = router;
