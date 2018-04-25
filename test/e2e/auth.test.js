const { assert } = require('chai');
const request = require('./request');
const { dropCollection } = require('./db');

describe.only('Auth api', () => {

    beforeEach(() => dropCollection('reviewers'));

    let token = null;

    beforeEach(() => {
        return request
            .post('/auth/signup')
            .send({
                name: 'joe',
                company: 'joe.com',
                email: 'joe@joe.com',
                password: 'abc'
            })
            .then(({ body }) => token = body.token);

    });

    it('signup', () => {
        assert.ok(token);
    });

    it('verifies', () => {
        return request
            .get('/auth/verify')
            .set('Authorization', token)
            .then(({ body }) => {
                assert.ok(body.verified);
            });
    });

    it('signin', () => {
        return request
            .post('/auth/signin')
            .send({
                email: 'joe@joe.com',
                password: 'abc'
            })
            .then(({ body }) => {
                assert.ok(body.token);
            });
    });




})