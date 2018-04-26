const { assert } = require('chai');
const request = require('./request');
const { dropCollection } = require('./db');

describe('Auth api', () => {

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

    it('throws 400 on same email signup', () => {
        return request
            .post('/auth/signup')
            .send({
                name: 'fakejoe',
                company: 'joe2.com',
                email: 'joe@joe.com',
                password: 'abc'
            })
            .then(res => {
                assert.equal(res.status, 400);
                assert.equal(res.body.error, 'Email already exists');
            });
    });

    it('throws 401 on not signed up email', () => {
        return request
            .post('/auth/signin')
            .send({
                email: 'joe@joe.com',
                password: 'hackingin'
            })
            .then(res => {
                assert.equal(res.status, 401);
                assert.equal(res.body.error, 'Invalid email or password');
            });
    });

});