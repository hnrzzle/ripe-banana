const router = require('express').Router();
const { respond } = require('./route-helpers');
const Reviewer = require('../models/Reviewer');
const { sign } = require('../util/token-service');


module.exports = router

    .post('/signup', respond(
        ({ body }) => {
            const { email, password } = body;
            delete body.password;

            return Reviewer.exists({ email })
                .then(exists => {
                    if(exists) {
                        throw {
                            status: 400,
                            error: 'Email exists'
                        };
                    }

                    const reviewer = new Reviewer(body);
                    reviewer.generateHash(password);
                    return reviewer.save();
                })
                .then(reviewer => {
                    return { token: sign(reviewer) };
                });
        }
    ))