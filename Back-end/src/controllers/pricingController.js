const { getPricing, updatePricing, formatPricing } = require('../models/pricingModel');

async function getPricingConfig(req, res) {
  try {
    const pricing = await getPricing();
    return res.json(formatPricing(pricing));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to fetch pricing configuration.';
    return res.status(500).json({ error: message });
  }
}

async function patchPricingConfig(req, res) {
  try {
    const updateData = req.body || {};

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ error: 'No pricing fields provided for update.' });
    }

    const allowedFields = ['perKmPrice', 'vehicleCharges', 'discounts', 'peakHours'];
    const invalidFields = Object.keys(updateData).filter(
      (key) => !allowedFields.includes(key),
    );

    if (invalidFields.length > 0) {
      return res.status(400).json({
        error: `Invalid pricing fields: ${invalidFields.join(', ')}. Allowed: ${allowedFields.join(', ')}`,
      });
    }

    if (updateData.perKmPrice !== undefined && (typeof updateData.perKmPrice !== 'number' || updateData.perKmPrice < 0)) {
      return res.status(400).json({ error: 'Per km price must be a non-negative number.' });
    }

    if (updateData.vehicleCharges !== undefined) {
      if (!Array.isArray(updateData.vehicleCharges)) {
        return res.status(400).json({ error: 'Vehicle charges must be an array.' });
      }
      for (const charge of updateData.vehicleCharges) {
        if (!charge.type || typeof charge.baseRate !== 'number' || typeof charge.perKmRate !== 'number') {
          return res.status(400).json({
            error: 'Each vehicle charge must have type (string), baseRate (number), and perKmRate (number).',
          });
        }
      }
    }

    if (updateData.discounts !== undefined) {
      if (!Array.isArray(updateData.discounts)) {
        return res.status(400).json({ error: 'Discounts must be an array.' });
      }
      for (const discount of updateData.discounts) {
        if (!discount.name || !discount.type || typeof discount.value !== 'number') {
          return res.status(400).json({
            error: 'Each discount must have name (string), type (string), and value (number).',
          });
        }
      }
    }

    if (updateData.peakHours !== undefined) {
      if (typeof updateData.peakHours !== 'object' || typeof updateData.peakHours.enabled !== 'boolean') {
        return res.status(400).json({ error: 'Peak hours config must have an enabled (boolean) field.' });
      }
    }

    const updated = await updatePricing(updateData);

    if (!updated) {
      return res.status(500).json({ error: 'Failed to update pricing configuration.' });
    }

    return res.json(formatPricing(updated));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to update pricing configuration.';
    return res.status(500).json({ error: message });
  }
}

module.exports = {
  getPricingConfig,
  patchPricingConfig,
};
