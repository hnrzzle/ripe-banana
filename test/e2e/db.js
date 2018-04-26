require('dotenv').config({ path: './test/e2e/.env' });
const connect = require('../../lib/util/connect');
const mongoose = require('mongoose');
const request = require('./request');

before(() => connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/ripe-bananas'));    
after(() => mongoose.connection.close());

module.exports = {
    dropCollection(name) {
        return mongoose.connection.dropCollection(name)
            .catch(err => {
                if(err.codeName !== 'NamespaceNotFound') throw err;
            });
    },

    createToken(data = {
        name: 'joe',
        company: 'joe.com',
        email: 'joe@joe.com',
        password: 'abc'
    }) {
        return request
            .post('/auth/signup')
            .send(data)
            .then(res => res.body.token);
    }
};