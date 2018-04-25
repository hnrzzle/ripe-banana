const mongoose = require('mongoose');
const { Schema } = mongoose;
const { RequiredString } = require('../util/mongoose-helpers');

const schema = new Schema({
    name: RequiredString,
    company: RequiredString,
    email: RequiredString,
    hash: RequiredString
});

module.exports = mongoose.model('Reviewer', schema);