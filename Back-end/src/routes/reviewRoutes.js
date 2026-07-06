const express = require('express');
const {
  listReviews,
  getReview,
  patchReviewReply,
} = require('../controllers/reviewController');

const router = express.Router();

router.get('/', listReviews);
router.get('/:reviewId', getReview);
router.patch('/:reviewId', patchReviewReply);

module.exports = router;
