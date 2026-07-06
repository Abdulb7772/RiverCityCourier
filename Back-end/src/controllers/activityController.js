const activityModel = require('../models/activityModel');

async function listActivities(req, res) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 10));
    const result = await activityModel.listActivities(page, limit);
    return res.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to fetch activity log.';
    console.error('listActivities error:', error);
    return res.status(500).json({ error: message });
  }
}

module.exports = {
  listActivities,
};
