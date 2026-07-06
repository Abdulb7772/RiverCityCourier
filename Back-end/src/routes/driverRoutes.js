const express = require('express');
const {
  listDrivers,
  createDriver,
  getDriver,
  patchDriverVerification,
  deleteDriver,
} = require('../controllers/driverController');

const router = express.Router();

router.get('/', listDrivers);
router.post('/', createDriver);
router.get('/:driverId', getDriver);
router.patch('/:driverId', patchDriverVerification);
router.delete('/:driverId', deleteDriver);

module.exports = router;
