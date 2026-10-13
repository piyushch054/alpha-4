const fs = require('fs');
const path = require('path');

const serverDir = path.join(__dirname, 'server');
const middlewareDir = path.join(serverDir, 'middleware');
const controllersDir = path.join(serverDir, 'controllers');
const routesDir = path.join(serverDir, 'routes');
const uploadsDir = path.join(serverDir, 'uploads');

[middlewareDir, controllersDir, routesDir, uploadsDir].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// 1. authMiddleware.js
const authMiddleware = `
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const authMiddleware = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) return res.status(401).json({ success: false, message: 'Not authorized, no token' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'supersecret');
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user) return res.status(401).json({ success: false, message: 'Not authorized, user not found' });
        
        next();
    } catch (error) {
        res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
};
module.exports = authMiddleware;
`;
fs.writeFileSync(path.join(middlewareDir, 'authMiddleware.js'), authMiddleware.trim());

// 2. roleMiddleware.js
const roleMiddleware = `
const roleMiddleware = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({ success: false, message: 'Forbidden: Insufficient role permissions' });
        }
        next();
    };
};
module.exports = roleMiddleware;
`;
fs.writeFileSync(path.join(middlewareDir, 'roleMiddleware.js'), roleMiddleware.trim());

// 3. errorMiddleware.js
const errorMiddleware = `
const errorMiddleware = (err, req, res, next) => {
    let message = err.message || 'Server Error';
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    if (err.name === 'CastError') {
        message = 'Resource not found or invalid ID';
        statusCode = 404;
    }
    if (err.code === 11000) {
        message = 'Duplicate field value entered';
        statusCode = 400;
    }
    if (err.name === 'ValidationError') {
        message = Object.values(err.errors).map(val => val.message).join(', ');
        statusCode = 400;
    }

    res.status(statusCode).json({ success: false, message });
};
module.exports = errorMiddleware;
`;
fs.writeFileSync(path.join(middlewareDir, 'errorMiddleware.js'), errorMiddleware.trim());

// 4. authController.js
const authController = `
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.register = async (req, res, next) => {
    try {
        const { email, password, name, role } = req.body;
        if (!email || !password) return res.status(400).json({ success: false, message: 'Please provide email and password' });
        
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ success: false, message: 'User already exists' });

        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ email, password: hashedPassword, name, role: role || 'user' });
        
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
`;
fs.writeFileSync(path.join(controllersDir, 'authController.js'), authController.trim());

// 5. userController.js
const userController = `
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
`;
fs.writeFileSync(path.join(controllersDir, 'userController.js'), userController.trim());

// 6. dashboardController.js
const dashboardController = `
const User = require('../models/User');
const Employee = require('../models/Employee');
const Task = require('../models/Task');
const KYC = require('../models/KYC');

exports.getStats = async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalEmployees = await Employee.countDocuments();
        const totalTasks = await Task.countDocuments();
        const totalKyc = await KYC.countDocuments();

        const pendingTasks = await Task.countDocuments({ status: 'pending' });
        const completedTasks = await Task.countDocuments({ status: 'completed' });

        res.json({
            success: true,
            data: {
                totalUsers,
                totalEmployees,
                totalTasks,
                totalKyc,
                pendingTasks,
                completedTasks
            }
        });
    } catch (err) { next(err); }
};
`;
fs.writeFileSync(path.join(controllersDir, 'dashboardController.js'), dashboardController.trim());

console.log("Middlewares and new controllers generated successfully.");
