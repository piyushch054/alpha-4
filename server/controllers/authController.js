const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { demoAuthEnabled } = require('../config/env');

exports.register = async (req, res, next) => {
    try {
        const { email, password, name, role } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password' });
        
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ success: false, message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ email, password: hashedPassword, name, role: 'user' });
        
        res.status(201).json({ success: true, message: 'User registered successfully' });
    } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password' });

        const user = await User.findOne({ email });
        if (!user) return res.status(401).json({ success: false, message: 'Invalid credentials' });
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ success: false, message: 'Invalid credentials' });
        
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'supersecret', { expiresIn: '1d' });
        res.json({ success: true, token, user: { id: user._id, email, name: user.name, role: user.role } });
    } catch (err) { next(err); }
};

exports.getMe = async (req, res, next) => {
    res.json({ success: true, data: req.user });
};
const crypto = require('crypto');
const { DEMO_ROLES } = require('../config/rbac');

// Demo sign-in bridge: needs ENABLE_DEMO_AUTH=true AND APP_ENV=demo|development; always off for APP_ENV=production.
exports.demoSession = async (req, res, next) => {
    try {
        if (!demoAuthEnabled()) {
            return res.status(404).json({ success: false, message: 'Not found' });
        }
        const role = String(req.body.role || '').trim();
        const name = String(req.body.name || '').trim().slice(0, 80);
        if (!role || !name) return res.status(400).json({ success: false, message: 'A role and name are required' });
        if (!DEMO_ROLES.includes(role)) return res.status(403).json({ success: false, message: 'This role is not available for demo sign-in' });
        const slug = value => value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        const email = `demo.${slug(role)}.${slug(name)}@namdev.local`;
        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({ email, name, role, password: await bcrypt.hash(crypto.randomBytes(24).toString('hex'), 10) });
        } else if (user.role !== role || user.name !== name) {
            user.role = role; user.name = name; await user.save();
        }
        const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET || 'supersecret', { expiresIn: '8h' });
        res.json({ success: true, token, user: { id: user._id, email, name: user.name, role: user.role } });
    } catch (err) { next(err); }
};
