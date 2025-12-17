import React, { useEffect, useState } from "react";
import { X, Calendar, Tag, MapPin, Users } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import { vi } from "date-fns/locale/vi";
registerLocale("vi", vi);

import { toast } from "react-toastify";
import { organizerService, venueService, eventService } from "../../../services";
import type {
  BookingWeeklyRequest,
  BookingWeeklyResponse,
  organizer,
  venue,
} from "../../../types/Event";

interface Props {
  event?: any | null;
  onClose: () => void;
  onSuccess: (data: BookingWeeklyResponse) => void;
}

const RECURRENCE_OPTIONS = [
  {value: "NONE", label: "Không lặp"},
  { value: "DAILY", label: "Hàng ngày" },
  { value: "WEEKLY", label: "Hàng tuần" },
  { value: "MONTHLY", label: "Hàng tháng" },
];

const EventFormModalWeekly: React.FC<Props> = ({ event, onClose, onSuccess }) => {
  const storedUserId = Number(localStorage.getItem("userId") || sessionStorage.getItem("userId") || 0) || 0;
  const [organizers, setOrganizers] = useState<organizer[]>([]);
  const [allVenues, setAllVenues] = useState<venue[]>([]); // keep full list
  const [venues, setVenues] = useState<venue[]>([]); // filtered by campus
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [form, setForm] = useState<BookingWeeklyRequest>({
    title: "",
    description: "",
    startTime: "",
    endTime: "",
    StartTimeRegistration: "",
    EndTimeRegistration: "",
    maxCapacity: 0,
    organizerId: 0,
    venueId: undefined,
    recurrenceType: "WEEKLY",
    recurrenceInterval: 1,
    recurrenceCount: undefined,
  } as any);

  useEffect(() => {
    const init = async () => {
      try {
        const oRes: any = await organizerService.getAllOrganizers();
        const oData = oRes?.data?.data ?? oRes?.data ?? oRes;
        setOrganizers(Array.isArray(oData) ? oData : []);
        const vRes: any = await venueService.getAllVenues();
        const vData = vRes?.data?.data ?? vRes?.data ?? vRes;
        const venuesArray = Array.isArray(vData) ? vData : [];
        setAllVenues(venuesArray);
        // if an organizer already selected, filter immediately; otherwise keep empty
        if (form.organizerId) {
          const org = (oData || []).find((x: any) => x.id === form.organizerId);
          const campusId = org?.campusId ?? org?.campus?.id;
          setVenues(campusId ? venuesArray.filter((v: any) => v.campusId === campusId || v.campus?.id === campusId) : []);
        } else {
          setVenues([]); // don't show all venues by default
        }
      } catch (e) {
        console.error(e);
      }
    };
    init();
  }, []);
  
  // when organizer changes, filter venues by organizer's campus
  useEffect(() => {
    const org = organizers.find((o) => o.id === form.organizerId);
    const campusId = org?.campusId ?? org?.campus?.id;
    if (campusId) {
      setVenues(allVenues.filter((v: any) => v.campusId === campusId || v.campus?.id === campusId));
    } else {
      setVenues([]); // or setAllVenues if you prefer to show all
    }
  }, [form.organizerId, organizers, allVenues]);

  useEffect(() => {
    if (event) {
      const ev = event?.event ?? event;
      setForm((p) => ({
        ...p,
        title: ev?.title ?? p.title,
        description: ev?.description ?? p.description,
        startTime: ev?.startTime ?? p.startTime,
        endTime: ev?.endTime ?? p.endTime,
        StartTimeRegistration: ev?.startTimeRegistration ?? ev?.startTimeRegister ?? p.StartTimeRegistration,
        EndTimeRegistration: ev?.endTimeRegistration ?? ev?.endTimeRegister ?? p.EndTimeRegistration,
        maxCapacity: ev?.maxCapacity ?? p.maxCapacity,
        organizerId: ev?.organizerId ?? p.organizerId,
        venueId: ev?.venueId ?? p.venueId,
        recurrenceType: ev?.recurrenceType ?? p.recurrenceType,
        recurrenceInterval: ev?.recurrenceInterval ?? p.recurrenceInterval,
        recurrenceCount: ev?.recurrenceCount ?? p.recurrenceCount,
      } as any));
    }
  }, [event]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev: any) => ({
      ...prev,
      [name]:
        name === "organizerId" || name === "venueId" || name === "recurrenceInterval"
          ? (value === "" ? undefined : Number(value))
          : value,
    }));
    setErrors((s) => ({ ...s, [name]: "" }));
  };

  const handleDateChange = (name: keyof BookingWeeklyRequest, date: Date | null) => {
    setForm((p: any) => ({ ...p, [name]: date ? date.toISOString() : "" }));
    setErrors((s) => ({ ...s, [name]: "" }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title?.trim()) e.title = "Vui lòng nhập tiêu đề";
    if (!form.description?.trim()) e.description = "Vui lòng nhập mô tả";
    if (!form.startTime) e.startTime = "Chọn thời gian bắt đầu";
    if (!form.endTime) e.endTime = "Chọn thời gian kết thúc";
    if (!form.StartTimeRegistration) e.StartTimeRegistration = "Chọn thời gian mở đăng ký";
    if (!form.EndTimeRegistration) e.EndTimeRegistration = "Chọn thời gian đóng đăng ký";
    if (!form.organizerId || form.organizerId <= 0) e.organizerId = "Chọn organizer";
    if (!form.recurrenceType) e.recurrenceType = "Chọn loại lặp";
    if (!form.recurrenceInterval || form.recurrenceInterval < 1) e.recurrenceInterval = "Khoảng lặp phải >= 1";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (ev?: React.FormEvent) => {
    ev?.preventDefault();
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const payload: BookingWeeklyRequest = {
        title: form.title,
        description: form.description,
        startTime: form.startTime,
        endTime: form.endTime,
        // gửi theo key backend mong đợi:
        startTimeRegister: form.StartTimeRegistration || form.startTimeRegister || "",
        endTimeRegister: form.EndTimeRegistration || form.endTimeRegister || "",
        maxCapacity: Number(form.maxCapacity) || 0,
        organizerId: Number(form.organizerId),
        venueId: form.venueId ? Number(form.venueId) : undefined,
        recurrenceType: form.recurrenceType,
        recurrenceInterval: Number(form.recurrenceInterval) || 1,
        recurrenceCount: form.recurrenceCount ? Number(form.recurrenceCount) : undefined,
      } as any;
      
      console.log('bookingWeekly payload:', payload);
      const res = await eventService.bookingWeekly(payload);
      toast.success("Tạo sự kiện định kỳ thành công");
      const data = (res as any)?.data ?? res;
      onSuccess(data as BookingWeeklyResponse);
      onClose();
    } catch (error: any) {
      console.error("bookingWeekly error", error);
      toast.error(error?.response?.data?.message || "Lỗi khi tạo sự kiện định kỳ");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg"><Calendar className="text-white" size={20} /></div>
            <div>
              <h2 className="text-2xl font-bold text-white">{event ? "Chỉnh sửa sự kiện định kỳ" : "Tạo sự kiện định kỳ"}</h2>
              <p className="text-white/90 text-sm mt-1">Tạo/sửa sự kiện lặp</p>
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
              <label className="text-sm font-semibold">Organizer <span className="text-red-500">*</span></label>
              <select name="organizerId" value={form.organizerId} onChange={handleChange} className={`w-full mt-2 px-4 py-2 border rounded-lg ${errors.organizerId ? "border-red-500" : "border-gray-300"}`} disabled={isSubmitting}>
                <option value={0}>Chọn organizer...</option>
                {organizers.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
              {errors.organizerId && <p className="text-xs text-red-500 mt-1">{errors.organizerId}</p>}
            </div>

            <div>
              <label className="text-sm font-semibold">Venue</label>
              <select name="venueId" value={form.venueId ?? ""} onChange={handleChange} className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg" disabled={isSubmitting}>
                <option value="">Không chọn</option>
                {venues.map(v => <option key={v.id} value={v.id}>{v.name} - {v.location}</option>)}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold">Sức chứa tối đa</label>
              <input name="maxCapacity" type="number" value={form.maxCapacity} onChange={handleChange} className="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg" disabled={isSubmitting} />
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold">Mở đăng ký <span className="text-red-500">*</span></label>
                <DatePicker selected={form.StartTimeRegistration ? new Date(form.StartTimeRegistration) : null} onChange={(d) => handleDateChange("StartTimeRegistration", d)} showTimeSelect timeFormat="HH:mm" timeIntervals={15} dateFormat="dd/MM/yyyy HH:mm" locale="vi" className={`w-full mt-2 px-4 py-2 border rounded-lg ${errors.StartTimeRegistration ? "border-red-500" : "border-gray-300"}`} />
                {errors.StartTimeRegistration && <p className="text-xs text-red-500 mt-1">{errors.StartTimeRegistration}</p>}
              </div>

              <div>
                <label className="text-sm font-semibold">Đóng đăng ký <span className="text-red-500">*</span></label>
                <DatePicker selected={form.EndTimeRegistration ? new Date(form.EndTimeRegistration) : null} onChange={(d) => handleDateChange("EndTimeRegistration", d)} showTimeSelect timeFormat="HH:mm" timeIntervals={15} dateFormat="dd/MM/yyyy HH:mm" locale="vi" className={`w-full mt-2 px-4 py-2 border rounded-lg ${errors.EndTimeRegistration ? "border-red-500" : "border-gray-300"}`} />
                {errors.EndTimeRegistration && <p className="text-xs text-red-500 mt-1">{errors.EndTimeRegistration}</p>}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold">Recurrence</label>
              <div className="mt-2 flex gap-2">
                <select name="recurrenceType" value={form.recurrenceType} onChange={handleChange} className="px-3 py-2 border rounded-lg">
                  {RECURRENCE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
                <input name="recurrenceInterval" type="number" min={1} value={form.recurrenceInterval} onChange={handleChange} className="px-3 py-2 border rounded-lg w-28" />
                <input name="recurrenceCount" type="number" min={1} value={form.recurrenceCount ?? ""} onChange={handleChange} placeholder="Số lần (tuỳ chọn)" className="px-3 py-2 border rounded-lg w-36" />
              </div>
              {errors.recurrenceInterval && <p className="text-xs text-red-500 mt-1">{errors.recurrenceInterval}</p>}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button type="button" onClick={onClose} disabled={isSubmitting} className="px-5 py-2.5 bg-white border rounded-lg">Hủy</button>
              <button type="submit" disabled={isSubmitting} className="px-6 py-2.5 text-white bg-linear-to-r from-orange-500 to-orange-600 rounded-lg">
                {isSubmitting ? "Đang gửi..." : (event ? "Cập nhật" : "Tạo định kỳ")}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventFormModalWeekly;