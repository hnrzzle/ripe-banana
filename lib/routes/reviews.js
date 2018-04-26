const router = require('express').Router();
const Review = require('../models/Review');
const createEnsureAuth = require('../util/ensure-auth');


const check404 = (reviewer, id) => {
    if(!reviewer) {
        throw {
            status: 404,
            error: `Reviewer id ${id} does not exist`
        };
    }
};

module.exports = router
    .post('/', createEnsureAuth(), (req, res, next) => {
        Review.create(req.body)
            .then(review => res.json(review))
            .catch(next);
    })
    .get('/:id', (req, res, next) => {
        const { id } = req.params;

        Promise.all([
            Review.findById(id)
                .populate({
                    path: 'reviewer',
                    select: 'name'
                })
                .lean()
        ])
            .then(review => {
                check404(review, id);
                res.json(review);
            })
            .catch(next);
    })

    .get('/', (req, res, next) => {
        Review.find(req.query)
            .populate({
                path: 'film',
                select: 'title'
            })
            .lean()
            .select('rating review')
            .limit(100)
            .then(reviews => res.json(reviews))
            .catch(next);
    });