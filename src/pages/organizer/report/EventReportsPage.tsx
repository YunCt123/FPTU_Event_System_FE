import { useState, useEffect } from 'react';
import {
  Search,
  Star,
  MessageSquare,
  Users,
  Award,
  Calendar,
  Filter,
  StarHalf,
  User,
} from 'lucide-react';
import type { GetEventResponse } from '../../../types/Event';
import { organizerService } from '../../../services';
import type { Feedback, FeedbackResponse } from '../../../types/Feedback';
import feedbackService from '../../../services/feedbackService';

const EventReportsPage = () => {
  const [feedbackData, setFeedbackData] = useState<FeedbackResponse | null>(null);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<Feedback[]>([]);
  const [events, setEvents] = useState<GetEventResponse[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState('');
  const [ratingFilter, setRatingFilter] = useState<number | 'ALL'>('ALL');
  const [isLoading, setIsLoading] = useState(false);

  const fetchEvent = async () => {
    try {
      const response = await organizerService.getOrganizerEvents();
      if (response.status === 200 && response.data.data) {
        setEvents(response.data.data);
      } else {
        console.log("No event Data or Api");
      }
    } catch (error) {
      console.log("Error fetching event data:", error);
    }
  }; 

  useEffect(() => {
    fetchEvent();
  }, []);

  useEffect(() => {
    if (events.length > 0) {
      setSelectedEventId(events[0].id);
    }
  }, [events]);

  const fetchFeedbacks = async (eventId: string) => {
    if (!eventId) return;
    
    setIsLoading(true);
    try {
      const response = await feedbackService.getFeedbacksByEventId(eventId);
      if (response) {
        console.log("feedbackResponse", response.data);
        setFeedbackData(response.data);
        setFilteredFeedbacks(response.data?.feedbacks || []);
      } else {
        console.log("No feedback data or API");
        setFeedbackData(null);
        setFilteredFeedbacks([]);
      }
    } catch (error) {
      console.log("Error fetching feedback data:", error);
      setFeedbackData(null);
      setFilteredFeedbacks([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedEventId) {
      fetchFeedbacks(selectedEventId);
    }
  }, [selectedEventId]);

  useEffect(() => {
    if (!feedbackData) return;

    let filtered = feedbackData.feedbacks || [];

    if (searchQuery) {
      filtered = filtered.filter(
        (feedback) =>
          feedback.user.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          feedback.user.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          feedback.user.lastName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          feedback.comment.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (ratingFilter !== 'ALL') {
      filtered = filtered.filter((feedback) => feedback.rating === ratingFilter);
    }

    setFilteredFeedbacks(filtered);
  }, [searchQuery, ratingFilter, feedbackData]);

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={
              star <= rating
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300'
            }
          />
        ))}
      </div>
    );
  };

  const getRatingLabel = (rating: number) => {
    const labels: Record<number, string> = {
      1: 'Rất tệ',
      2: 'Tệ',
      3: 'Trung bình',
      4: 'Tốt',
      5: 'Tuyệt vời',
    };
    return labels[rating] || '';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Đánh giá Sự kiện</h1>
        <p className="text-gray-600 mt-1">
          Xem phản hồi và đánh giá từ người tham dự
        </p>
      </div>

      {/* Event Selector */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Chọn Sự kiện
        </label>
        <select
          value={selectedEventId || ''}
          onChange={(e) => setSelectedEventId(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
        >
          {events.length === 0 ? (
            <option value="">Không có sự kiện nào</option>
          ) : (
            events.map((event) => (
              <option key={event.id} value={event.id}>
                {event.title} - {new Date(event?.startTime).toLocaleDateString('vi-VN')}
              </option>
            ))
          )}
        </select>
      </div>

      {!selectedEventId ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Vui lòng chọn sự kiện
          </h3>
          <p className="text-gray-600">
            Chọn một sự kiện để xem đánh giá từ người tham dự
          </p>
        </div>
      ) : isLoading ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F27125] mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải đánh giá...</p>
        </div>
      ) : !feedbackData  ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Chưa có đánh giá nào
          </h3>
          <p className="text-gray-600">
            Sự kiện này chưa nhận được đánh giá từ người tham dự
          </p>
        </div>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-4">
                <div className="bg-orange-100 rounded-full p-4">
                  <Award className="text-orange-600" size={32} />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Điểm trung bình</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {feedbackData.statistics.averageRating.toFixed(1)}/5
                  </div>
                  {renderStars(Math.round(feedbackData.statistics.averageRating))}
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center gap-4">
                <div className="bg-blue-100 rounded-full p-4">
                  <Users className="text-blue-600" size={32} />
                </div>
                <div>
                  <div className="text-sm text-gray-600">Tổng đánh giá</div>
                  <div className="text-3xl font-bold text-gray-900">
                    {feedbackData.statistics.total}
                  </div>
                  <div className="text-sm text-gray-500 mt-1">Lượt phản hồi</div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters & Search */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Tìm kiếm theo tên người dùng hoặc nội dung..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Rating Filter */}
              <div className="flex items-center gap-2">
                <Filter size={20} className="text-gray-400" />
                <select
                  value={ratingFilter}
                  onChange={(e) =>
                    setRatingFilter(
                      e.target.value === 'ALL' ? 'ALL' : Number(e.target.value)
                    )
                  }
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
                >
                  <option value="ALL">Tất cả đánh giá</option>
                  <option value="5">5 sao</option>
                  <option value="4">4 sao</option>
                  <option value="3">3 sao</option>
                  <option value="2">2 sao</option>
                  <option value="1">1 sao</option>
                </select>
              </div>
            </div>
          </div>

          {/* Feedbacks List */}
          <div className="space-y-4">
            {filteredFeedbacks.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
                <MessageSquare className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Không tìm thấy đánh giá
                </h3>
                <p className="text-gray-600">
                  Không có đánh giá nào phù hợp với bộ lọc của bạn
                </p>
              </div>
            ) : (
              filteredFeedbacks.map((feedback) => (
                <div
                  key={feedback.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {/* User Avatar */}
                    <div className="flex-shrink-0">
                      {feedback.user.avatar ? (
                        <img
                          src={feedback.user.avatar}
                          alt={feedback.user.userName}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                          <User size={24} className="text-gray-500" />
                        </div>
                      )}
                    </div>

                    {/* Feedback Content */}
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">
                            {feedback.user.firstName} {feedback.user.lastName}
                          </h4>
                          <p className="text-sm text-gray-500">@{feedback.user.userName}</p>
                        </div>
                        <div className="text-sm text-gray-500">
                          <Calendar size={14} className="inline mr-1" />
                          {new Date(feedback.createdAt).toLocaleDateString('vi-VN')}
                        </div>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-2 mb-3">
                        {renderStars(feedback.rating)}
                        <span className="text-sm font-medium text-gray-700">
                          {getRatingLabel(feedback.rating)}
                        </span>
                      </div>

                      {/* Comment */}
                      <p className="text-gray-700 leading-relaxed">{feedback.comment}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Summary Footer */}
          {filteredFeedbacks.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 text-center">
              <p className="text-gray-600">
                Hiển thị <span className="font-semibold text-gray-900">{filteredFeedbacks.length}</span> trong tổng số{' '}
                <span className="font-semibold text-gray-900">{feedbackData.statistics.total}</span> đánh giá
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EventReportsPage;
