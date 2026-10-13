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