const express = require("express");
const router = express.Router();
const watchlistController = require("../controllers/watchlist-controller");
const authMiddleware = require("../middleware/auth-middleware");

router.get("/", authMiddleware.isLoggedIn, watchlistController.showWatchList);
router.post(
  "/add/:movieId",
  authMiddleware.isLoggedIn,
  watchlistController.addToWatchList,
);
router.post(
  "/delete/:id",
  authMiddleware.isLoggedIn,
  watchlistController.deleteFromWatchlist,
);
router.post(
  "/watched/:id",
  authMiddleware.isLoggedIn,
  watchlistController.markAsWatched,
);
module.exports = router;
