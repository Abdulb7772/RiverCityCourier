const { getDatabase } = require('../config/db');
const { ObjectId } = require('mongodb');

async function getReviewsCollection() {
  const db = await getDatabase();
  return db.collection('reviews');
}

async function getAllReviews() {
  const collection = await getReviewsCollection();
  return collection.find({}).sort({ createdAt: -1 }).toArray();
}

async function getReviewById(reviewId) {
  const collection = await getReviewsCollection();
  return collection.findOne({ _id: new ObjectId(reviewId) });
}

async function replyToReview(reviewId, replyText) {
  const collection = await getReviewsCollection();
  const result = await collection.findOneAndUpdate(
    { _id: new ObjectId(reviewId) },
    { $set: { reply: replyText, repliedAt: new Date().toISOString() } },
    { returnDocument: 'after' },
  );
  return result.value;
}

function formatReview(doc) {
  if (!doc) return null;
  return {
    id: doc._id.toString(),
    customerName: doc.customerName,
    customerEmail: doc.customerEmail,
    orderId: doc.orderId,
    rating: doc.rating,
    title: doc.title,
    comment: doc.comment,
    reply: doc.reply,
    createdAt: doc.createdAt,
    repliedAt: doc.repliedAt,
  };
}

module.exports = {
  getAllReviews,
  getReviewById,
  replyToReview,
  formatReview,
};
