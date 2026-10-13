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