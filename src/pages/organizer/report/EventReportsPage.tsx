import { useState, useEffect } from 'react';
import {
  FileText,
  Download,
  Calendar,
  Users,
  TrendingUp,
  Clock,
  Award,
  BarChart3,
  Send,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import type { Event } from '../../../types/Event';

interface EventReport {
  event: Event;
  statistics: {
    totalRegistrations: number;
    actualAttendance: number;
    attendanceRate: number;
    checkInOnTime: number;
    checkInLate: number;
    noShow: number;
    vipAttendees: number;
    guestAttendees: number;
    staffAssigned: number;
  };
  feedback: {
    averageRating: number;
    totalFeedbacks: number;
    positivePercentage: number;
  };
  generatedAt: string;
  submittedToAdmin: boolean;
  submittedAt?: string;
}

const EventReportsPage = () => {
  const [reports, setReports] = useState<EventReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<EventReport | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    // Mock data - Replace with actual API call
    const mockReports: EventReport[] = [
      {
        event: {
          id: 1,
          title: 'Workshop: AI & Machine Learning',
          description: 'Hội thảo về AI',
          eventType: 'WORKSHOP',
          status: 'COMPLETED',
          startDate: '2024-12-10T09:00:00',
          endDate: '2024-12-10T17:00:00',
          registrationDeadline: '2024-12-08T23:59:59',
          maxParticipants: 100,
          currentParticipants: 85,
          organizerId: 1,
          requiresApproval: true,
          isPublished: true,
        },
        statistics: {
          totalRegistrations: 85,
          actualAttendance: 78,
          attendanceRate: 91.8,
          checkInOnTime: 70,
          checkInLate: 8,
          noShow: 7,
          vipAttendees: 5,
          guestAttendees: 3,
          staffAssigned: 6,
        },
        feedback: {
          averageRating: 4.5,
          totalFeedbacks: 65,
          positivePercentage: 92,
        },
        generatedAt: '2024-12-10T18:00:00',
        submittedToAdmin: true,
        submittedAt: '2024-12-10T19:30:00',
      },
      {
        event: {
          id: 2,
          title: 'Tech Conference 2024',
          description: 'Hội nghị công nghệ',
          eventType: 'CONFERENCE',
          status: 'COMPLETED',
          startDate: '2024-12-05T08:00:00',
          endDate: '2024-12-05T18:00:00',
          registrationDeadline: '2024-12-03T23:59:59',
          maxParticipants: 200,
          currentParticipants: 180,
          organizerId: 1,
          requiresApproval: true,
          isPublished: true,
        },
        statistics: {
          totalRegistrations: 180,
          actualAttendance: 165,
          attendanceRate: 91.7,
          checkInOnTime: 150,
          checkInLate: 15,
          noShow: 15,
          vipAttendees: 10,
          guestAttendees: 8,
          staffAssigned: 12,
        },
        feedback: {
          averageRating: 4.7,
          totalFeedbacks: 142,
          positivePercentage: 95,
        },
        generatedAt: '2024-12-05T19:00:00',
        submittedToAdmin: false,
      },
    ];
    setReports(mockReports);
  }, []);

  const handleViewReport = (report: EventReport) => {
    setSelectedReport(report);
    setShowReportModal(true);
  };

  const handleDownloadReport = (report: EventReport) => {
    // Mock download - Replace with actual PDF generation
    console.log('Downloading report for:', report.event.title);
    alert('Đang tải báo cáo PDF...');
  };

  const handleSubmitToAdmin = (reportId: number) => {
    setReports((prev) =>
      prev.map((r) =>
        r.event.id === reportId
          ? {
              ...r,
              submittedToAdmin: true,
              submittedAt: new Date().toISOString(),
            }
          : r
      )
    );
    alert('Đã gửi báo cáo đến Ban Giám Hiệu');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Báo cáo Sự kiện</h1>
        <p className="text-gray-600 mt-1">
          Xem và gửi báo cáo tổng hợp sau sự kiện đến Ban Giám Hiệu
        </p>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {reports.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
            <FileText className="mx-auto text-gray-400 mb-4" size={48} />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Chưa có báo cáo nào
            </h3>
            <p className="text-gray-600">
              Báo cáo sẽ được tự động tạo sau khi sự kiện hoàn thành
            </p>
          </div>
        ) : (
          reports.map((report) => (
            <div
              key={report.event.id}
              className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {report.event.title}
                      </h3>
                      {report.submittedToAdmin ? (
                        <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                          <CheckCircle size={16} />
                          Đã gửi
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
                          <Clock size={16} />
                          Chưa gửi
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar size={16} />
                        {new Date(report.event.startDate).toLocaleDateString('vi-VN')}
                      </div>
                      <div className="flex items-center gap-1">
                        <FileText size={16} />
                        Tạo: {new Date(report.generatedAt).toLocaleDateString('vi-VN')}
                      </div>
                      {report.submittedAt && (
                        <div className="flex items-center gap-1">
                          <Send size={16} />
                          Gửi: {new Date(report.submittedAt).toLocaleDateString('vi-VN')}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Statistics Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-blue-600 mb-1">
                      <Users size={20} />
                      <span className="text-sm font-medium">Đăng ký</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {report.statistics.totalRegistrations}
                    </div>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-green-600 mb-1">
                      <CheckCircle size={20} />
                      <span className="text-sm font-medium">Tham dự</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {report.statistics.actualAttendance}
                    </div>
                  </div>

                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-purple-600 mb-1">
                      <TrendingUp size={20} />
                      <span className="text-sm font-medium">Tỷ lệ</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {report.statistics.attendanceRate}%
                    </div>
                  </div>

                  <div className="bg-orange-50 rounded-lg p-4">
                    <div className="flex items-center gap-2 text-orange-600 mb-1">
                      <Award size={20} />
                      <span className="text-sm font-medium">Đánh giá</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-900">
                      {report.feedback.averageRating}/5
                    </div>
                  </div>
                </div>

                {/* Additional Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4 pt-4 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Đúng giờ</div>
                    <div className="text-lg font-bold text-green-600">
                      {report.statistics.checkInOnTime}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Muộn</div>
                    <div className="text-lg font-bold text-yellow-600">
                      {report.statistics.checkInLate}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600">Vắng</div>
                    <div className="text-lg font-bold text-red-600">
                      {report.statistics.noShow}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleViewReport(report)}
                    className="flex-1 flex items-center justify-center gap-2 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <BarChart3 size={20} />
                    Xem chi tiết
                  </button>
                  <button
                    onClick={() => handleDownloadReport(report)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Download size={20} />
                    Tải PDF
                  </button>
                  {!report.submittedToAdmin && (
                    <button
                      onClick={() => handleSubmitToAdmin(report.event.id)}
                      className="flex items-center gap-2 bg-[#F27125] text-white px-4 py-2 rounded-lg hover:bg-[#d65d1a] transition-colors"
                    >
                      <Send size={20} />
                      Gửi BGH
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Detailed Report Modal */}
      {showReportModal && selectedReport && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-gray-900">
                Báo cáo chi tiết: {selectedReport.event.title}
              </h2>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg"
              >
                <XCircle size={24} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Event Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Thông tin sự kiện</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Loại sự kiện:</span>
                    <span className="ml-2 font-medium">{selectedReport.event.eventType}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Trạng thái:</span>
                    <span className="ml-2 font-medium">{selectedReport.event.status}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Ngày bắt đầu:</span>
                    <span className="ml-2 font-medium">
                      {new Date(selectedReport.event.startDate).toLocaleString('vi-VN')}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-600">Ngày kết thúc:</span>
                    <span className="ml-2 font-medium">
                      {new Date(selectedReport.event.endDate).toLocaleString('vi-VN')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Attendance Statistics */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Thống kê tham dự</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <StatCard
                    label="Tổng đăng ký"
                    value={selectedReport.statistics.totalRegistrations}
                    color="blue"
                  />
                  <StatCard
                    label="Thực tế tham dự"
                    value={selectedReport.statistics.actualAttendance}
                    color="green"
                  />
                  <StatCard
                    label="Tỷ lệ tham dự"
                    value={`${selectedReport.statistics.attendanceRate}%`}
                    color="purple"
                  />
                  <StatCard
                    label="Check-in đúng giờ"
                    value={selectedReport.statistics.checkInOnTime}
                    color="green"
                  />
                  <StatCard
                    label="Check-in muộn"
                    value={selectedReport.statistics.checkInLate}
                    color="yellow"
                  />
                  <StatCard
                    label="Vắng mặt"
                    value={selectedReport.statistics.noShow}
                    color="red"
                  />
                  <StatCard
                    label="VIP"
                    value={selectedReport.statistics.vipAttendees}
                    color="purple"
                  />
                  <StatCard
                    label="Khách mời"
                    value={selectedReport.statistics.guestAttendees}
                    color="blue"
                  />
                  <StatCard
                    label="Staff"
                    value={selectedReport.statistics.staffAssigned}
                    color="orange"
                  />
                </div>
              </div>

              {/* Feedback Summary */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-3">Đánh giá & Phản hồi</h3>
                <div className="bg-orange-50 rounded-lg p-4">
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-3xl font-bold text-orange-600">
                        {selectedReport.feedback.averageRating}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Điểm trung bình</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-orange-600">
                        {selectedReport.feedback.totalFeedbacks}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Lượt đánh giá</div>
                    </div>
                    <div>
                      <div className="text-3xl font-bold text-orange-600">
                        {selectedReport.feedback.positivePercentage}%
                      </div>
                      <div className="text-sm text-gray-600 mt-1">Hài lòng</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Info */}
              {selectedReport.submittedToAdmin && selectedReport.submittedAt && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-600" size={24} />
                    <div>
                      <div className="font-semibold text-green-900">
                        Đã gửi đến Ban Giám Hiệu
                      </div>
                      <div className="text-sm text-green-700">
                        Thời gian:{' '}
                        {new Date(selectedReport.submittedAt).toLocaleString('vi-VN')}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

interface StatCardProps {
  label: string;
  value: string | number;
  color: 'blue' | 'green' | 'purple' | 'yellow' | 'red' | 'orange';
}

const StatCard = ({ label, value, color }: StatCardProps) => {
  const colors = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    purple: 'bg-purple-50 text-purple-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    orange: 'bg-orange-50 text-orange-600',
  };

  return (
    <div className={`${colors[color]} rounded-lg p-4`}>
      <div className="text-sm font-medium mb-1">{label}</div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
};

export default EventReportsPage;
