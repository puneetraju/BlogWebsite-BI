const express = require('express');
const mongoose = require('mongoose');
const Article = require('./../models/article');
const router = express.Router();

router.get('/new', (req, res) => {
    res.render('articles/new', { article: new Article() });
});

router.get('/edit/:id', async (req, res) => {
    const articleId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(articleId)) {
        return res.status(400).send('Invalid article ID');
    }

    try {
        const article = await Article.findById(articleId);
        if (!article) {
            return res.status(404).send('Article not found');
        }
        res.render('articles/edit', { article: article });
    } catch (e) {
        res.status(500).send('Internal Server Error');
    }
});

router.get('/:slug', async (req, res) => {
    try {
        const article = await Article.findOne({ slug: req.params.slug });
        if (!article) return res.redirect('/');
        res.render('articles/show', { article: article });
    } catch (e) {
        res.status(500).send('Internal Server Error');
    }
});

router.post('/', async (req, res, next) => {
    req.article = new Article();
    next();
}, saveArticle('new'));

router.put('/:id', async (req, res, next) => {
    const articleId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(articleId)) {
        return res.status(400).send('Invalid article ID');
    }

    try {
        req.article = await Article.findById(articleId);
        if (!req.article) {
            return res.status(404).send('Article not found');
        }
        next();
    } catch (e) {
        res.status(500).send('Internal Server Error');
    }
}, saveArticle('edit'));

router.delete('/:id', async (req, res) => {
    const articleId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(articleId)) {
        return res.status(400).send('Invalid article ID');
    }

    try {
        await Article.findByIdAndDelete(articleId);
        res.redirect('/');
    } catch (e) {
        res.status(500).send('Internal Server Error');
    }
});

function saveArticle(path) {
    return async (req, res) => {
        let article = req.article;
        article.title = req.body.title;
        article.description = req.body.description;
        article.markdown = req.body.markdown;

        try {
            article = await article.save();
            res.redirect(`/articles/${article.slug}`);
        } catch (e) {
            res.render(`articles/${path}`, { article: article });
        }
    };
}

module.exports = router;
