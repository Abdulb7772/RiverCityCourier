const { ObjectId } = require('mongodb');
const { getAllReviews, getReviewById, replyToReview, formatReview } = require('../models/reviewModel');
const { insertActivity } = require('../models/activityModel');

async function listReviews(req, res) {
  try {
    const reviews = await getAllReviews();
    return res.json(reviews.map(formatReview));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch reviews.';
    return res.status(500).json({ error: message });
  }
}

async function getReview(req, res) {
  try {
    const { reviewId } = req.params;

    if (!reviewId || !ObjectId.isValid(reviewId)) {
      return res.status(400).json({ error: 'Invalid review ID.' });
    }

    const review = await getReviewById(reviewId);

    if (!review) {
      return res.status(404).json({ error: 'Review not found.' });
    }

    return res.json(formatReview(review));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch review.';
    return res.status(500).json({ error: message });
  }
}

async function patchReviewReply(req, res) {
  try {
    const { reviewId } = req.params;
    const { reply } = req.body || {};

    if (!reviewId || !ObjectId.isValid(reviewId)) {
      return res.status(400).json({ error: 'Invalid review ID.' });
    }

    if (!reply || typeof reply !== 'string' || reply.trim().length === 0) {
      return res.status(400).json({ error: 'Reply text is required.' });
    }

    const updated = await replyToReview(reviewId, reply.trim());

    if (!updated) {
      return res.status(404).json({ error: 'Review not found.' });
    }

    insertActivity({
      type: 'update',
      description: `Replied to review #${reviewId}`,
      user: 'Admin',
      location: '',
      duration: '',
    }).catch(() => {});

    return res.json(formatReview(updated));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to reply to review.';
    return res.status(500).json({ error: message });
  }
}

module.exports = {
  listReviews,
  getReview,
  patchReviewReply,
};
