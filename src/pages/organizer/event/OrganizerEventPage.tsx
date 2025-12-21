import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { eventService } from "../../../services";
import { toast } from "react-toastify";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Users,
  Grid3x3,
  UserCheck,
  UsersRound,
  FileText,
  Video,
  Tag,
  ExternalLink,
} from "lucide-react";

const OrganizerEventPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEventDetail = async () => {
      console.group("🔍 FETCH EVENT DETAIL");
      console.log("1. URL Param ID:", id);

      if (!id) {
        console.error("❌ No event ID in URL");
        toast.error("Không tìm thấy ID sự kiện");
        navigate("/organizer/events");
        return;
      }

      console.log("2. ✅ Fetching event with ID:", id);

      try {
        setIsLoading(true);

        const response = await eventService.getEventById(id);

        console.log("3. API Response:", response);

        const eventData = response.data?.data || response.data;

        console.log("4. Extracted event data:", eventData);

        if (!eventData || !eventData.id) {
          console.error("Invalid event data structure");
          toast.error("Dữ liệu sự kiện không hợp lệ");
          return;
        }

        // Normalise speakers (API may return speakers / speaker / eventSpeakers as string | object | array)
        const rawSpeakers =
          eventData.speakers ??
          eventData.speaker ??
          eventData.eventSpeakers ??
          eventData.event_speakers ??
          [];

        const speakers = (
          Array.isArray(rawSpeakers) ? rawSpeakers : [rawSpeakers]
        )
          .map((s: any) => {
            if (!s) return null;
            if (typeof s === "string") return s;
            // common possible keys returned by API
            return (
              s.name ||
              s.fullName ||
              s.speakerName ||
              s.speaker?.name ||
              s.topic ||
              s.title ||
              String(s)
            );
          })
          .filter(Boolean);

        setEvent({ ...eventData, speakers });
      } catch (error: any) {
        console.error("❌ Error fetching event detail:", error);

        let errorMessage = "Không thể tải thông tin sự kiện";

        if (error.response?.status === 404) {
          errorMessage = "Không tìm thấy sự kiện";
        } else if (error.response?.status === 403) {
          errorMessage = "Bạn không có quyền xem sự kiện này";
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }

        toast.error(errorMessage);

        setTimeout(() => {
          navigate("/organizer/events");
        }, 2000);
      } finally {
        setIsLoading(false);
        console.groupEnd();
      }
    };

    fetchEventDetail();
  }, [id, navigate]);

  console.log("event", event);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải thông tin sự kiện...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Không tìm thấy sự kiện
          </h3>
          <button
            onClick={() => navigate("/organizer/events")}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
          >
            Quay lại danh sách
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header với Back Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate("/organizer/events")}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} className="text-gray-700" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
          <p className="text-sm text-gray-600">Chi tiết và quản lý sự kiện</p>
        </div>
      </div>

      {/* Banner Section */}
      <div
        className="relative h-64 rounded-2xl overflow-hidden shadow-lg"
        style={{
          backgroundImage: event.bannerUrl
            ? `url(${event.bannerUrl})`
            : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Calendar size={24} />
            <h1 className="text-3xl font-bold">{event.title}</h1>
          </div>
          <p className="text-white/90 text-lg max-w-3xl">{event.description}</p>
        </div>
      </div>

      {/* Thông tin chi tiết Card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Thông tin chi tiết
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Cột trái */}
          <div className="space-y-6">
            {/* Category */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Loại sự kiện</p>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Tag size={20} className="text-indigo-600" />
                </div>
                <p className="text-base font-semibold text-gray-900">
                  {event.category || event.eventType || "Chưa xác định"}
                </p>
              </div>
            </div>

            {/* Ngày bắt đầu */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Ngày bắt đầu</p>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Calendar size={20} className="text-orange-600" />
                </div>
                <p className="text-base font-semibold text-gray-900">
                  {new Date(event.startTime || event.startDate).toLocaleString(
                    "vi-VN",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    }
                  )}
                </p>
              </div>
            </div>

            {/* Ngày mở đăng ký - CHỈ OFFLINE */}
            {event.venue && event.startTimeRegister && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Ngày mở đăng ký</p>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-cyan-100 rounded-lg">
                    <Calendar size={20} className="text-cyan-600" />
                  </div>
                  <p className="text-base font-semibold text-gray-900">
                    {new Date(event.startTimeRegister).toLocaleString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Địa điểm / Link Online */}
            {event.isOnline || event.onlineMeetingUrl ? (
              <div>
                <p className="text-sm text-gray-500 mb-2">Link họp online</p>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Video size={20} className="text-blue-600" />
                  </div>
                  {event.onlineMeetingUrl ? (
                    <a
                      href={event.onlineMeetingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-2 group"
                    >
                      <span className="truncate max-w-md">
                        {(() => {
                          const url = event.onlineMeetingUrl || "";
                          const meetMatch = url.match(
                            /meet\.google\.com\/([a-z-]+)/i
                          );
                          if (meetMatch) {
                            return `meet.google.com/${meetMatch[1]}`;
                          }
                          try {
                            const urlObj = new URL(url);
                            return urlObj.hostname.replace("www.", "");
                          } catch {
                            return url.length > 30
                              ? `${url.substring(0, 27)}...`
                              : url;
                          }
                        })()}
                      </span>
                      <ExternalLink
                        size={16}
                        className="text-blue-500 group-hover:text-blue-600 flex-shrink-0"
                      />
                    </a>
                  ) : (
                    <p className="text-base font-semibold text-gray-900">
                      Trực tuyến
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div>
                <p className="text-sm text-gray-500 mb-2">Địa điểm</p>
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <MapPin size={20} className="text-blue-600" />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-base font-semibold text-gray-900">
                      {event.venue?.name || event.venueName || "Chưa xác định"}
                    </p>
                    {event.venue?.location && (
                      <p className="text-sm text-gray-600 mt-1">
                        {event.venue.location}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Số lượng tham gia */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Số lượng tham gia</p>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users size={20} className="text-green-600" />
                </div>
                <p className="text-base font-semibold text-gray-900">
                  {event.registeredCount || 0}/
                  {event.maxCapacity || event.maxParticipants || 0} người
                </p>
              </div>
            </div>
          </div>

          {/* Cột phải */}
          <div className="space-y-6">
            {/* Ngày kết thúc */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Ngày kết thúc</p>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Calendar size={20} className="text-purple-600" />
                </div>
                <p className="text-base font-semibold text-gray-900">
                  {new Date(event.endTime || event.endDate).toLocaleString(
                    "vi-VN",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    }
                  )}
                </p>
              </div>
            </div>

            {/* Ngày kết thúc đăng ký - CHỈ OFFLINE */}
            {event.venue && event.endTimeRegister && (
              <div>
                <p className="text-sm text-gray-500 mb-2">
                  Ngày kết thúc đăng ký
                </p>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-pink-100 rounded-lg">
                    <Calendar size={20} className="text-pink-600" />
                  </div>
                  <p className="text-base font-semibold text-gray-900">
                    {new Date(event.endTimeRegister).toLocaleString("vi-VN", {
                      hour: "2-digit",
                      minute: "2-digit",
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
            )}

            {/* Campus - Chỉ hiển thị nếu không phải online */}
            {!event.isOnline && !event.onlineMeetingUrl && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Campus</p>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <MapPin size={20} className="text-indigo-600" />
                  </div>
                  <p className="text-base font-semibold text-gray-900">
                    {event.venue?.campus?.name ||
                      event.campusName ||
                      "FU - Hồ Chí Minh"}
                  </p>
                </div>
              </div>
            )}

            {/* Trạng thái */}
            <div>
              <p className="text-sm text-gray-500 mb-2">Trạng thái</p>
              <div className="flex items-center gap-3">
                <span
                  className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold ${
                    event.status === "PUBLISHED" || event.status === "APPROVED"
                      ? "bg-green-100 text-green-800"
                      : event.status === "PENDING"
                      ? "bg-yellow-100 text-yellow-800"
                      : event.status === "CANCELED"
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {event.status === "PUBLISHED"
                    ? "Đã duyệt"
                    : event.status === "APPROVED"
                    ? "Đã duyệt"
                    : event.status === "PENDING"
                    ? "Đang xử lý"
                    : event.status === "CANCELED"
                    ? "Bị từ chối "
                    : event.status}
                </span>
              </div>
            </div>
          </div>
          {/* Diễn giả - Styled cards similar to ListEventPage (span full width of info card) */}
          <div className="md:col-span-2 w-full">
            <p className="text-sm text-gray-500 mb-3">Diễn giả</p>
            {(() => {
              // normalize to array of { id?, speaker: { name, avatar, company, bio }, topic? }
              const raw =
                event.eventSpeakers ??
                event.event_speakers ??
                event.speakers ??
                [];
              const list = Array.isArray(raw)
                ? raw.map((it: any) => {
                    if (it && it.speaker) return it;
                    if (typeof it === "string")
                      return { speaker: { name: it } };
                    if (it && it.name) return { speaker: it };
                    return { speaker: it };
                  })
                : [];

              if (list.length === 0) {
                return (
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <Users size={20} className="text-indigo-600" />
                    </div>
                    <p className="text-gray-500">Chưa có thông tin diễn giả</p>
                  </div>
                );
              }

              return (
                <div className="bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 rounded-xl p-4 border border-indigo-200 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 bg-indigo-500 rounded-lg">
                        <Users size={16} className="text-white" />
                      </div>
                      <h3 className="text-base font-bold text-indigo-900">
                        Diễn giả
                      </h3>
                    </div>
                    <span className="px-3 py-1 bg-indigo-500 text-white text-xs font-bold rounded-full">
                      {list.length}
                    </span>
                  </div>

                  {/* responsive grid: always max 3 columns on md+; ensure equal heights */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 items-stretch auto-rows-fr">
                    {list.map((es: any, idx: number) => {
                      const sp = es.speaker || {};
                      const name = sp.name || sp.fullName || "Không tên";
                      const avatar = sp.avatar || sp.image || null;
                      const company = sp.company || sp.org || "";
                      const topic =
                        es.topic || es.topicName || sp.topic || null;
                      const bio = sp.bio || sp.description || "";

                      return (
                        <div
                          key={es.id ?? idx}
                          className="bg-white rounded-xl p-4 border border-gray-200 hover:border-indigo-300 hover:shadow-lg transition-all flex flex-col h-full min-h-[160px]"
                        >
                          <div className="flex items-start gap-4">
                            {avatar ? (
                              <img
                                src={avatar}
                                alt={name}
                                className="w-14 h-14 rounded-full object-cover flex-shrink-0 border-2 border-indigo-100 shadow-sm"
                                onError={(e) => {
                                  const t = e.target as HTMLImageElement;
                                  t.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                                    name
                                  )}&background=6366F1&color=fff&size=128`;
                                }}
                              />
                            ) : (
                              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg flex-shrink-0 border-2 border-indigo-100 shadow-sm">
                                {name.charAt(0).toUpperCase()}
                              </div>
                            )}

                            <div className="flex-1 min-w-0 flex flex-col">
                              <div>
                                <p className="font-bold text-base text-gray-900 mb-1">
                                  {name}
                                </p>
                                {company && (
                                  <p className="text-sm text-gray-600 mb-2">
                                    {company}
                                  </p>
                                )}
                                {topic && (
                                  <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-3 py-2 mb-2 inline-block">
                                    <p className="text-xs text-indigo-700 font-semibold">
                                      📚 {topic}
                                    </p>
                                  </div>
                                )}
                              </div>

                              {/* push bio to bottom so cards align visually */}
                              {bio && (
                                <p className="text-xs text-gray-600 leading-relaxed mt-auto line-clamp-3">
                                  {bio}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>

      {/* ✅ Action Cards Grid - ĐÚNG ROUTES */}
      <div
        className={`grid grid-cols-1 md:grid-cols-2 ${
          event.isOnline || event.onlineMeetingUrl
            ? "lg:grid-cols-3"
            : "lg:grid-cols-4"
        } gap-6`}
      >
        {/* Sơ đồ ghế - Chỉ hiển thị nếu không phải online */}
        {!event.isOnline && !event.onlineMeetingUrl && (
          <button
            onClick={() => {
              const venueId = event.venue?.id || event.venueId;
              if (!venueId) {
                toast.error("Chưa có thông tin địa điểm");
                return;
              }
              console.log("Navigate to seating:", {
                eventId: event.id,
                venueId,
              });
              navigate(`/organizer/events/${event.id}/seats/${venueId}`);
            }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all text-left group"
          >
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                <Grid3x3 size={24} className="text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-1">Sơ đồ ghế</h3>
                <p className="text-sm text-gray-500">Phân bổ & đặt trước</p>
              </div>
            </div>
          </button>
        )}

        {/* ✅ Người tham dự - SỬA: /organizer/attendees */}
        <button
          onClick={() => {
            console.log("Navigate to attendees with eventId:", event.id);
            navigate("/organizer/attendees", {
              state: {
                eventId: event.id,
                eventTitle: event.title,
                fromEventDetail: true,
              },
            });
          }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
              <UsersRound size={24} className="text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Người tham dự
              </h3>
              <p className="text-sm text-gray-500">
                {event.registeredCount || 0} người
              </p>
            </div>
          </div>
        </button>

        {/* ✅ Staff - SỬA: /organizer/staff */}
        <button
          onClick={() => {
            console.log("Navigate to staff with eventId:", event.id);
            navigate("/organizer/staff", {
              state: {
                eventId: event.id,
                eventTitle: event.title,
                fromEventDetail: true,
              },
            });
          }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
              <UserCheck size={24} className="text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Nhân viên sự kiện
              </h3>
              <p className="text-sm text-gray-500">Quản lý nhân sự</p>
            </div>
          </div>
        </button>

        {/* ✅ Báo cáo - SỬA: /organizer/reports */}
        <button
          onClick={() => {
            console.log("Navigate to reports with eventId:", event.id);
            navigate("/organizer/reports", {
              state: {
                eventId: event.id,
                eventTitle: event.title,
                fromEventDetail: true,
              },
            });
          }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 rounded-lg group-hover:bg-orange-200 transition-colors">
              <FileText size={24} className="text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">Báo cáo</h3>
              <p className="text-sm text-gray-500">Tải báo cáo</p>
            </div>
          </div>
        </button>
      </div>

      {/* Nút Chỉnh sửa ở dưới
      <div className="flex justify-start">
        <button
          onClick={() => navigate(`/organizer/events/edit/${event.id}`)}
          className="flex items-center gap-2 px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
        >
          <Edit size={20} />
          Chỉnh sửa
        </button>
      </div> */}
    </div>
  );
};

export default OrganizerEventPage;
