const express = require('express');
const {
  listLocations,
  addLocation,
  patchLocation,
  removeLocation,
} = require('../controllers/savedLocationController');

const router = express.Router();

router.get('/', listLocations);
router.post('/', addLocation);
router.patch('/:id', patchLocation);
router.delete('/:id', removeLocation);

module.exports = router;
