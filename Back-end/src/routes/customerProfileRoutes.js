const express = require('express');
const { getProfile, patchProfile } = require('../controllers/profileController');

const router = express.Router();

router.get('/', getProfile);
router.patch('/', patchProfile);

module.exports = router;
