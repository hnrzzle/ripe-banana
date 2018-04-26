const router = require('express').Router();
const Film = require('../models/Film');
const Review = require('../models/Review');
const ensureRole = require('../util/ensure-role');
const createEnsureAuth = require('../util/ensure-auth');

const check404 = (actor, id) => {
    if(!actor) {
        throw {
            status: 404,
            error: `Actor id ${id} does not exist`
        };
    }
};

module.exports = router

    .post('/', (req, res, next) => {
        Film.create(req.body)
            .then(film => res.json(film))
            .catch(next);
    })

    .get('/', (req, res, next) => {
        Film.find(req.query)
            .lean()
            .select('title released studio')
            .populate({
                path: 'studio',
                select: 'name'
            })
            .then(films => res.json(films))
            .catch(next);
    })

    .get('/:id', (req, res, next) => {
        const { id } = req.params;
        
        Promise.all([
            Film.findById(id)
                .populate({
                    path: 'studio',
                    select: 'name'
                })
                .populate({
                    path: 'cast.actor',
                    select: 'name'
                })
                .lean(),

            Review.find({ film: id })
                .lean()
                .select('rating review')
                .populate({
                    path: 'reviewer',
                    select: 'name'
                })
        ])
            .then(([film, reviews]) => {
                check404(film, id);
                film.reviews = reviews;
                res.json(film);
            })
            .catch(next);
    })

    .delete('/:id', createEnsureAuth(), ensureRole('Admin'), (req, res, next) => {
        Film.findByIdAndRemove(req.params.id)
            .then(removed => res.json({ removed }))
            .catch(next);
    });