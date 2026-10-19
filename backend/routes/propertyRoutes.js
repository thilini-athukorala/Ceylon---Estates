const express = require('express');
const mongoose = require('mongoose');
const Property = require('../models/Property');
const { protect, allowRoles } = require('../middleware/authMiddleware');
const router = express.Router();

const safeSearch = value => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const editable = ['title','description','price','location','propertyType','listingType','bedrooms','bathrooms','image','images','area','land','parking','amenities','furnished','status'];
const pickFields = input => Object.fromEntries(editable.filter(key => Object.prototype.hasOwnProperty.call(input || {}, key)).map(key => [key, input[key]]));
const validId = (req, res) => {
  if (mongoose.isValidObjectId(req.params.id)) return true;
  res.status(400).json({ message: 'Invalid property ID' });
  return false;
};
// Include legacy properties (which predate approvalStatus) in public search.
// Newly created properties are ALWAYS Pending and are hidden until approved.
const visibleFilter = { $or: [{ approvalStatus: 'Approved' }, { approvalStatus: { $exists: false } }] };

router.get('/test', (_, res) => res.json({ success: true, message: 'Property API is working!' }));

// IMPORTANT: specific routes must be placed before /:id.
router.get('/mine', protect, allowRoles('OWNER'), async (req, res) => {
  try {
    const records = await Property.find({ owner: req.user._id }).sort({ createdAt: -1 });
    res.json(records);
  } catch (err) { res.status(500).json({ message: 'Failed to load your properties' }); }
});

router.get('/admin/all', protect, allowRoles('ADMIN'), async (req, res) => {
  try {
    const records = await Property.find().populate('owner', 'name email').sort({ createdAt: -1 });
    res.json(records);
  } catch (err) { res.status(500).json({ message: 'Failed to load properties' }); }
});

router.patch('/:id/approval', protect, allowRoles('ADMIN'), async (req, res) => {
  try {
    if (!validId(req, res)) return;
    const { approvalStatus } = req.body;
    if (!['Approved','Rejected'].includes(approvalStatus)) return res.status(400).json({ message: 'Invalid approval status' });
    const record = await Property.findByIdAndUpdate(req.params.id, {
      approvalStatus, reviewedBy: req.user._id, reviewedAt: new Date()
    }, { new: true, runValidators: true });
    if (!record) return res.status(404).json({ message: 'Property not found' });
    res.json(record);
  } catch (err) { res.status(500).json({ message: 'Could not update approval' }); }
});

router.get('/', async (req, res) => {
  try {
    const { search, location, propertyType, listingType, minPrice, maxPrice, bedrooms, bathrooms, sort } = req.query;
    const filter = { ...visibleFilter };
    if (search) {
      const keyword = safeSearch(search);
      filter.$and = [{ $or: [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } },
        { location: { $regex: keyword, $options: 'i' } }
      ] }];
    }
    if (location) filter.location = { $regex: safeSearch(location), $options: 'i' };
    if (propertyType) filter.propertyType = propertyType;
    if (listingType) filter.listingType = listingType;
    if (minPrice !== undefined && minPrice !== '') {
      const v = Number(minPrice); if (!Number.isFinite(v) || v < 0) return res.status(400).json({ message: 'Invalid minimum price' });
      filter.price = { ...filter.price, $gte: v };
    }
    if (maxPrice !== undefined && maxPrice !== '') {
      const v = Number(maxPrice); if (!Number.isFinite(v) || v < 0) return res.status(400).json({ message: 'Invalid maximum price' });
      filter.price = { ...filter.price, $lte: v };
    }
    for (const field of ['bedrooms', 'bathrooms']) {
      if (req.query[field] !== undefined && req.query[field] !== '') {
        const v = Number(req.query[field]);
        if (!Number.isInteger(v) || v < 0) return res.status(400).json({ message: `Invalid ${field}` });
        filter[field] = { $gte: v };
      }
    }
    const sorting = { newest: { createdAt: -1 }, oldest: { createdAt: 1 }, priceLow: { price: 1 }, priceHigh: { price: -1 } };
    res.json(await Property.find(filter).sort(sorting[sort] || sorting.newest));
  } catch (err) { console.error(err); res.status(500).json({ message: 'Failed to fetch properties' }); }
});

router.get('/:id', async (req, res) => {
  try {
    if (!validId(req, res)) return;
    const record = await Property.findOne({ _id: req.params.id, ...visibleFilter });
    if (!record) return res.status(404).json({ message: 'Property not found or not published' });
    res.json(record);
  } catch (err) { res.status(500).json({ message: 'Failed to fetch property' }); }
});

router.post('/', protect, allowRoles('OWNER'), async (req, res) => {
  try {
    const property = await Property.create({ ...pickFields(req.body), owner: req.user._id, approvalStatus: 'Pending' });
    res.status(201).json(property);
  } catch (err) { res.status(400).json({ message: 'Failed to create property', error: err.message }); }
});

router.put('/:id', protect, allowRoles('OWNER', 'ADMIN'), async (req, res) => {
  try {
    if (!validId(req, res)) return;
    const record = await Property.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Property not found' });
    if (req.user.role !== 'ADMIN' && String(record.owner) !== String(req.user._id)) return res.status(403).json({ message: 'Not your property' });
    Object.assign(record, pickFields(req.body));
    if (req.user.role === 'OWNER') { record.approvalStatus = 'Pending'; record.reviewedAt = null; record.reviewedBy = null; }
    await record.save();
    res.json(record);
  } catch (err) { res.status(400).json({ message: 'Failed to update property', error: err.message }); }
});

router.delete('/:id', protect, allowRoles('OWNER', 'ADMIN'), async (req, res) => {
  try {
    if (!validId(req, res)) return;
    const record = await Property.findById(req.params.id);
    if (!record) return res.status(404).json({ message: 'Property not found' });
    if (req.user.role !== 'ADMIN' && String(record.owner) !== String(req.user._id)) return res.status(403).json({ message: 'Not your property' });
    await record.deleteOne();
    res.json({ message: 'Property deleted successfully' });
  } catch (err) { res.status(500).json({ message: 'Failed to delete property' }); }
});

module.exports = router;
