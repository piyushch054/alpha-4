const fs = require('fs');
const path = require('path');

const controllersDir = path.join(__dirname, 'server', 'controllers');

// taskController.js
let taskContent = `
const Task = require('../models/Task');

const checkOwnership = (resource, req) => {
    if (['admin', 'super_admin'].includes(req.user.role)) return true;
    return resource.creator && resource.creator.toString() === req.user.id;
};

exports.getAll = async (req, res, next) => {
  try { 
      // If not admin, only see own tasks
      const query = ['admin', 'super_admin'].includes(req.user.role) ? req.query : { ...req.query, creator: req.user.id };
      const data = await Task.find(query).populate('assignee creator'); 
      res.json({ success: true, data }); 
  }
  catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try { 
      const data = await Task.findById(req.params.id).populate('assignee creator');
      if (!data) return res.status(404).json({ success: false, message: 'Not found' });
      if (!checkOwnership(data, req)) return res.status(403).json({ success: false, message: 'Forbidden' });
      res.json({ success: true, data }); 
  }
  catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try { 
      const taskData = { ...req.body, creator: req.user.id };
      const data = new Task(taskData); 
      await data.save(); 
      res.status(201).json({ success: true, data }); 
  }
  catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try { 
      let data = await Task.findById(req.params.id);
      if (!data) return res.status(404).json({ success: false, message: 'Not found' });
      if (!checkOwnership(data, req)) return res.status(403).json({ success: false, message: 'Forbidden' });

      data = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); 
      res.json({ success: true, data }); 
  }
  catch (err) { next(err); }
};

exports.delete = async (req, res, next) => {
  try { 
      const data = await Task.findById(req.params.id);
      if (!data) return res.status(404).json({ success: false, message: 'Not found' });
      if (!checkOwnership(data, req)) return res.status(403).json({ success: false, message: 'Forbidden' });

      await Task.findByIdAndDelete(req.params.id); 
      res.json({ success: true, message: 'Deleted' }); 
  }
  catch (err) { next(err); }
};
`;
fs.writeFileSync(path.join(controllersDir, 'taskController.js'), taskContent.trim());

// kycController.js
let kycContent = `
const KYC = require('../models/KYC');

const checkOwnership = (resource, req) => {
    if (['admin', 'super_admin'].includes(req.user.role)) return true;
    return resource.user && resource.user.toString() === req.user.id;
};

exports.getAll = async (req, res, next) => {
  try { 
      const query = ['admin', 'super_admin'].includes(req.user.role) ? req.query : { ...req.query, user: req.user.id };
      const data = await KYC.find(query).populate('user'); 
      res.json({ success: true, data }); 
  }
  catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
  try { 
      const data = await KYC.findById(req.params.id).populate('user'); 
      if (!data) return res.status(404).json({ success: false, message: 'Not found' });
      if (!checkOwnership(data, req)) return res.status(403).json({ success: false, message: 'Forbidden' });
      res.json({ success: true, data }); 
  }
  catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try { 
      const kycData = { ...req.body, user: req.user.id };
      const data = new KYC(kycData); 
      await data.save(); 
      res.status(201).json({ success: true, data }); 
  }
  catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try { 
      let data = await KYC.findById(req.params.id);
      if (!data) return res.status(404).json({ success: false, message: 'Not found' });
      if (!checkOwnership(data, req)) return res.status(403).json({ success: false, message: 'Forbidden' });
      
      data = await KYC.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); 
      res.json({ success: true, data }); 
  }
  catch (err) { next(err); }
};

exports.delete = async (req, res, next) => {
  try { 
      const data = await KYC.findById(req.params.id);
      if (!data) return res.status(404).json({ success: false, message: 'Not found' });
      if (!checkOwnership(data, req)) return res.status(403).json({ success: false, message: 'Forbidden' });

      await KYC.findByIdAndDelete(req.params.id); 
      res.json({ success: true, message: 'Deleted' }); 
  }
  catch (err) { next(err); }
};
`;
fs.writeFileSync(path.join(controllersDir, 'kycController.js'), kycContent.trim());

// employeeController.js (Admin/SuperAdmin only for writes, any auth for read)
let empContent = `
const Employee = require('../models/Employee');

const checkAdmin = (req) => ['admin', 'super_admin'].includes(req.user.role);

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
`;
fs.writeFileSync(path.join(controllersDir, 'employeeController.js'), empContent.trim());

// kpiController.js
let kpiContent = `
const KPI = require('../models/KPI');
const checkAdmin = (req) => ['admin', 'super_admin'].includes(req.user.role);

exports.getAll = async (req, res, next) => {
  try { const data = await KPI.find(req.query); res.json({ success: true, data }); }
  catch (err) { next(err); }
};
exports.getById = async (req, res, next) => {
  try { 
      const data = await KPI.findById(req.params.id); 
      if(!data) return res.status(404).json({ success: false, message: 'Not found' });
      res.json({ success: true, data }); 
  }
  catch (err) { next(err); }
};
exports.create = async (req, res, next) => {
  if (!checkAdmin(req)) return res.status(403).json({ success: false, message: 'Forbidden' });
  try { const data = new KPI(req.body); await data.save(); res.status(201).json({ success: true, data }); }
  catch (err) { next(err); }
};
exports.update = async (req, res, next) => {
  if (!checkAdmin(req)) return res.status(403).json({ success: false, message: 'Forbidden' });
  try { const data = await KPI.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }); res.json({ success: true, data }); }
  catch (err) { next(err); }
};
exports.delete = async (req, res, next) => {
  if (!checkAdmin(req)) return res.status(403).json({ success: false, message: 'Forbidden' });
  try { await KPI.findByIdAndDelete(req.params.id); res.json({ success: true, message: 'Deleted' }); }
  catch (err) { next(err); }
};
`;
fs.writeFileSync(path.join(controllersDir, 'kpiController.js'), kpiContent.trim());

console.log('IDOR checks applied');
