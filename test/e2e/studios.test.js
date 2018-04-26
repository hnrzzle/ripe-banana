const { assert } = require('chai');
const request = require('./request');
const { dropCollection } = require('./db');
const { verify } = require('../../lib/util/token-service');

describe.only('Studio API', () => {

    before(() => dropCollection('reviewers'));
    before(() => dropCollection('studios'));

    let token = '';

    let studio1 = {
        name: 'Miramax',
        address: {
            city: 'Hollywood',
            state: 'CA',
            country: 'USA'
        }
    };

    let studio2 = {
        name: 'Werner Herzog Filmproduktion',
        address: {
            city: 'Munich',
            state: 'Bavaria',
            country: 'Germany'
        }
    };

    let actor1 = {
        name: 'Brad Pitt',
        dob: '1963-12-18',
        pob: 'Shawnee, OK'
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

    let reviewer1 = {
        name: 'IGN',
        company: 'IGN',
        email: 'ign@ign.com',
        password: '123',
        roles: ['Admin']
    };

    before(() => {
        return request.post('/auth/signup')
            .send(reviewer1)
            .then(({ body }) => {
                token = body.token;
                const id = verify(body.token).id;
                reviewer1._id = id;
            });
    });

    before(() => {
        return request.post('/actors')
            .send(actor1)
            .then(({ body }) => {
                actor1 = body;
            });
    });


    const checkOk = res => {
        if(!res.ok) throw res.error;
        return res;
    };

    it('POST - saves a studio', () => {
        return request.post('/studios')
            .send(studio1)
            .then(checkOk)
            .then(({ body }) => {
                const { _id, __v } = body;
                assert.ok(_id);
                assert.equal(__v, 0);
                assert.deepEqual(body, { ...studio1, _id, __v });
                studio1 = body;
            });
    });

    const getFields = ({ _id, name }) => ({ _id, name });
    
    it('GET - all studios -return only Name & ID', () => {
        return request.post('/studios')
            .send(studio2)
            .then(checkOk)
            .then(({ body }) => {
                studio2 = body;
            })
            .then(() => {
                return request.get('/studios')
                    .then(checkOk)
                    .then(({ body }) => {
                        assert.deepEqual(body, [studio1, studio2].map(getFields));
                    });

            });
    });

    it('GET by id', () => {
        film1.studio._id = studio1._id;
        film1.studio.name = studio1.name;
        film1.cast[0].actor._id = actor1._id;
        return request.post('/films')
            .send(film1)
            .then(checkOk)
            .then(({ body }) => {
                film1 = body;
            })
            .then(() => {
                return request.get(`/studios/${studio1._id}`)
                    .then(({ body }) => {
                        assert.deepEqual(body, { ...studio1,
                            films: [{
                                _id: film1._id,
                                title: film1.title
                            }]
                        });
                    });
            });
    });

    it('DELETE by id false if films exist in studio', () => {
        return request.delete(`/studios/${studio1._id}`)
            .set('Authorization', token)
            .then(({ body }) => {
                assert.deepEqual(body, { removed: false });
            });
    });

    it('returns true on delete of studio if no films', () => {
        return request.delete(`/studios/${studio2._id}`)
            .set('Authorization', token)
            .then(() => {
                return request.get(`/studios/${studio2._id}`); 
            })
            .then(res => {
                assert.equal(res.status, 404);
            });
    });
});