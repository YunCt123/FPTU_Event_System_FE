import React, { useEffect, useState } from "react";
import {
  X,
  Users,
  FileText,
  Tag,
  Image as ImageIcon,
  Link as LinkIcon,
  Clock,
  UserPlus,
  Upload,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import { vi } from "date-fns/locale/vi";
registerLocale("vi", vi);

import { toast } from "react-toastify";
import { eventService, organizerService, speakerService } from "../../../services";
import { uploadImageToCloudinary } from "../../../utils/uploadImg";
import type {
  BookingOnlineRequest,
  BookingOnlineResponse,
  organizer,
  eventSpeaker,
} from "../../../types/Event";
import type { User } from "../../../types/User";
import type { SpeakerResponse } from "../../../types/Speaker";

interface Props {
  event?: any | null; // optional edit mode, match backend shape if provided
  onClose: () => void;
  onSuccess: (data: BookingOnlineResponse) => void;
  onOpenOther?: (type: "offline" | "weekly" | "online") => void;
}

const EventFormModalOnline: React.FC<Props> = ({ event, onClose, onSuccess, onOpenOther }) => {
  const storedUserId = Number(localStorage.getItem("userId") || sessionStorage.getItem("userId") || 0) || 0;

  const [organizers, setOrganizers] = useState<organizer[]>([]);
  const [staffList, setStaffList] = useState<User[]>([]);
  const [speakers, setSpeakers] = useState<SpeakerResponse[]>([]);
  const [currentSpeakerPage, setCurrentSpeakerPage] = useState(1);
  const [totalSpeakerPages, setTotalSpeakerPages] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [bannerPreview, setBannerPreview] = useState<string>("");
  const [isLoadingOrganizers, setIsLoadingOrganizers] = useState(false);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [isLoadingSpeakers, setIsLoadingSpeakers] = useState(false);
  const [selectedSpeakerType, setSelectedSpeakerType] = useState<"internal" | "external" | "">("");

  const [form, setForm] = useState<BookingOnlineRequest>({
    title: "",
    description: "",
    category: "",
    bannerUrl: "",
    startTime: "",
    endTime: "",
    organizerId: 0,
    hostId: storedUserId || 1,
    staffIds: [],
    speakers: [],
    isOnline: true,
    onlineMeetingUrl: "",
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [originalData, setOriginalData] = useState<BookingOnlineRequest | null>(null);

  useEffect(() => {
    const init = async () => {
      setIsLoadingOrganizers(true);
      try {
        const orgRes: any = await organizerService.getAllOrganizers();
        const orgData = orgRes?.data?.data ?? orgRes?.data ?? orgRes;
        setOrganizers(Array.isArray(orgData) ? orgData : []);
        
        // Auto-select first organizer if creating new event
        if (!event && Array.isArray(orgData) && orgData.length > 0) {
          setForm(prev => ({ ...prev, organizerId: orgData[0].id }));
        }
      } catch (e) {
        console.error("Fetch organizers failed", e);
        toast.error("Không thể tải danh sách organizer");
      } finally {
        setIsLoadingOrganizers(false);
      }
    };
    init();
  }, [event]);

  useEffect(() => {
    const fetchEventDetails = async () => {
      if (event) {
        try {
          // Fetch full event details
          const response = await eventService.getEventById(String(event.id));
          const fullEvent = response.data?.data || response.data;
          
          console.log("Full online event details:", fullEvent);
          
          const formattedData = {
            title: fullEvent?.title ?? "",
            description: fullEvent?.description ?? "",
            category: fullEvent?.category ?? "",
            bannerUrl: fullEvent?.bannerUrl ?? "",
            startTime: fullEvent?.startTime ?? "",
            endTime: fullEvent?.endTime ?? "",
            organizerId: fullEvent?.organizerId ?? 0,
            hostId: fullEvent?.hostId ?? (storedUserId || 1),
            staffIds: (fullEvent?.eventStaffs ?? []).map((s: any) => s.userId) as number[],
            speakers: (fullEvent?.eventSpeakers ?? []).map((s: any) => ({
              speakerId: s.speakerId,
              topic: s.topic,
            })),
            isOnline: true,
            onlineMeetingUrl: (fullEvent as any)?.onlineMeetingUrl ?? "",
          };
          
          setForm(formattedData);
          setOriginalData(formattedData);
          
          // Set banner preview
          if (formattedData.bannerUrl) {
            setBannerPreview(formattedData.bannerUrl);
          }
        } catch (error) {
          console.error("Error fetching event details:", error);
          // Fallback to event prop
          const ev = event?.event ?? event;
          const fallbackData = {
            title: ev?.title ?? "",
            description: ev?.description ?? "",
            category: ev?.category ?? "",
            bannerUrl: ev?.bannerUrl ?? "",
            startTime: ev?.startTime ?? "",
            endTime: ev?.endTime ?? "",
            organizerId: ev?.organizerId ?? 0,
            hostId: ev?.hostId ?? (storedUserId || 1),
            staffIds: (ev?.eventStaffs ?? ev?.staffIds ?? []).map((s: any) => s.userId ?? s) as number[],
            speakers: (ev?.eventSpeakers ?? ev?.speakers ?? []).map((s: any) => ({
              speakerId: s.speakerId ?? s.id,
              topic: s.topic ?? s.topic,
            })),
            isOnline: true,
            onlineMeetingUrl: ev?.onlineMeetingUrl ?? "",
          };
          setForm(fallbackData);
          setOriginalData(fallbackData);
          if (fallbackData.bannerUrl) {
            setBannerPreview(fallbackData.bannerUrl);
          }
        }
      } else {
        // Reset form for new event
        setBannerPreview('');
        setOriginalData(null);
      }
    };
    
    fetchEventDetails();
  }, [event, storedUserId]);

  // fetch staff for selected organizer
  useEffect(() => {
    const fetchStaff = async () => {
      if (!form.organizerId) return;
      
      setIsLoadingStaff(true);
      try {
        const res: any = await organizerService.getStaffEvent({
          isActive: true,
        });
        const data = res?.data?.data ?? res?.data ?? res;
        setStaffList(Array.isArray(data) ? data : []);
      } catch (e) {
        console.error("fetch staff failed", e);
      } finally {
        setIsLoadingStaff(false);
      }
    };
    fetchStaff();
  }, [form.organizerId]);

  const fetchSpeakers = async (page: number, append: boolean = false) => {
    setIsLoadingSpeakers(true);
    try {
      const params: any = {
        page,
        limit: 10,
      };
      
      if (selectedSpeakerType) {
        params.type = selectedSpeakerType;
      }

      const response = await speakerService.getAllSpeaker(params);
      console.log("object", response);
      if (response.status === 200) {
        const getAllSpeakerData = response.data.data; 
        const newSpeakers = getAllSpeakerData; 
        const meta = response.data.meta;
        
        if (append) {
          setSpeakers(prev => [...prev, ...newSpeakers]);
        } else {
          setSpeakers(newSpeakers);
        }
        
        setTotalSpeakerPages(meta.totalPages);
        setCurrentSpeakerPage(page);
      }
    } catch (err: any) {
      console.error("Failed to fetch speakers", err);
      toast.error("Có lỗi khi tải danh sách speaker");
    } finally {
      setIsLoadingSpeakers(false);
    }
  };

  const handleLoadMoreSpeakers = () => {
    if (currentSpeakerPage < totalSpeakerPages) {
      fetchSpeakers(currentSpeakerPage + 1, true);
    }
  };

  useEffect(() => {
    fetchSpeakers(1, false);
  }, [selectedSpeakerType]);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Vui lòng chọn file ảnh');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Kích thước ảnh không được vượt quá 5MB');
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setBannerPreview(objectUrl);

    setIsUploadingBanner(true);
    try {
      const imageUrl = await uploadImageToCloudinary(file);
      setForm(prev => ({ ...prev, bannerUrl: imageUrl }));
      toast.success('Tải ảnh lên thành công!');
      if (errors.bannerUrl) {
        setErrors(prev => ({ ...prev, bannerUrl: '' }));
      }
    } catch (err: any) {
      toast.error('Có lỗi xảy ra khi tải ảnh lên');
      console.error('Error uploading banner:', err);
      setBannerPreview('');
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleRemoveBanner = () => {
    if (bannerPreview) {
      URL.revokeObjectURL(bannerPreview);
    }
    setBannerPreview('');
    setForm(prev => ({ ...prev, bannerUrl: '' }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: name === "organizerId" || name === "hostId" ? Number(value) : value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleDateChange = (name: "startTime" | "endTime", date: Date | null) => {
    setForm((p) => ({ ...p, [name]: date ? date.toISOString() : "" }));
  };

  const toggleStaff = (id: number) => {
    setForm((p) => ({
      ...p,
      staffIds: p.staffIds && p.staffIds.includes(id) ? p.staffIds.filter((x) => x !== id) : [...(p.staffIds || []), id],
    }));
  };

  const addSpeaker = () => {
    setForm((p) => ({ ...p, speakers: [...(p.speakers || []), { speakerId: 0, topic: "" }] }));
  };
  const updateSpeaker = (idx: number, key: keyof eventSpeaker | "topic", value: any) => {
    setForm((p) => {
      const s = [...(p.speakers || [])];
      s[idx] = { ...(s[idx] as any), [key]: key === "speakerId" ? Number(value) : value } as any;
      return { ...p, speakers: s };
    });
  };
  const removeSpeaker = (idx: number) => {
    setForm((p) => ({ ...p, speakers: (p.speakers || []).filter((_, i) => i !== idx) }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    
    if (!form.title.trim()) {
      e.title = "Vui lòng nhập tiêu đề";
    }
    
    if (!form.description.trim()) {
      e.description = "Vui lòng nhập mô tả";
    }
    
    if (!form.category?.trim()) {
      e.category = "Vui lòng chọn danh mục";
    }
    
    if (!form.startTime) {
      e.startTime = "Chọn thời gian bắt đầu";
    }
    
    if (!form.endTime) {
      e.endTime = "Chọn thời gian kết thúc";
    }
    
    if (form.startTime && form.endTime) {
      if (new Date(form.endTime) <= new Date(form.startTime)) {
        e.endTime = "Thời gian kết thúc phải sau thời gian bắt đầu";
      }
    }
    
    if (!form.organizerId || form.organizerId <= 0) {
      e.organizerId = "Chọn organizer";
    }
    
    if (!form.onlineMeetingUrl?.trim()) {
      e.onlineMeetingUrl = "Vui lòng nhập link họp online";
    }
    
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev?: React.FormEvent) => {
    ev?.preventDefault();
    if (!validate()) {
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }
    
    setIsSubmitting(true);
    try {
      if (event && originalData) {
        // UPDATE MODE
        const updateData: any = {};
        
        // Chỉ gửi các field đã thay đổi
        if (form.title !== originalData.title) updateData.title = form.title;
        if (form.description !== originalData.description) updateData.description = form.description;
        if (form.category !== originalData.category) updateData.category = form.category;
        if (form.bannerUrl !== originalData.bannerUrl) updateData.bannerUrl = form.bannerUrl;
        if (form.startTime !== originalData.startTime) updateData.startTime = form.startTime;
        if (form.endTime !== originalData.endTime) updateData.endTime = form.endTime;
        if (form.onlineMeetingUrl !== originalData.onlineMeetingUrl) updateData.onlineMeetingUrl = form.onlineMeetingUrl;
        
        if (Object.keys(updateData).length === 0) {
          toast.info("Không có thay đổi nào để lưu");
          onClose();
          return;
        }
        
        console.log("Updating online event:", updateData);
        
        const res = await eventService.patchEventById({
          id: String(event.id),
          data: updateData,
        });
        
        toast.success("Cập nhật sự kiện online thành công!");
        const data = (res as any)?.data ?? res;
        onSuccess(data as BookingOnlineResponse);
        onClose();
      } else {
        // CREATE MODE
        const payload: BookingOnlineRequest = {
          title: form.title,
          description: form.description,
          category: form.category || undefined,
          bannerUrl: form.bannerUrl || undefined,
          startTime: form.startTime,
          endTime: form.endTime,
          organizerId: form.organizerId,
          hostId: form.hostId,
          staffIds: form.staffIds,
          speakers: form.speakers?.map((s: any) => ({ speakerId: Number(s.speakerId), topic: s.topic })) || [],
          isOnline: true,
          onlineMeetingUrl: form.onlineMeetingUrl,
        };
        
        console.log("Creating online event:", payload);
        
        const res = await eventService.bookingOnline(payload);
        toast.success("Tạo sự kiện online thành công!");
        const data = (res as any)?.data ?? res;
        onSuccess(data as BookingOnlineResponse);
        onClose();
      }
    } catch (error: any) {
      console.error("Online event error:", error);
      const errorMsg = error?.response?.data?.message || 
                       error?.response?.data?.data?.message ||
                       (event ? "Lỗi khi cập nhật sự kiện" : "Lỗi khi tạo sự kiện");
      toast.error(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <LinkIcon className="text-white" size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {event ? "Chỉnh sửa Event Online" : "Tạo Event Online"}
              </h2>
              <p className="text-white/90 text-sm mt-1">
                {event ? "Cập nhật thông tin sự kiện trực tuyến" : "Tạo sự kiện dạng trực tuyến"}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            type="button"
            aria-label="Đóng modal"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-6">
            {/* Loading State */}
            {isLoadingOrganizers && (
              <div className="mb-4 p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-sm text-blue-700">Đang tải thông tin organizer...</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Tiêu đề */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                    <FileText size={16} className="text-orange-500" />
                    Tiêu đề <span className="text-red-500">*</span>
                  </label>
                  <input 
                    name="title" 
                    value={form.title} 
                    onChange={handleChange}
                    placeholder="Nhập tiêu đề sự kiện..."
                    className={`w-full px-4 py-3 border ${errors.title ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
                    disabled={isSubmitting}
                  />
                  {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
                </div>

                {/* Danh mục */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                    <Tag size={16} className="text-orange-500" />
                    Loại sự kiện <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={form.category}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border ${errors.category ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
                    disabled={isSubmitting}
                    aria-label="Chọn loại sự kiện"
                  >
                    <option value="">Chọn loại sự kiện</option>
                    <option value="Technology">Technology</option>
                    <option value="Career">Career</option>
                    <option value="Startup">Startup</option>
                    <option value="Community">Community</option>
                    <option value="Education">Education</option>
                    <option value="Networking">Networking</option>
                    <option value="Competition">Competition</option>
                    <option value="Data">Data</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Seminar">Seminar</option>
                  </select>
                  {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category}</p>}
                </div>

                {/* Mô tả */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                    <FileText size={16} className="text-orange-500" />
                    Mô tả <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    name="description" 
                    value={form.description} 
                    onChange={handleChange}
                    rows={5}
                    placeholder="Nhập mô tả chi tiết về sự kiện..."
                    className={`w-full px-4 py-3 border ${errors.description ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-all`}
                    disabled={isSubmitting}
                  />
                  {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
                </div>

                {/* Banner Upload */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                    <ImageIcon size={16} className="text-orange-500" />
                    Banner sự kiện
                  </label>
                  
                  {bannerPreview && (
                    <div className="mb-3 relative">
                      <img
                        src={bannerPreview}
                        alt="Banner preview"
                        className="w-full h-48 object-cover rounded-lg border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveBanner}
                        disabled={isUploadingBanner}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition-colors"
                        aria-label="Xóa banner"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}

                  <label
                    htmlFor="banner-online"
                    className={`flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed ${
                      errors.bannerUrl ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg cursor-pointer hover:border-orange-500 transition-all ${
                      isUploadingBanner || isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    <Upload size={20} className="text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {isUploadingBanner ? 'Đang tải lên...' : bannerPreview ? 'Thay đổi ảnh' : 'Chọn ảnh banner'}
                    </span>
                    <input
                      type="file"
                      id="banner-online"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      disabled={isUploadingBanner || isSubmitting}
                      className="hidden"
                    />
                  </label>
                  
                  {errors.bannerUrl && <p className="text-xs text-red-500 mt-1">{errors.bannerUrl}</p>}
                  <p className="text-xs text-gray-500 mt-1">Kích thước tối đa: 5MB. Định dạng: JPG, PNG, GIF</p>
                </div>

                {/* Organizer */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                    <Users size={16} className="text-orange-500" />
                    Organizer <span className="text-red-500">*</span>
                  </label>
                  <select 
                    name="organizerId" 
                    value={form.organizerId} 
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border ${errors.organizerId ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
                    disabled={isSubmitting || isLoadingOrganizers}
                    aria-label="Chọn organizer"
                  >
                    <option value={0}>Chọn organizer...</option>
                    {organizers.map((o) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </select>
                  {errors.organizerId && <p className="text-xs text-red-500 mt-1">{errors.organizerId}</p>}
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Thời gian */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                      <Clock size={16} className="text-orange-500" />
                      Bắt đầu <span className="text-red-500">*</span>
                    </label>
                    <DatePicker 
                      selected={form.startTime ? new Date(form.startTime) : null} 
                      onChange={(d) => handleDateChange("startTime", d)}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="dd/MM/yyyy HH:mm"
                      locale="vi"
                      placeholderText="Chọn thời gian"
                      className={`w-full px-4 py-3 border ${errors.startTime ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                      disabled={isSubmitting}
                    />
                    {errors.startTime && <p className="text-xs text-red-500 mt-1">{errors.startTime}</p>}
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                      <Clock size={16} className="text-orange-500" />
                      Kết thúc <span className="text-red-500">*</span>
                    </label>
                    <DatePicker 
                      selected={form.endTime ? new Date(form.endTime) : null} 
                      onChange={(d) => handleDateChange("endTime", d)}
                      showTimeSelect
                      timeFormat="HH:mm"
                      timeIntervals={15}
                      dateFormat="dd/MM/yyyy HH:mm"
                      locale="vi"
                      placeholderText="Chọn thời gian"
                      className={`w-full px-4 py-3 border ${errors.endTime ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent`}
                      disabled={isSubmitting}
                    />
                    {errors.endTime && <p className="text-xs text-red-500 mt-1">{errors.endTime}</p>}
                  </div>
                </div>

                {/* Link họp online */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                    <LinkIcon size={16} className="text-orange-500" />
                    Link họp online <span className="text-red-500">*</span>
                  </label>
                  <input 
                    name="onlineMeetingUrl" 
                    value={form.onlineMeetingUrl} 
                    onChange={handleChange}
                    placeholder="https://meet.google.com/..."
                    className={`w-full px-4 py-3 border ${errors.onlineMeetingUrl ? "border-red-500" : "border-gray-300"} rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
                    disabled={isSubmitting}
                  />
                  {errors.onlineMeetingUrl && <p className="text-xs text-red-500 mt-1">{errors.onlineMeetingUrl}</p>}
                </div>

                {/* Nhân sự hỗ trợ */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                    <UserPlus size={16} className="text-orange-500" />
                    Nhân sự hỗ trợ
                  </label>
                  <div className="border border-gray-200 rounded-lg max-h-48 overflow-auto">
                    {isLoadingStaff ? (
                      <p className="text-sm text-gray-500 p-4 text-center">Đang tải nhân sự...</p>
                    ) : staffList.length === 0 ? (
                      <p className="text-sm text-gray-500 p-4 text-center">Không có nhân sự</p>
                    ) : (
                      staffList.map(s => (
                        <label key={s.id} className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer transition-colors border-b last:border-b-0">
                          <input 
                            type="checkbox" 
                            checked={form.staffIds?.includes(s.id)} 
                            onChange={() => toggleStaff(s.id)}
                            className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">
                              {s.firstName} {s.lastName}
                            </div>
                            <div className="text-xs text-gray-500">{s.email}</div>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                  {form.staffIds && form.staffIds.length > 0 && (
                    <p className="text-xs text-gray-600 mt-2">
                      Đã chọn {form.staffIds.length} nhân viên
                    </p>
                  )}
                </div>

                {/* Speakers (Optional) */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                    <Users size={16} className="text-orange-500" />
                    Diễn giả (tùy chọn)
                  </label>

                  {/* Speaker Type Filter */}
                  <div className="mb-3">
                    <select
                      value={selectedSpeakerType}
                      onChange={(e) => setSelectedSpeakerType(e.target.value as "internal" | "external" | "")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                      disabled={isLoadingSpeakers}
                      aria-label="Lọc loại speaker"
                    >
                      <option value="">Tất cả loại speaker</option>
                      <option value="internal">Nội bộ</option>
                      <option value="external">Bên ngoài</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    {(form.speakers || []).map((sp, idx) => (
                      <div key={idx} className="p-3 border border-gray-200 rounded-lg space-y-2 bg-gray-50">
                        <div className="flex gap-2">
                          <select
                            value={(sp as any).speakerId || ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === "load_more") {
                                handleLoadMoreSpeakers();
                              } else {
                                updateSpeaker(idx, "speakerId", value);
                              }
                            }}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500"
                            disabled={isLoadingSpeakers}
                            aria-label="Chọn speaker cho sự kiện"
                          >
                            <option value="">-- Chọn speaker --</option>
                            {speakers.map((speaker) => (
                              <option key={speaker.id} value={speaker.id}>
                                {speaker.name} - {speaker.company} ({speaker.type})
                              </option>
                            ))}
                            {currentSpeakerPage < totalSpeakerPages && (
                              <option value="load_more" className="font-semibold text-blue-600">
                                Tải thêm speaker (Trang {currentSpeakerPage + 1}/{totalSpeakerPages})
                              </option>
                            )}
                          </select>
                          <button 
                            type="button" 
                            onClick={() => removeSpeaker(idx)}
                            className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                            aria-label="Xóa diễn giả"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <textarea
                          value={(sp as any).topic || ""}
                          onChange={(e) => updateSpeaker(idx, "topic", e.target.value)}
                          placeholder="Nhập chủ đề mà speaker sẽ trình bày..."
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 resize-none"
                        />
                        {(sp as any).speakerId && speakers.find(s => s.id === (sp as any).speakerId) && (
                          <div className="flex items-center gap-2 text-xs text-gray-600 bg-blue-50 p-2 rounded">
                            {speakers.find(s => s.id === (sp as any).speakerId)?.avatar && (
                              <img
                                src={speakers.find(s => s.id === (sp as any).speakerId)?.avatar}
                                alt="Speaker"
                                className="h-8 w-8 rounded-full object-cover"
                              />
                            )}
                            <div>
                              <p className="font-medium">{speakers.find(s => s.id === (sp as any).speakerId)?.name}</p>
                              <p className="text-gray-500">{speakers.find(s => s.id === (sp as any).speakerId)?.company}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                    <button 
                      type="button" 
                      onClick={addSpeaker}
                      className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                      disabled={isLoadingSpeakers}
                    >
                      + Thêm diễn giả
                    </button>
                    {isLoadingSpeakers && (
                      <p className="text-xs text-blue-600 text-center">Đang tải danh sách speaker...</p>
                    )}
                    {speakers.length > 0 && (
                      <p className="text-xs text-gray-500 text-center">
                        Đang hiển thị {speakers.length} speaker{currentSpeakerPage < totalSpeakerPages && ` - Còn ${totalSpeakerPages - currentSpeakerPage} trang nữa`}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-2xl flex-shrink-0">
            <button
              type="button"
              onClick={() => onOpenOther?.("weekly")}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium bg-white border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Lựa chọn khác
            </button>
            <button 
              type="button" 
              onClick={onClose} 
              disabled={isSubmitting}
              className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              disabled={isSubmitting || isUploadingBanner}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang xử lý...
                </>
              ) : (
                event ? "Cập nhật sự kiện" : "Tạo sự kiện"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventFormModalOnline;