import { UserPlus, Search, Users, Plus } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import type { eventSpeaker, GetEventResponse } from "../../../types/Event";
import { eventService, organizerService } from "../../../services";
import SpeakerTable from "../../../components/organizer/speaker/SpeakerTable";
import AddSpeakerModal from "../../../components/organizer/speaker/AddSpeakerModal";
import AssignSpeakerModal from "../../../components/organizer/speaker/AssignSpeakerModal";

const SpeakerManagementPage = () => {
  const [events, setEvents] = useState<GetEventResponse[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string>("");
  const [selectedEvent, setSelectedEvent] = useState<GetEventResponse>();
  const [selectedEventObj, setSelectedEventObj] =
    useState<GetEventResponse | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filteredSpeakers, setFilteredSpeakers] = useState<eventSpeaker[]>([]);
  const [speakers, setSpeakers] = useState<eventSpeaker[]>([]);
  const [assignSpeakerOpen, setAssignSpeakerOpen] = useState(false);

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
        setSelectedEventObj(firstEvent);
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
        setSelectedEventObj(firstEvent);
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
        fetchEvents(nextPage, eventSearchQuery, true);
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
        setSelectedEventObj(firstEvent);
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
        setSelectedEventObj(found);
      } else if (eventsCacheRef.current.length > 0) {
        // Check cache if not found in current events
        const foundInCache = eventsCacheRef.current.find(
          (e) => e.id === selectedEventId
        );
        if (foundInCache) {
          setSelectedEventObj(foundInCache);
        }
      }
    }
  }, [selectedEventId, events]);

  const fetchSpeaker = async (eventId: string) => {
    try {
      const response = await eventService.getEventById(eventId);
      if (response) {
        console.log("response2", response.data.eventSpeakers);
        setSpeakers(response.data.eventSpeakers || []);
        setSelectedEvent(response.data);
      }
    } catch (error) {
      console.log("Error fetching staff data:", error);
    }
  };

  useEffect(() => {
    if (!selectedEventId) {
      return;
    }
    fetchSpeaker(selectedEventId);
  }, [selectedEventId]);

  // Filter speakers based on search query and type
  useEffect(() => {
    let filtered = speakers;

    if (selectedType) {
      filtered = filtered.filter(
        (eventSpeaker) => eventSpeaker.speaker?.type === selectedType
      );
    }

    if (searchQuery) {
      filtered = filtered.filter((eventSpeaker) => {
        const speaker = eventSpeaker.speaker;
        if (!speaker) return false;
        return (
          speaker.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          speaker.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          eventSpeaker.topic.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
    }

    setFilteredSpeakers(filtered);
  }, [speakers, searchQuery, selectedType]);

  const getSpeakerTypes = () => {
    const types = new Set<string>();
    speakers.forEach((eventSpeaker) => {
      if (eventSpeaker.speaker?.type) {
        types.add(eventSpeaker.speaker.type);
      }
    });
    return Array.from(types);
  };

  const handleDeleteSpeaker = () => {
    if (selectedEventId) {
      fetchSpeaker(selectedEventId);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Quản lý Speaker</h1>
          <p className="text-gray-600 mt-1">Phân công speaker</p>
        </div>
        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 bg-[#F27125] text-white px-4 py-2 rounded-lg hover:bg-[#d65d1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <UserPlus size={20} />
          Thêm Speaker
        </button>
      </div>

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
            <span
              className={selectedEventObj ? "text-gray-900" : "text-gray-500"}
            >
              {selectedEventObj
                ? `${selectedEventObj.title} - ${
                    selectedEventObj.startTime
                      ? new Date(selectedEventObj.startTime).toLocaleDateString(
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
                        setSelectedEventObj(event);
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
          <Users className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Vui lòng chọn sự kiện
          </h3>
          <p className="text-gray-600">
            Chọn một sự kiện để xem danh sách speaker
          </p>
        </div>
      ) : (
        <>
          {/* Stats */}
          {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Tổng Speakers</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{speakers.length}</p>
                </div>
                <Users className="text-[#F27125]" size={32} />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Loại Speaker</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{getSpeakerTypes().length}</p>
                </div>
                <Users className="text-blue-600" size={32} />
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Đã lọc</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{filteredSpeakers.length}</p>
                </div>
                <Users className="text-green-600" size={32} />
              </div>
            </div>
          </div> */}

          {/* Filters */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 space-y-4">
            <div>
              {/* Search */}
              <div className="relative">
                <Search
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={20}
                />
                <input
                  type="text"
                  placeholder="Tìm kiếm speaker theo tên, công ty, chủ đề..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
                />
              </div>

              {/* Type Filter */}
              {/* <div>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent"
                >
                  <option value="">Tất cả loại speaker</option>
                  {getSpeakerTypes().map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div> */}
            </div>
          </div>
          <button
            onClick={() => setAssignSpeakerOpen(true)}
            disabled={!selectedEventId}
            className="flex items-center gap-2 bg-[#F27125] text-white px-4 py-2 rounded-lg hover:bg-[#d65d1a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Plus size={20} />
            Phân Công Speaker
          </button>

          {/* Speaker Table */}
          <SpeakerTable
            onDelete={handleDeleteSpeaker}
            speakers={filteredSpeakers}
            eventId={selectedEventId}
          />
        </>
      )}

      {/* Add Speaker Modal */}
      {isAddModalOpen && (
        <AddSpeakerModal
          onClose={() => setIsAddModalOpen(false)}
          onSuccess={() => {
            if (selectedEventId) {
              fetchSpeaker(selectedEventId);
            }
          }}
        />
      )}
      {/* Assign Speaker Modal */}
      {assignSpeakerOpen && selectedEventId && (
        <AssignSpeakerModal
          selectedEventId={selectedEventId}
          onClose={() => setAssignSpeakerOpen(false)}
          onSuccess={() => {
            if (selectedEventId) {
              fetchSpeaker(selectedEventId);
            }
          }}
        />
      )}
    </div>
  );
};

export default SpeakerManagementPage;
