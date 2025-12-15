import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  CheckCheck,
  Loader2,
  Filter,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { toast } from "react-toastify";
import notificationService from "../services/notificationService";
import { NotificationItem } from "../components/notification";
import type {
  Notification,
  NotificationType,
  NotificationMeta,
} from "../types/Notification";

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [meta, setMeta] = useState<NotificationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [markingAllRead, setMarkingAllRead] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [filterIsRead, setFilterIsRead] = useState<boolean | undefined>(
    undefined
  );
  const [filterType, setFilterType] = useState<NotificationType | undefined>(
    undefined
  );
  const navigate = useNavigate();

  const notificationTypes: { value: NotificationType; label: string }[] = [
    { value: "staff_assigned", label: "Phân công Staff" },
    { value: "event_created", label: "Sự kiện được tạo" },
    { value: "event_pending_approval", label: "Sự kiện chờ phê duyệt" },
    { value: "event_approved", label: "Sự kiện được duyệt" },
    { value: "event_rejected", label: "Sự kiện bị từ chối" },
    { value: "event_cancelled", label: "Sự kiện bị hủy" },
    { value: "event_time_changed", label: "Thay đổi thời gian" },
    { value: "one_day", label: "Nhắc nhở 1 ngày" },
    { value: "thirty_min", label: "Nhắc nhở 30 phút" },
    { value: "incident_reported", label: "Báo cáo sự cố" },
    { value: "cancellation_request", label: "Yêu cầu hủy sự kiện" },
    { value: "cancellation_approved", label: "Yêu cầu hủy được duyệt" },
    { value: "cancellation_rejected", label: "Yêu cầu hủy bị từ chối" },
  ];

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const response = await notificationService.getNotifications({
        page: currentPage,
        limit: 15,
        isRead: filterIsRead,
        type: filterType,
      });

      // Handle different response structures
      const responseData = response.data?.data || response.data;
      if (responseData) {
        // If response has nested data.data structure
        if (Array.isArray(responseData.data)) {
          setNotifications(responseData.data);
          setMeta(responseData.meta || null);
        } else if (Array.isArray(responseData)) {
          // If response.data is directly the array
          setNotifications(responseData);
          setMeta(null);
        } else {
          setNotifications([]);
          setMeta(null);
        }
      } else {
        setNotifications([]);
        setMeta(null);
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
      toast.error("Không thể tải thông báo");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, filterIsRead, filterType]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const handleNotificationClick = async (notification: Notification) => {
    // Mark as read if not already
    if (!notification.isRead) {
      try {
        await notificationService.markAsRead(notification.id);
        setNotifications((prev) =>
          prev.map((n) =>
            n.id === notification.id ? { ...n, isRead: true } : n
          )
        );
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }

    // Navigate based on notification type
    const { data, type } = notification;
    if (data?.eventId) {
      switch (type) {
        case "cancellation_request":
          navigate(`/admin/events/cancellation-requests`);
          break;
        default:
          navigate(`/events/${data.eventId}`);
      }
    }
  };

  const handleMarkAllAsRead = async () => {
    if (markingAllRead) return;

    setMarkingAllRead(true);
    try {
      const response = await notificationService.markAllAsRead();
      const responseData = response.data?.data || response.data;
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success(responseData?.message || "Đã đánh dấu tất cả đã đọc");
    } catch (error) {
      console.error("Failed to mark all as read:", error);
      toast.error("Không thể đánh dấu đã đọc");
    } finally {
      setMarkingAllRead(false);
    }
  };

  const handleClearFilters = () => {
    setFilterIsRead(undefined);
    setFilterType(undefined);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#F27125]/10 flex items-center justify-center">
                  <Bell className="w-6 h-6 text-[#F27125]" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">
                    Thông báo
                  </h1>
                  <p className="text-sm text-gray-500">
                    Quản lý tất cả thông báo của bạn
                  </p>
                </div>
              </div>
              <button
                onClick={handleMarkAllAsRead}
                disabled={markingAllRead}
                className="flex items-center gap-2 px-4 py-2 bg-[#F27125] text-white rounded-lg hover:bg-[#d65f1a] transition-colors disabled:opacity-50"
              >
                {markingAllRead ? (
                  <Loader2 size={16} className="animate-spin" />
                ) : (
                  <CheckCheck size={16} />
                )}
                Đánh dấu tất cả đã đọc
              </button>
            </div>
          </div>

          {/* Filters */}
          <div className="p-4 bg-gray-50 border-b border-gray-100">
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter size={16} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-600">
                  Lọc theo:
                </span>
              </div>

              {/* Filter by read status */}
              <select
                value={
                  filterIsRead === undefined ? "" : filterIsRead.toString()
                }
                onChange={(e) => {
                  const value = e.target.value;
                  setFilterIsRead(value === "" ? undefined : value === "true");
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27125]/50"
              >
                <option value="">Tất cả trạng thái</option>
                <option value="false">Chưa đọc</option>
                <option value="true">Đã đọc</option>
              </select>

              {/* Filter by type */}
              <select
                value={filterType || ""}
                onChange={(e) => {
                  setFilterType(
                    (e.target.value as NotificationType) || undefined
                  );
                  setCurrentPage(1);
                }}
                className="px-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#F27125]/50"
              >
                <option value="">Tất cả loại</option>
                {notificationTypes.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>

              {(filterIsRead !== undefined || filterType) && (
                <button
                  onClick={handleClearFilters}
                  className="px-3 py-1.5 text-sm text-[#F27125] hover:bg-[#F27125]/10 rounded-lg transition-colors"
                >
                  Xóa bộ lọc
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Notification List */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-[#F27125]" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <Bell size={48} className="mb-4 opacity-30" />
              <p className="text-lg font-medium">Không có thông báo nào</p>
              <p className="text-sm text-gray-400 mt-1">
                {filterIsRead !== undefined || filterType
                  ? "Thử thay đổi bộ lọc để xem thêm thông báo"
                  : "Bạn chưa có thông báo nào"}
              </p>
            </div>
          ) : (
            <div>
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onClick={handleNotificationClick}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between mt-6 bg-white rounded-xl shadow-sm border border-gray-100 p-4">
            <div className="text-sm text-gray-500">
              Trang {meta.page} / {meta.totalPages} ({meta.total} thông báo)
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} />
                Trước
              </button>
              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(meta.totalPages, p + 1))
                }
                disabled={currentPage === meta.totalPages}
                className="flex items-center gap-1 px-3 py-1.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sau
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
