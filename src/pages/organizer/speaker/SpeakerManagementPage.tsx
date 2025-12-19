import { UserPlus, Search, Users, Plus } from "lucide-react"
import { useEffect, useState } from "react";
import type { eventSpeaker, GetEventResponse } from "../../../types/Event";
import { eventService, organizerService } from "../../../services";
import SpeakerTable from "../../../components/organizer/speaker/SpeakerTable";
import AddSpeakerModal from "../../../components/organizer/speaker/AddSpeakerModal";
import AssignSpeakerModal from "../../../components/organizer/speaker/AssignSpeakerModal";


const SpeakerManagementPage = () => {
      const [events, setEvents] = useState<GetEventResponse[]>([]);
      const [selectedEventId, setSelectedEventId] = useState<string>("");
      const [selectedEvent, setSelectedEvent] = useState<GetEventResponse>();
      const [searchQuery, setSearchQuery] = useState("");
      const [selectedType, setSelectedType] = useState<string>("");
      const [isAddModalOpen, setIsAddModalOpen] = useState(false);
      const [filteredSpeakers, setFilteredSpeakers] = useState<eventSpeaker[]>([]);
      const [speakers, setSpeakers] = useState<eventSpeaker[]>([]);
      const [assignSpeakerOpen, setAssignSpeakerOpen] = useState(false);

      const fetchEvent = async () => {
        try {
          let page = 1;
          let totalPages = 1;
          let allEvents: GetEventResponse[] = [];

          do {
            const response = await organizerService.getOrganizerEvents({
              page,
              limit: 20,
            });

            const payload: any = response.data;
            const pageEvents: GetEventResponse[] =
              Array.isArray(payload?.data?.data) ? payload.data.data :
              Array.isArray(payload?.data) ? payload.data :
              Array.isArray(payload) ? payload :
              [];

            allEvents = [...allEvents, ...pageEvents];

            totalPages = payload?.meta?.totalPages
              ?? payload?.data?.meta?.totalPages
              ?? totalPages;

            page += 1;
          } while (page <= totalPages);

          setEvents(allEvents);
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
          filtered = filtered.filter((eventSpeaker) =>
            eventSpeaker.speaker?.type === selectedType
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
                {event.title} - {new Date(event.startTime).toLocaleDateString('vi-VN')}
              </option>
            ))
          )}
        </select>
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
      )
    }
    </div>
  );
}



export default SpeakerManagementPage
