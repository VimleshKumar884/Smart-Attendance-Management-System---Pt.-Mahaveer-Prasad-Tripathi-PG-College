const Notification = require('../models/Notification');
const BackdatedLog = require('../models/BackdatedLog');
const FacultyLoginLog = require('../models/FacultyLoginLog');

// @desc    Get user notifications
// @route   GET /api/notifications
// @access  Private
exports.getNotifications = async (req, res) => {
  try {
    const userRole = req.user.role;
    const userId = req.user.id;

    // First, let's auto-generate any pending admin notifications dynamically if requested by admin
    if (userRole === 'admin') {
      const pendingLogs = await BackdatedLog.countDocuments({ adminStatus: 'pending' });
      if (pendingLogs > 0) {
        // We can just create one if it doesn't exist today, or just ensure there's a fresh one
        await Notification.updateOne(
          { userId, type: 'alert', message: { $regex: /Pending backdated/i }, isRead: false },
          { $set: { message: `You have ${pendingLogs} pending backdated attendance requests.`, userRole: 'admin' } },
          { upsert: true }
        );
      }
    }

    const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: notifications.length, data: notifications });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark notification as read
// @route   PUT /api/notifications/:id/read
// @access  Private
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { isRead: true },
      { new: true }
    );
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    res.status(200).json({ success: true, data: notification });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Mark all as read
// @route   PUT /api/notifications/read-all
// @access  Private
exports.markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, isRead: false },
      { isRead: true }
    );
    res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
