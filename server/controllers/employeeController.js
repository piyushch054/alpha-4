const Employee = require('../models/Employee');

const { can } = require('../config/rbac');
const checkAdmin = (req) => can(req.user, 'manage_hr');

exports.getAll = async (req, res, next) => {
  try { const data = await Employee.find(req.query); res.json({ success: true, data }); }
  catch (err) { next(err); }
};
exports.getById = async (req, res, next) => {
  try { 
      const data = await Employee.findById(req.params.id); 
      if(!data) return res.status(404).json({ success: false, message: 'Not found' });
      res.json({ success: true, data }); 
  }
  catch (err) { next(err); }
};
exports.create = async (req, res, next) => {
  if (!checkAdmin(req)) return res.status(403).json({ success: false, message: 'Forbidden' });
  try { const data = new Employee(req.body); await data.save(); res.status(201).json({ success: true, data }); }
  catch (err) { next(err); }
};
exports.update = async (req, res, next) => {
  if (!checkAdmin(req)) return res.status(403).json({ success: false, message: 'Forbidden' });
  try { const data = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); res.json({ success: true, data }); }
  catch (err) { next(err); }
};
exports.delete = async (req, res, next) => {
  if (!checkAdmin(req)) return res.status(403).json({ success: false, message: 'Forbidden' });
  try { await Employee.findByIdAndDelete(req.params.id); res.json({ success: true, message: 'Deleted' }); }
  catch (err) { next(err); }
};