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