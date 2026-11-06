const Notification = require("../models/notification.model");
const userRoles = require("../utils/userRoles");

// ── Get notifications for current user ────────────────────────────────
const getMyNotifications = async (req, res, next) => {
  try {
    const userId = req.currentUser._id;
    const userRole = req.currentUser.role;
    const isAdmin = [userRoles.ADMIN, userRoles.MANAGER].includes(userRole);

    // Query: direct notifications OR role-based broadcasts
    const query = {
      $or: [
        { recipient: userId },
        ...(isAdmin ? [{ recipientRole: "ADMIN" }] : [{ recipientRole: "USER" }]),
        { recipientRole: "ALL" },
      ],
    };

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(30);

    // Calculate unread count
    const unreadCount = notifications.filter((n) => {
      if (n.recipient && String(n.recipient) === String(userId)) {
        return !n.isRead;
      }
      return !n.readBy.some((id) => String(id) === String(userId));
    }).length;

    return res.status(200).json({
      status: "success",
      results: notifications.length,
      data: {
        notifications: notifications.map((n) => {
          const isUserRead =
            n.recipient && String(n.recipient) === String(userId)
              ? n.isRead
              : n.readBy.some((id) => String(id) === String(userId));

          return {
            _id: n._id,
            title: n.title,
            message: n.message,
            type: n.type,
            link: n.link,
            isRead: isUserRead,
            createdAt: n.createdAt,
          };
        }),
        unreadCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ── Mark single notification as read ──────────────────────────────────
const markAsRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.currentUser._id;

    const notif = await Notification.findById(id);
    if (!notif) {
      return res.status(404).json({ status: "fail", message: "الإشعار غير موجود" });
    }

    if (notif.recipient && String(notif.recipient) === String(userId)) {
      notif.isRead = true;
    } else {
      if (!notif.readBy.some((uid) => String(uid) === String(userId))) {
        notif.readBy.push(userId);
      }
    }
    await notif.save();

    return res.status(200).json({ status: "success", message: "تم تحديد الإشعار كمقروء" });
  } catch (error) {
    next(error);
  }
};

// ── Mark all as read ──────────────────────────────────────────────────
const markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.currentUser._id;
    const userRole = req.currentUser.role;
    const isAdmin = [userRoles.ADMIN, userRoles.MANAGER].includes(userRole);

    // Mark direct notifications
    await Notification.updateMany({ recipient: userId, isRead: false }, { isRead: true });

    // Mark role-based notifications
    const roleQuery = isAdmin ? { recipientRole: "ADMIN" } : { recipientRole: "USER" };
    await Notification.updateMany(
      { ...roleQuery, readBy: { $ne: userId } },
      { $addToSet: { readBy: userId } }
    );

    return res.status(200).json({ status: "success", message: "تم تحديد كافة الإشعارات كمقروءة" });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyNotifications,
  markAsRead,
  markAllAsRead,
};

