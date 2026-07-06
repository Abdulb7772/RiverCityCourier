const {
  getLocationsByEmail,
  createLocation,
  updateLocation,
  deleteLocation,
  formatLocation,
} = require('../models/savedLocationModel');
const { ObjectId } = require('mongodb');

async function listLocations(req, res) {
  try {
    const { email } = req.query;
    if (!email) return res.status(400).json({ error: 'Email query parameter is required.' });

    const locations = await getLocationsByEmail(email);
    return res.json(locations.map(formatLocation));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch locations.';
    return res.status(500).json({ error: message });
  }
}

async function addLocation(req, res) {
  try {
    const { locationName, address, customerEmail } = req.body || {};
    if (!locationName || !address || !customerEmail) {
      return res.status(400).json({ error: 'locationName, address, and customerEmail are required.' });
    }

    const created = await createLocation({ locationName, address, customerEmail });
    return res.status(201).json(formatLocation(created));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to create location.';
    return res.status(500).json({ error: message });
  }
}

async function patchLocation(req, res) {
  try {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid location ID.' });

    const { locationName, address } = req.body || {};
    if (!locationName && !address) {
      return res.status(400).json({ error: 'At least one of locationName or address is required.' });
    }

    const updated = await updateLocation(id, { locationName, address });
    if (!updated) return res.status(404).json({ error: 'Location not found.' });

    return res.json(formatLocation(updated));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update location.';
    return res.status(500).json({ error: message });
  }
}

async function removeLocation(req, res) {
  try {
    const { id } = req.params;
    if (!id || !ObjectId.isValid(id)) return res.status(400).json({ error: 'Invalid location ID.' });

    const deleted = await deleteLocation(id);
    if (!deleted) return res.status(404).json({ error: 'Location not found.' });

    return res.json({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to delete location.';
    return res.status(500).json({ error: message });
  }
}

module.exports = {
  listLocations,
  addLocation,
  patchLocation,
  removeLocation,
};
