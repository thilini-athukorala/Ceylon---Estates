const express = require('express');
const mongoose = require('mongoose');
const Inquiry = require('../models/Inquiry');
const Property = require('../models/Property');
const { protect, allowRoles } = require('../middleware/authMiddleware');
const router = express.Router();
router.use(protect);

// Customer submits an inquiry or viewing request for an approved property.
router.post('/', allowRoles('CUSTOMER'), async (req, res) => {
  try {
    const { propertyId, message, kind = 'INQUIRY', viewingDate = '', viewingTime = '' } = req.body;
    if (!mongoose.isValidObjectId(propertyId)) return res.status(400).json({ message: 'Invalid property ID' });
    if (typeof message !== 'string' || !message.trim() || message.trim().length > 2000)
      return res.status(400).json({ message: 'Message must be 1–2000 characters' });
    if (!['INQUIRY', 'VIEWING'].includes(kind)) return res.status(400).json({ message: 'Invalid request type' });
    if (kind === 'VIEWING' && (!/^\d{4}-\d{2}-\d{2}$/.test(viewingDate) || !/^\d{2}:\d{2}$/.test(viewingTime)))
      return res.status(400).json({ message: 'Viewing date and time are required' });
    if (kind === 'VIEWING' && viewingDate < new Date().toISOString().slice(0, 10))
      return res.status(400).json({ message: 'Choose a future viewing date' });
    const property = await Property.findById(propertyId).select('owner approvalStatus');
    if (!property || property.approvalStatus !== 'Approved') return res.status(404).json({ message: 'Property is not available for inquiries' });
    if (!property.owner) return res.status(400).json({ message: 'This older listing has no assigned owner. Contact the administrator.' });
    const inquiry = await Inquiry.create({ property: property._id, owner: property.owner, customer: req.user._id, message: message.trim(), kind, viewingDate: kind === 'VIEWING' ? viewingDate : '', viewingTime: kind === 'VIEWING' ? viewingTime : '' });
    return res.status(201).json({ message: 'Request sent successfully', inquiry });
  } catch (error) { console.error('Create inquiry:', error); return res.status(500).json({ message: 'Unable to send request' }); }
});
router.get('/mine', allowRoles('CUSTOMER'), async (req, res) => {
  try { return res.json(await Inquiry.find({ customer: req.user._id }).populate('property','title location').sort({ createdAt: -1 })); }
  catch (e) { return res.status(500).json({ message: 'Unable to load inquiries' }); }
});
router.get('/received', allowRoles('OWNER'), async (req, res) => {
  try { return res.json(await Inquiry.find({ owner: req.user._id }).populate('property','title location').populate('customer','name email').sort({ createdAt: -1 })); }
  catch (e) { return res.status(500).json({ message: 'Unable to load received inquiries' }); }
});
router.patch('/:id/reply', allowRoles('OWNER'), async (req, res) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) return res.status(400).json({ message: 'Invalid inquiry ID' });
    const { reply } = req.body;
    if (typeof reply !== 'string' || !reply.trim() || reply.trim().length > 2000) return res.status(400).json({ message: 'Reply must be 1–2000 characters' });
    const inquiry = await Inquiry.findOneAndUpdate({ _id: req.params.id, owner: req.user._id }, { reply: reply.trim(), repliedAt: new Date() }, { new: true });
    if (!inquiry) return res.status(404).json({ message: 'Inquiry not found for your account' });
    return res.json(inquiry);
  } catch (e) { return res.status(500).json({ message: 'Unable to save reply' }); }
});
module.exports = router;
