const express = require('express');
const router = express.Router();
const watchlistController = require('../controllers/watchlist-controller');

router.get('/', watchlistController.showWatchList);
router.post('/add/:movieId', watchlistController.addToWatchList);
router.post('/delete/:id', watchlistController.deleteFromWatchlist);
module.exports = router;