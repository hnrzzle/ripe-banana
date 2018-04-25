const { assert } = require('chai');
const Reviewer = require('../../lib/models/Reviewer');
const { getErrors } = require('./helpers');

describe('Reviewer Model', () => {

    it('Valid good model', () => {
        const data = {
            name: 'Angry Donald',
            company: 'angrydonald.com'
        };
        const don = new Reviewer(data);
        data._id = don._id;

        assert.deepEqual(don.toJSON(), data);
    });

    it('required fields', () => {
        const reviewer = new Reviewer({});
        const errors = getErrors(reviewer.validateSync(), 4);
        assert.equal(errors.name.kind, 'required');
        assert.equal(errors.company.kind, 'required');
        assert.equal(errors.email.kind, 'required');
        assert.equal(errors.hash.kind, 'required');
    });

});