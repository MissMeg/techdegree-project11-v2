'use strict';

const mongoose = require('mongoose');

//review model
const Review = mongoose.model('Review', {
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    postedOn: {
        type: Date,
        default: Date.now()
    },
    rating: {
        type: Number,
        min: [1, 'Minimum Value is 1'],
        max: [5, 'Maximum Value is 5'],
        required: [true, 'Rating required (between 1 and 5)!']
    },
    review: String,
});

module.exports = {Review};
