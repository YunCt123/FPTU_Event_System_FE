import { useState, useEffect, useRef } from "react";
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
} from "lucide-react";
import type { GetEventResponse } from "../../../types/Event";
import { organizerService } from "../../../services";
import type { Feedback, FeedbackResponse } from "../../../types/Feedback";
import feedbackService from "../../../services/feedbackService";

const EventReportsPage = () => {
  const [feedbackData, setFeedbackData] = useState<FeedbackResponse | null>(
    null
  );
  const [filteredFeedbacks, setFilteredFeedbacks] = useState<Feedback[]>([]);
  const [events, setEvents] = useState<GetEventResponse[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<GetEventResponse | null>(
    null
  );
  const [searchQuery, setSearchQuery] = useState("");
  const [ratingFilter, setRatingFilter] = useState<number | "ALL">("ALL");
  const [isLoading, setIsLoading] = useState(false);

  // Event dropdown states
  const [eventSearchQuery, setEventSearchQuery] = useState("");
  const [eventCurrentPage, setEventCurrentPage] = useState(1);
  const [eventPagination, setEventPagination] = useState<{
    totalPages: number;
    totalItems: number;
    currentPage: number;
  } | null>(null);
  const [isEventDropdownOpen, setIsEventDropdownOpen] = useState(false);
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [hasMoreEvents, setHasMoreEvents] = useState(true);
  const eventDropdownRef = useRef<HTMLDivElement>(null);
  // Cache for events (without search)
  const eventsCacheRef = useRef<GetEventResponse[]>([]);
  const eventsCacheLoadedRef = useRef(false);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        eventDropdownRef.current &&
        !eventDropdownRef.current.contains(event.target as Node)
      ) {
        setIsEventDropdownOpen(false);
      }
    };

    if (isEventDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEventDropdownOpen]);

  const fetchEvents = async (
    page: number = 1,
    search: string = "",
    append: boolean = false,
    useCache: boolean = false
  ) => {
    // Use cache if available and no search query
    if (
      useCache &&
      !search.trim() &&
      eventsCacheLoadedRef.current &&
      eventsCacheRef.current.length > 0
    ) {
      setEvents(eventsCacheRef.current);
      // Auto-select first event if not selected
      if (!selectedEventId && eventsCacheRef.current.length > 0) {
        const firstEvent = eventsCacheRef.current[0];
        setSelectedEventId(firstEvent.id);
        setSelectedEvent(firstEvent);
      }
      return;
    }

    try {
      setIsLoadingEvents(true);
      const response: any = await organizerService.getOrganizerEvents({
        page,
        limit: 10,
        search: search.trim() || undefined,
      });

      // Extract data from response - handle multiple response structures
      let eventData: GetEventResponse[] = [];
      let meta = null;

      // Try different response structures
      if (response?.data) {
        // Structure 1: response.data.data (array) with response.data.meta
        if (Array.isArray(response.data.data)) {
          eventData = response.data.data;
          meta = response.data.meta;
        }
        // Structure 2: response.data.data.data (nested)
        else if (
          response.data.data?.data &&
          Array.isArray(response.data.data.data)
        ) {
          eventData = response.data.data.data;
          meta = response.data.data.meta || response.data.meta;
        }
        // Structure 3: response.data is array directly
        else if (Array.isArray(response.data)) {
          eventData = response.data;
        }
        // Structure 4: response.data.data is object with data array
        else if (
          response.data.data &&
          typeof response.data.data === "object" &&
          Array.isArray(response.data.data.data)
        ) {
          eventData = response.data.data.data;
          meta = response.data.data.meta || response.data.meta;
        }
      }

      if (append) {
        setEvents((prev) => [...prev, ...eventData]);
      } else {
        setEvents(eventData);
        // Cache events if no search query
        if (!search.trim() && page === 1) {
          eventsCacheRef.current = eventData;
          eventsCacheLoadedRef.current = true;
        }
      }

      if (meta) {
        setEventPagination({
          totalPages: meta.totalPages || 1,
          totalItems: meta.total || 0,
          currentPage: meta.currentPage || page,
        });
        setHasMoreEvents(page < (meta.totalPages || 1));
      } else {
        // If no meta, assume has more if we got a full page
        setHasMoreEvents(eventData.length === 10);
        setEventPagination({
          totalPages: page + (eventData.length === 10 ? 1 : 0),
          totalItems: eventData.length,
          currentPage: page,
        });
      }

      // Auto-select first event if not selected and this is initial load
      if (
        !search.trim() &&
        page === 1 &&
        !selectedEventId &&
        eventData.length > 0
      ) {
        const firstEvent = eventData[0];
        setSelectedEventId(firstEvent.id);
        setSelectedEvent(firstEvent);
      }
    } catch (error) {
      console.error("Error fetching event data:", error);
      setEvents([]);
      setHasMoreEvents(false);
    } finally {
      setIsLoadingEvents(false);
    }
  };

  // Load more events when scrolling to bottom
  const handleEventScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isNearBottom =
      target.scrollHeight - target.scrollTop <= target.clientHeight + 50;

    if (isNearBottom && hasMoreEvents && !isLoadingEvents && eventPagination) {
      const nextPage = eventCurrentPage + 1;
      if (nextPage <= eventPagination.totalPages) {
        setEventCurrentPage(nextPage);
        fetchEvents(nextPage, eventSearchQuery, true, false);
      }
    }
  };

  // Initial load on mount - auto-select first event
  useEffect(() => {
    if (eventsCacheLoadedRef.current && eventsCacheRef.current.length > 0) {
      // Use cache if available
      setEvents(eventsCacheRef.current);
      if (!selectedEventId && eventsCacheRef.current.length > 0) {
        const firstEvent = eventsCacheRef.current[0];
        setSelectedEventId(firstEvent.id);
        setSelectedEvent(firstEvent);
      }
    } else {
      // Load events on mount
      fetchEvents(1, "", false, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Debounce search
  useEffect(() => {
    if (!isEventDropdownOpen) return;

    const timer = setTimeout(() => {
      setEventCurrentPage(1);
      setEvents([]);
      fetchEvents(1, eventSearchQuery, false, false);
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventSearchQuery, isEventDropdownOpen]);

  // Load events when dropdown opens (use cache if available)
  useEffect(() => {
    if (isEventDropdownOpen) {
      if (!eventSearchQuery.trim() && eventsCacheLoadedRef.current) {
        // Use cache if no search
        fetchEvents(1, "", false, true);
      } else if (events.length === 0) {
        // Load if no cache or has search
        fetchEvents(1, eventSearchQuery, false, false);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEventDropdownOpen]);

  // Update selected event when selectedEventId changes
  useEffect(() => {
    if (selectedEventId) {
      const found = events.find((e) => e.id === selectedEventId);
      if (found) {
        setSelectedEvent(found);
      } else if (eventsCacheRef.current.length > 0) {
        // Check cache if not found in current events
        const foundInCache = eventsCacheRef.current.find(
          (e) => e.id === selectedEventId
        );
        if (foundInCache) {
          setSelectedEvent(foundInCache);
        }
      }
    }
  }, [selectedEventId, events]);

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
          feedback.user.userName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          feedback.user.firstName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          feedback.user.lastName
            .toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
          feedback.comment.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (ratingFilter !== "ALL") {
      filtered = filtered.filter(
        (feedback) => feedback.rating === ratingFilter
      );
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
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }
          />
        ))}
      </div>
    );
  };

  const getRatingLabel = (rating: number) => {
    const labels: Record<number, string> = {
      1: "Rất tệ",
      2: "Tệ",
      3: "Trung bình",
      4: "Tốt",
      5: "Tuyệt vời",
    };
    return labels[rating] || "";
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
        <div className="relative" ref={eventDropdownRef}>
          <div
            onClick={() => {
              setIsEventDropdownOpen(!isEventDropdownOpen);
              // Reset search when opening dropdown
              if (!isEventDropdownOpen) {
                setEventSearchQuery("");
                setEventCurrentPage(1);
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent cursor-pointer flex items-center justify-between bg-white"
          >
            <span className={selectedEvent ? "text-gray-900" : "text-gray-500"}>
              {selectedEvent
                ? `${selectedEvent.title} - ${
                    selectedEvent.startTime
                      ? new Date(selectedEvent.startTime).toLocaleDateString(
                          "vi-VN"
                        )
                      : ""
                  }`
                : "Chọn sự kiện..."}
            </span>
            <svg
              className={`w-5 h-5 text-gray-400 transition-transform ${
                isEventDropdownOpen ? "rotate-180" : ""
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>

          {isEventDropdownOpen && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-96 overflow-hidden flex flex-col">
              {/* Search input */}
              <div className="p-2 border-b border-gray-200">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={18}
                  />
                  <input
                    type="text"
                    placeholder="Tìm kiếm sự kiện..."
                    value={eventSearchQuery}
                    onChange={(e) => setEventSearchQuery(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
                  />
                </div>
              </div>

              {/* Event list with scroll */}
              <div
                onScroll={handleEventScroll}
                className="overflow-y-auto max-h-64"
              >
                {isLoadingEvents && events.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#F27125] mx-auto mb-2"></div>
                    Đang tải...
                  </div>
                ) : events.length === 0 ? (
                  <div className="p-4 text-center text-gray-500">
                    Không tìm thấy sự kiện nào
                  </div>
                ) : (
                  events.map((event) => (
                    <div
                      key={event.id}
                      onClick={() => {
                        setSelectedEventId(event.id);
                        setSelectedEvent(event);
                        setIsEventDropdownOpen(false);
                        // Reset search and pagination when selecting
                        setEventSearchQuery("");
                        setEventCurrentPage(1);
                      }}
                      className={`px-4 py-3 hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedEventId === event.id
                          ? "bg-orange-50 border-l-4 border-[#F27125]"
                          : ""
                      }`}
                    >
                      <div className="font-medium text-gray-900">
                        {event.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(event.startTime).toLocaleDateString("vi-VN")}
                      </div>
                    </div>
                  ))
                )}

                {/* Loading more indicator */}
                {isLoadingEvents && events.length > 0 && (
                  <div className="p-2 text-center text-gray-500 text-sm">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[#F27125] mx-auto mb-1"></div>
                    Đang tải thêm...
                  </div>
                )}

                {/* End of list indicator */}
                {!hasMoreEvents && events.length > 0 && (
                  <div className="p-2 text-center text-gray-400 text-xs">
                    Đã hiển thị tất cả sự kiện
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
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
      ) : !feedbackData ? (
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
                  {renderStars(
                    Math.round(feedbackData.statistics.averageRating)
                  )}
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
                  <div className="text-sm text-gray-500 mt-1">
                    Lượt phản hồi
                  </div>
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
                      e.target.value === "ALL" ? "ALL" : Number(e.target.value)
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
                <MessageSquare
                  className="mx-auto text-gray-400 mb-4"
                  size={48}
                />
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
                          <p className="text-sm text-gray-500">
                            @{feedback.user.userName}
                          </p>
                        </div>
                        <div className="text-sm text-gray-500">
                          <Calendar size={14} className="inline mr-1" />
                          {new Date(feedback.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
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
                      <p className="text-gray-700 leading-relaxed">
                        {feedback.comment}
                      </p>
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
                Hiển thị{" "}
                <span className="font-semibold text-gray-900">
                  {filteredFeedbacks.length}
                </span>{" "}
                trong tổng số{" "}
                <span className="font-semibold text-gray-900">
                  {feedbackData.statistics.total}
                </span>{" "}
                đánh giá
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EventReportsPage;
