const User = require('../models/User');
const bcrypt = require('bcryptjs');

exports.getAll = async (req, res, next) => {
    try {
        const users = await User.find(req.query).select('-password');
        res.json({ success: true, data: users });
    } catch (err) { next(err); }
};

exports.getById = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, data: user });
    } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
    try {
        const { email, password, name, role } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ email, password: hashedPassword, name, role });
        const userObj = user.toObject(); delete userObj.password;
        res.status(201).json({ success: true, data: userObj });
    } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
    try {
        if (req.body.password) {
            req.body.password = await bcrypt.hash(req.body.password, 10);
        }
        const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true }).select('-password');
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, data: user });
    } catch (err) { next(err); }
};

exports.delete = async (req, res, next) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'User not found' });
        res.json({ success: true, message: 'User deleted' });
    } catch (err) { next(err); }
};