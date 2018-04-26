const { assert } = require('chai');
const request = require('./request');
const { dropCollection } = require('./db');
const { verify } = require('../../lib/util/token-service');

describe('Reviewer e2e', () => {

    before(() => dropCollection('reviewers'));
    before(() => dropCollection('studios'));
    before(() => dropCollection('actors'));
    before(() => dropCollection('films'));

    let token = '';

    const checkOk = res => {
        if(!res.ok) throw res.error;
        return res;
    };

    let donald = {
        name: 'Angry Donald',
        company: 'angrydonald.com',
        email: 'don@don.com',
        password: '123'
    };


    let jeff = {
        name: 'Angry Jeff',
        company: 'angryjeff.com',
        email: 'jeff@jeff.com',
        password: '123'
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

    let review1 = {
        rating: 4,
        reviewer: {},
        review: 'sweet film',
        film: {}
    };

    let film1 = {
        title: 'Brad Pitt movie',
        studio: {},
        released: 2000,
        cast: [{
            part: 'Cool guy',
            actor: {}
        }]
    };

    before(() => {
        return request.post('/auth/signup')
            .send(jeff)
            .then(({ body }) => {
                token = body.token;
                jeff._id = verify(body.token).id;
            });
    });

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

    before(() => {
        film1.studio._id = studio1._id;
        film1.studio.name = studio1.name;
        film1.cast[0].actor._id = actor1._id;
        return request.post('/films')
            .send(film1)
            .then(checkOk)
            .then(({ body }) => {
                film1 = body;
            });
    });



    before(() => {
        review1.reviewer = jeff._id;
        review1.film = film1._id;

        return request.post('/reviews')
            .set('Authorization', token)
            .send(review1)
            .then(({ body }) => {
                review1 = body;
            });
    });

    it('saves a reviewer', () => {
        return request.post('/auth/signup')
            .send(donald)
            .then(({ body }) => {
                return verify(body.token).id;
            })
            .then(id => {
                return request.get(`/reviewers/${id}`);
            })
            .then(({ body }) => {
                delete donald.password;
                delete donald.email;
                const { _id } = body;
                assert.ok(_id);
                assert.deepEqual(body, { _id, reviews: [], ...donald }),
                donald = body;
            
            });
    });

    it('gets reviewer by id and returns reviews', () => {
        return request.get(`/reviewers/${jeff._id}`)
            .then(({ body }) => {
                assert.deepEqual(body, {
                    _id: jeff._id,
                    name: jeff.name,
                    company: jeff.company,
                    reviews: [{
                        _id: review1._id,
                        rating: review1.rating,
                        review: review1.review,
                        film: {
                            _id: film1._id,
                            title: film1.title
                        }
                    }]
                });
            });


    });


    const getFields = ({ _id, name, company }) => ({ _id, name, company });

    it('gets all reviewers', () => {
        return request.get('/reviewers')
            .then(({ body }) => {
                assert.deepEqual(body, [jeff, donald].map(getFields));
            });
    });

});