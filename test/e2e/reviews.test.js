const { assert } = require('chai');
const request = require('./request');
const { dropCollection } = require('./db');
const { verify } = require('../../lib/util/token-service');

describe('Review e2e', () => {

    before(() => dropCollection('films'));
    before(() => dropCollection('reviewers'));
    before(() => dropCollection('reviews'));
    before(() => dropCollection('studios'));
    before(() => dropCollection('actors'));
    before(() => dropCollection('films'));

    let token = '';

    const checkOk = res => {
        if(!res.ok) throw res.error;
        return res;
    };

    let studio1 = {
        name: 'Miramax',
        address: {
            city: 'Hollywood',
            state: 'CA',
            country: 'USA'
        }
    };

    let actor1 = {
        name: 'Brad Pitt',
        dob: '1963-12-18',
        pob: 'Shawnee, OK'
    };


    before(() => {
        return request.post('/studios')
            .send(studio1)
            .then(({ body }) => {
                studio1 = body;
            });
    });

    before(() => {
        return request.post('/actors')
            .send(actor1)
            .then(({ body }) => {
                actor1 = body;
            });
    });

    let film1 = {
        title: 'Brad Pitt movie',
        studio: {},
        released: 2000,
        cast: [{
            part: 'Cool guy',
            actor: {}
        }]
    };

    let donald = {
        name: 'Angry Donald',
        company: 'angrydonald.com',
        email: 'don@don.com',
        password: '123'
    };

    before(() => {
        film1.studio._id = studio1._id;
        film1.studio.name = studio1.name;
        film1.cast[0].actor._id = actor1._id;
        return request.post('/films')
            .send(film1)
            .then(({ body }) => {
                film1 = body;
            });
    });

    before(() => {
        return request.post('/auth/signup')
            .send(donald)
            .then(({ body }) => {
                token = body.token;
                donald._id = verify(body.token).id;

            });
    });

    let review1 = {
        rating: 4,
        reviewer: null,
        review: 'This movie is pretty good',
        film: null
    };


    it('saves a review', () => {
        review1.reviewer = donald._id;
        review1.film = film1._id;

        return request.post('/reviews')
            .set('Authorization', token)
            .send(review1)
            .then(({ body }) => {
                const { _id, __v, film, createdAt, updatedAt } = body;
                assert.ok(_id);
                assert.ok(film);
                assert.equal(__v, 0);
                assert.ok(createdAt);
                assert.ok(updatedAt);
                assert.deepEqual(body, { _id, __v, film, createdAt, updatedAt, ...review1 });
                review1 = body;
            });
    });

    it('gets a review', () => {
        return request.get(`/reviews/${review1._id}`)
            .then(({ body }) => {
                assert.deepEqual(body, [{
                    ...review1,
                    reviewer: {
                        _id: donald._id,
                        name: donald.name
                    }
                }]);
            });
    });

    const getFields = ({ _id, rating, review }) => {
        return { 
            _id, rating, review, 
            film : { _id: film1._id, title: film1.title }
        };
    };

    it('gets all reviews, only id, rating, review, film', () => {
        return request.get('/reviews')
            .then(checkOk)
            .then(({ body }) => {
                assert.deepEqual(body, [review1].map(getFields));
            });
    });

});