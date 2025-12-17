import React, { useEffect, useState } from "react";
import {
  X,
  Calendar,
  Users,
  FileText,
  Tag,
  Image as ImageIcon,
  Link as LinkIcon,
  ClipboardSignature,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import { vi } from "date-fns/locale/vi";
registerLocale("vi", vi);

import { toast } from "react-toastify";
import { eventService, organizerService } from "../../../services";
import type {
  BookingOnlineRequest,
  BookingOnlineResponse,
  organizer,
  eventSpeaker,
} from "../../../types/Event";
import type { User } from "../../../types/User";

interface Props {
  event?: any | null; // optional edit mode, match backend shape if provided
  onClose: () => void;
  onSuccess: (data: BookingOnlineResponse) => void;
}

const EventFormModalOnline: React.FC<Props> = ({ event, onClose, onSuccess }) => {
  const storedUserId = Number(localStorage.getItem("userId") || sessionStorage.getItem("userId") || 0) || 0;

  const [organizers, setOrganizers] = useState<organizer[]>([]);
  const [staffList, setStaffList] = useState<User[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  useEffect(() => {
    const init = async () => {
      try {
        const orgRes: any = await organizerService.getAllOrganizers();
        const orgData = orgRes?.data?.data ?? orgRes?.data ?? orgRes;
        setOrganizers(Array.isArray(orgData) ? orgData : []);
      } catch (e) {
        console.error("Fetch organizers failed", e);
      }
    };
    init();
  }, []);

  useEffect(() => {
    if (event) {
      // prefill from swagger-like response or event object
      const ev = event?.event ?? event;
      setForm({
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
        isOnline: ev?.isOnline ?? true,
        onlineMeetingUrl: ev?.onlineMeetingUrl ?? "",
      });
    }
  }, [event, storedUserId]);

  // fetch staff for selected organizer (if organizerService supports)
  useEffect(() => {
    const fetchStaff = async () => {
      try {
        // if (!form.organizerId) return;
        const res: any = await organizerService.getStaffEvent();
        const data = res?.data?.data ?? res?.data ?? res;
        setStaffList(Array.isArray(data) ? data : []);
        console.log(data);
      } catch (e) {
        console.error("fetch staff failed", e);
      }
    };
    fetchStaff();
  }, [form.organizerId]);

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
      // @ts-ignore - speakerId type compatibility
      s[idx] = { ...(s[idx] as any), [key]: key === "speakerId" ? Number(value) : value } as any;
      return { ...p, speakers: s };
    });
  };
  const removeSpeaker = (idx: number) => {
    setForm((p) => ({ ...p, speakers: (p.speakers || []).filter((_, i) => i !== idx) }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title.trim()) e.title = "Vui lòng nhập tiêu đề";
    if (!form.description.trim()) e.description = "Vui lòng nhập mô tả";
    if (!form.startTime) e.startTime = "Chọn thời gian bắt đầu";
    if (!form.endTime) e.endTime = "Chọn thời gian kết thúc";
    if (!form.organizerId || form.organizerId <= 0) e.organizerId = "Chọn organizer";
    if (form.isOnline && !form.onlineMeetingUrl) e.onlineMeetingUrl = "Nhập link họp online";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev?: React.FormEvent) => {
    ev?.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
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
      const res = await eventService.bookingOnline(payload);
      toast.success("Tạo sự kiện online thành công");
      const data = (res as any)?.data ?? res;
      onSuccess(data as BookingOnlineResponse);
      onClose();
    } catch (error: any) {
      console.error("bookingOnline error", error);
      toast.error(error?.response?.data?.message || "Lỗi khi tạo sự kiện");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="shrink-0 from-orange-500 to-orange-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg"><Calendar className="text-white" size={20} /></div>
            <div>
              <h2 className="text-2xl font-bold text-white">{event ? "Chỉnh sửa Event Online" : "Tạo Event Online"}</h2>
              <p className="text-white/90 text-sm mt-1">Tạo/sửa sự kiện dạng trực tuyến</p>
            </div>
          </div>
          <button onClick={onClose} className="text-white hover:bg-white/20 p-2 rounded-lg"><X size={22} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold">Tiêu đề <span className="text-red-500">*</span></label>
              <input name="title" value={form.title} onChange={handleChange} className={`w-full mt-2 px-4 py-2 border rounded-lg ${errors.title ? "border-red-500" : "border-gray-300"}`} disabled={isSubmitting} />
              {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
            </div>

            <div>
              <label className="text-sm font-semibold">Mô tả <span className="text-red-500">*</span></label>
              <textarea name="description" value={form.description} onChange={handleChange} rows={5} className={`w-full mt-2 px-4 py-2 border rounded-lg ${errors.description ? "border-red-500" : "border-gray-300"}`} disabled={isSubmitting} />
            </div>

            <div>
              <label className="text-sm font-semibold">Danh mục</label>
              <input name="category" value={form.category} onChange={handleChange} className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg" disabled={isSubmitting} />
            </div>

            <div>
              <label className="text-sm font-semibold">Banner URL</label>
              <input name="bannerUrl" value={form.bannerUrl} onChange={handleChange} className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg" disabled={isSubmitting} />
            </div>

            <div>
              <label className="text-sm font-semibold">Organizer <span className="text-red-500">*</span></label>
              <select name="organizerId" value={form.organizerId} onChange={handleChange} className={`w-full mt-2 px-4 py-2 border rounded-lg ${errors.organizerId ? "border-red-500" : "border-gray-300"}`} disabled={isSubmitting}>
                <option value={0}>Chọn organizer...</option>
                {organizers.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
              {errors.organizerId && <p className="text-xs text-red-500 mt-1">{errors.organizerId}</p>}
            </div>

            <div>
              <label className="text-sm font-semibold">Host ID</label>
              <input name="hostId" type="number" value={form.hostId} onChange={handleChange} className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg" disabled={isSubmitting} />
            </div>

            <div>
              <label className="text-sm font-semibold">Nhân sự hỗ trợ</label>
              <div className="mt-2 border border-gray-200 rounded-lg max-h-48 overflow-auto p-2">
                {staffList.length === 0 ? <p className="text-sm text-gray-500">Không có nhân sự</p> : staffList.map(s => (
                  <label key={s.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded">
                    <input type="checkbox" checked={form.staffIds?.includes(s.id)} onChange={() => toggleStaff(s.id)} />
                    <div className="text-sm">{s.firstName} {s.lastName} • <span className="text-xs text-gray-500">{s.email}</span></div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold">Thời gian bắt đầu <span className="text-red-500">*</span></label>
                <DatePicker selected={form.startTime ? new Date(form.startTime) : null} onChange={(d) => handleDateChange("startTime", d)} showTimeSelect timeFormat="HH:mm" timeIntervals={15} dateFormat="dd/MM/yyyy HH:mm" locale="vi" className={`w-full mt-2 px-4 py-2 border rounded-lg ${errors.startTime ? "border-red-500" : "border-gray-300"}`} />
                {errors.startTime && <p className="text-xs text-red-500 mt-1">{errors.startTime}</p>}
              </div>

              <div>
                <label className="text-sm font-semibold">Thời gian kết thúc <span className="text-red-500">*</span></label>
                <DatePicker selected={form.endTime ? new Date(form.endTime) : null} onChange={(d) => handleDateChange("endTime", d)} showTimeSelect timeFormat="HH:mm" timeIntervals={15} dateFormat="dd/MM/yyyy HH:mm" locale="vi" className={`w-full mt-2 px-4 py-2 border rounded-lg ${errors.endTime ? "border-red-500" : "border-gray-300"}`} />
                {errors.endTime && <p className="text-xs text-red-500 mt-1">{errors.endTime}</p>}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold">Speakers</label>
              <div className="space-y-2 mt-2">
                {(form.speakers || []).map((sp, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    {/* @ts-ignore - speakerId type compatibility */}
                    <input type="number" value={(sp as any).speakerId || 0} onChange={(e) => updateSpeaker(idx, "speakerId", e.target.value)} className="w-24 px-3 py-2 border rounded-lg" placeholder="Speaker ID" />
                    <input value={(sp as any).topic || ""} onChange={(e) => updateSpeaker(idx, "topic", e.target.value)} className="flex-1 px-3 py-2 border rounded-lg" placeholder="Topic" />
                    <button type="button" onClick={() => removeSpeaker(idx)} className="px-3 py-2 bg-red-50 text-red-600 rounded">X</button>
                  </div>
                ))}
                <button type="button" onClick={addSpeaker} className="mt-2 px-3 py-2 bg-gray-100 rounded">Thêm speaker</button>
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold">Link họp (online) <span className="text-red-500">*</span></label>
              <input name="onlineMeetingUrl" value={form.onlineMeetingUrl} onChange={handleChange} className={`w-full mt-2 px-4 py-2 border rounded-lg ${errors.onlineMeetingUrl ? "border-red-500" : "border-gray-300"}`} />
              {errors.onlineMeetingUrl && <p className="text-xs text-red-500 mt-1">{errors.onlineMeetingUrl}</p>}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button type="button" onClick={onClose} disabled={isSubmitting} className="px-5 py-2.5 bg-white border rounded-lg">Hủy</button>
              <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 text-white bg-linear-to-r from-orange-500 to-orange-600 rounded-lg">
                {isSubmitting ? "Đang gửi..." : (event ? "Cập nhật" : "Tạo sự kiện")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventFormModalOnline;