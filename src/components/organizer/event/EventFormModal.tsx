import { useState, useEffect } from "react";
import {
  X,
  Calendar,
  MapPin,
  Users,
  Clock,
  FileText,
  Image as ImageIcon,
  Tag,
  UserPlus,
  Repeat,
} from "lucide-react";
import type {
  Event,
  CreateEventRequest,
  UpdateEventRequest,
} from "../../../types/Event";
import type { User } from "../../../types/User";
import type { Venue } from "../../../types/Venue";
import { toast } from "react-toastify";
import {
  organizerService,
  venueService,
  eventService,
} from "../../../services";
import { uploadImageToCloudinary } from "../../../utils/uploadImg";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import { vi } from "date-fns/locale/vi";

registerLocale("vi", vi);

interface EventFormModalProps {
  event: Event | null;
  onClose: () => void;
  onSuccess: (event: Event) => void;
}

const EventFormModal = ({ event, onClose, onSuccess }: EventFormModalProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [staffList, setStaffList] = useState<User[]>([]);
  const [selectedStaffIds, setSelectedStaffIds] = useState<number[]>([]);
  const [isLoadingStaff, setIsLoadingStaff] = useState(false);
  const [organizerInfo, setOrganizerInfo] = useState<{
    id: number;
    name: string;
    campusId: number;
  } | null>(null);
  const [venueList, setVenueList] = useState<Venue[]>([]);
  const [isLoadingVenues, setIsLoadingVenues] = useState(false);
  const [isLoadingOrganizer, setIsLoadingOrganizer] = useState(false);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [bannerPreview, setBannerPreview] = useState<string>("");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventType: "WORKSHOP",
    startDate: "",
    endDate: "",
    registrationDeadline: "",
    endTimeRegister: "",
    maxParticipants: 100,
    venueId: "",
    bannerUrl: "",
    imageUrl: "",
    recurrenceType: "NONE",
    recurrenceInterval: 1,
    recurrenceCount: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  //FETCH ORGANIZER INFO KHI MOUNT
  useEffect(() => {
    fetchOrganizerInfo();
  }, []);

  //FETCH VENUES KHI CÓ ORGANIZER INFO
  useEffect(() => {
    if (organizerInfo?.campusId) {
      fetchVenuesByCampus(organizerInfo.campusId);
    }
  }, [organizerInfo]);

  // Sửa useEffect để fetch staff khi organizerInfo thay đổi
  useEffect(() => {
    if (organizerInfo?.campusId) {
      fetchStaffList(organizerInfo.campusId);
    }
  }, [organizerInfo]);

  const [originalData, setOriginalData] = useState<CreateEventRequest | null>(
    null
  );

  useEffect(() => {
    const fetchInitialData = async () => {
      if (event) {
        console.log("Editing event:", event);

        const formatToDatetimeLocal = (isoString: string): string => {
          if (!isoString) return "";
          const date = new Date(isoString);
          // Format: YYYY-MM-DDTHH:mm
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, "0");
          const day = String(date.getDate()).padStart(2, "0");
          const hours = String(date.getHours()).padStart(2, "0");
          const minutes = String(date.getMinutes()).padStart(2, "0");
          return `${year}-${month}-${day}T${hours}:${minutes}`;
        };

        try {
          const response = await eventService.getEventById(String(event.id));
          console.log("📡 Full event details from API:", response.data);

          const responseData = response.data as any;
          const fullEvent = responseData?.data || responseData;

          console.log("Full event object:", fullEvent);
          console.log(
            "startTimeRegistration:",
            fullEvent.startTimeRegistration
          );
          console.log("endTimeRegistration:", fullEvent.endTimeRegistration);
          console.log(
            "Event prop registrationDeadline:",
            event.registrationDeadline
          );

          let staffIds: number[] = [];
          if (fullEvent.eventStaffs && Array.isArray(fullEvent.eventStaffs)) {
            staffIds = fullEvent.eventStaffs.map((staff: any) => staff.userId);
            setSelectedStaffIds(staffIds);
            console.log("👥 Pre-selected staff IDs:", staffIds);
          }

          let endTimeRegisterValue = "";

          // Priority 1: Lấy từ fullEvent.endTimeRegistration
          if (fullEvent.endTimeRegistration) {
            endTimeRegisterValue = formatToDatetimeLocal(
              fullEvent.endTimeRegistration
            );
            console.log(
              "✅ Got endTimeRegister from fullEvent.endTimeRegistration"
            );
          }
          // Priority 2: Lấy từ fullEvent.endTimeRegister (nếu có)
          else if (fullEvent.endTimeRegister) {
            endTimeRegisterValue = formatToDatetimeLocal(
              fullEvent.endTimeRegister
            );
            console.log(
              "✅ Got endTimeRegister from fullEvent.endTimeRegister"
            );
          }
          // Priority 3: Tính toán từ startTimeRegistration + 1 ngày
          else if (fullEvent.startTimeRegistration) {
            const startDate = new Date(fullEvent.startTimeRegistration);
            startDate.setDate(startDate.getDate() + 1); // Thêm 1 ngày
            endTimeRegisterValue = formatToDatetimeLocal(
              startDate.toISOString()
            );
            console.log(
              "Calculated endTimeRegister from startTimeRegistration + 1 day"
            );
          }
          // Priority 4: Fallback về event.startDate
          else if (event.startDate) {
            endTimeRegisterValue = formatToDatetimeLocal(event.startDate);
            console.log("Fallback endTimeRegister to event.startDate");
          }

          console.log("Final endTimeRegister value:", endTimeRegisterValue);

          //SET FORM DATA VỚI DỮ LIỆU ĐẦY ĐỦ TỪ API
          const formattedData = {
            title: fullEvent.title || "",
            description: fullEvent.description || "",
            eventType: fullEvent.category || event.eventType || "WORKSHOP",
            bannerUrl: fullEvent.bannerUrl || fullEvent.imageUrl || "",
            startDate: formatToDatetimeLocal(
              fullEvent.startTime || event.startDate
            ),
            endDate: formatToDatetimeLocal(fullEvent.endTime || event.endDate),
            registrationDeadline: formatToDatetimeLocal(
              fullEvent.startTimeRegistration ||
                fullEvent.startTimeRegister ||
                event.registrationDeadline
            ),
            endTimeRegister: endTimeRegisterValue,
            maxParticipants:
              fullEvent.maxCapacity || event.maxParticipants || 0,
            venueId: String(fullEvent.venueId || event.venueId || ""),
            imageUrl: "",
            recurrenceType: fullEvent.recurrenceType || "NONE",
            recurrenceInterval: fullEvent.recurrenceInterval || 1,
            recurrenceCount: fullEvent.recurrenceCount
              ? String(fullEvent.recurrenceCount)
              : "",
          };

          console.log("Formatted form data:", formattedData);
          console.log(
            "endTimeRegister in formData:",
            formattedData.endTimeRegister
          );

          setFormData(formattedData);
          // Set banner preview when editing
          if (formattedData.bannerUrl) {
            setBannerPreview(formattedData.bannerUrl);
          }
          setOriginalData({
            title: fullEvent.title,
            description: fullEvent.description,
            category: fullEvent.category || event.eventType,
            bannerUrl: fullEvent.bannerUrl || fullEvent.imageUrl,
            startTime: fullEvent.startTime,
            endTime: fullEvent.endTime,
            startTimeRegister:
              fullEvent.startTimeRegistration || fullEvent.startTime,
            endTimeRegister:
              fullEvent.endTimeRegistration ||
              fullEvent.endTimeRegister ||
              fullEvent.endTime, // ✅ FIX
            maxCapacity: fullEvent.maxCapacity || event.maxParticipants,
            isGlobal: fullEvent.isGlobal ?? true,
            organizerId: fullEvent.organizerId || event.organizerId,
            venueId: fullEvent.venueId || event.venueId,
            hostId: fullEvent.hostId || 1,
            staffIds: staffIds,
            speakers:
              fullEvent.eventSpeakers?.map((es: any) => ({
                speakerId: es.speakerId,
                topic: es.topic,
              })) || [],
          });
        } catch (error) {
          console.error("Error fetching full event details:", error);
          const fallbackData = {
            title: event.title || "",
            description: event.description || "",
            eventType: event.eventType || "WORKSHOP",
            bannerUrl: event.imageUrl || "",
            startDate: formatToDatetimeLocal(event.startDate),
            endDate: formatToDatetimeLocal(event.endDate),
            registrationDeadline: formatToDatetimeLocal(
              event.registrationDeadline
            ),
            endTimeRegister: formatToDatetimeLocal(event.startDate),
            maxParticipants: event.maxParticipants || 0,
            venueId: String(event.venueId || ""),
            imageUrl: "",
            recurrenceType: "NONE",
            recurrenceInterval: 1,
            recurrenceCount: "",
          };

          console.log(
            "Using fallback data with endTimeRegister:",
            fallbackData.endTimeRegister
          );
          setFormData(fallbackData);
        }

        console.log("Form pre-filled with existing data");
      } else {
        console.log("Creating new event - empty form");
        setFormData({
          title: "",
          description: "",
          eventType: "WORKSHOP",
          bannerUrl: "",
          startDate: "",
          endDate: "",
          registrationDeadline: "",
          endTimeRegister: "",
          maxParticipants: 100,
          venueId: "",
          imageUrl: "",
          recurrenceType: "NONE",
          recurrenceInterval: 1,
          recurrenceCount: "",
        });
        setSelectedStaffIds([]);
        setOriginalData(null);
        setBannerPreview("");
      }
    };

    fetchInitialData();
  }, [event]);

  const fetchOrganizerInfo = async () => {
    setIsLoadingOrganizer(true);
    try {
      console.log("Fetching organizer info...");

      const response = await organizerService.getAllOrganizers();

      console.log("Full organizer response:", response);
      const responseData = response.data as any;
      let organizersArray: any[] = [];

      if (
        responseData?.success &&
        responseData?.data &&
        Array.isArray(responseData.data)
      ) {
        organizersArray = responseData.data;
        console.log(
          "Case 1: Found organizers in response.data.data (with wrapper)"
        );
      } else if (Array.isArray(responseData)) {
        organizersArray = responseData;
        console.log("Case 2: Found organizers in response.data (direct array)");
      } else if (responseData?.data && Array.isArray(responseData.data)) {
        organizersArray = responseData.data;
        console.log(
          "Case 3: Found organizers in response.data.data (no success flag)"
        );
      }

      console.log("Final organizers array:", organizersArray);

      if (organizersArray.length === 0) {
        console.error("No organizers found in response");
        throw new Error("Không tìm thấy organizer. Vui lòng liên hệ admin.");
      }

      const organizer = organizersArray[0];

      console.log("Selected organizer:", organizer);

      if (!organizer.campusId) {
        console.error("Organizer has no campusId");
        throw new Error("Organizer không có thông tin campus");
      }

      setOrganizerInfo({
        id: organizer.id,
        name: organizer.name,
        campusId: organizer.campusId,
      });

      console.log("Organizer info set successfully");
    } catch (error: any) {
      console.error("Error fetching organizer:", error);
    } finally {
      setIsLoadingOrganizer(false);
    }
  };
  const fetchVenuesByCampus = async (campusId: number) => {
    setIsLoadingVenues(true);
    try {
      console.log("Fetching venues for campus ID:", campusId);

      const response = await venueService.getAllVenues();

      console.log("Full venues response:", response);

      let allVenues: Venue[] = [];

      const responseData = response.data as any;

      if (
        responseData?.success &&
        responseData?.data &&
        Array.isArray(responseData.data)
      ) {
        allVenues = responseData.data;
        console.log(
          "Case 1: Found venues in response.data.data (with wrapper)"
        );
      } else if (Array.isArray(responseData)) {
        allVenues = responseData;
        console.log("Case 2: Found venues in response.data (direct array)");
      } else if (responseData?.data && Array.isArray(responseData.data)) {
        allVenues = responseData.data;
        console.log(
          "Case 3: Found venues in response.data.data (no success flag)"
        );
      }

      console.log("All venues:", allVenues);

      if (allVenues.length === 0) {
        console.warn("No venues found in system");
        setVenueList([]);
        return;
      }

      const filteredVenues = allVenues.filter((venue) => {
        const matchesCampus = venue.campusId === campusId;
        const normalizedStatus = venue.status?.toUpperCase();
        const isActive = normalizedStatus === "ACTIVE";

        console.log(`Venue ${venue.id} "${venue.name}":`, {
          campusId: venue.campusId,
          targetCampusId: campusId,
          matchesCampus,
          isActive,
        });

        return matchesCampus && isActive;
      });

      console.log("Filtered venues:", filteredVenues);

      setVenueList(filteredVenues);
    } catch (error: any) {
      console.error("Error fetching venues:", error);
      setVenueList([]);
    } finally {
      setIsLoadingVenues(false);
    }
  };

  // Sửa fetchStaffList để nhận campusId
  const fetchStaffList = async (campusId: number) => {
    setIsLoadingStaff(true);
    try {
      console.log("Fetching staff list for campus:", campusId);

      // Truyền campusId vào params
      const response = await organizerService.getStaffEvent({
        isActive: true,
        campusId: campusId,
      });

      const responseData = response.data as any;
      let staffData: User[] = [];

      if (
        responseData?.success &&
        responseData?.data &&
        Array.isArray(responseData.data)
      ) {
        staffData = responseData.data;
      } else if (Array.isArray(responseData)) {
        staffData = responseData;
      } else if (responseData?.data && Array.isArray(responseData.data)) {
        staffData = responseData.data;
      }

      setStaffList(staffData.length > 0 ? staffData : []);
    } catch (error: any) {
      console.error("Error fetching staff:", error);
      setStaffList([]);
    } finally {
      setIsLoadingStaff(false);
    }
  };

  const handleStaffToggle = (staffId: number) => {
    setSelectedStaffIds((prev) =>
      prev.includes(staffId)
        ? prev.filter((id) => id !== staffId)
        : [...prev, staffId]
    );
  };

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    // Preview
    const objectUrl = URL.createObjectURL(file);
    setBannerPreview(objectUrl);

    setIsUploadingBanner(true);
    try {
      const imageUrl = await uploadImageToCloudinary(file);
      setFormData((prev) => ({ ...prev, bannerUrl: imageUrl }));
      toast.success("Tải ảnh lên thành công!");
      if (errors.bannerUrl) {
        setErrors((prev) => ({ ...prev, bannerUrl: "" }));
      }
    } catch (err: any) {
      toast.error("Có lỗi xảy ra khi tải ảnh lên");
      console.error("Error uploading banner:", err);
      setBannerPreview("");
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const handleRemoveBanner = () => {
    if (bannerPreview) {
      URL.revokeObjectURL(bannerPreview);
    }
    setBannerPreview("");
    setFormData((prev) => ({ ...prev, bannerUrl: "" }));
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;

    // Khi chọn venue, tự động cập nhật maxParticipants theo capacity
    if (name === "venueId" && value) {
      const selectedVenue = venueList.find((v) => v.id === Number(value));
      if (selectedVenue) {
        const venueCapacity =
          selectedVenue.capacity ||
          (selectedVenue.hasSeats
            ? selectedVenue.row * selectedVenue.column
            : 0);
        setFormData((prev) => ({
          ...prev,
          [name]: value,
          maxParticipants: venueCapacity,
        }));
        // Clear error cho cả venueId và maxParticipants
        if (errors.venueId || errors.maxParticipants) {
          setErrors((prev) => ({ ...prev, venueId: "", maxParticipants: "" }));
        }
        return;
      }
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Vui lòng nhập tên sự kiện";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Vui lòng nhập mô tả sự kiện";
    }

    if (!formData.eventType.trim()) {
      newErrors.eventType = "Vui lòng nhập loại sự kiện";
    }

    if (!formData.startDate) {
      newErrors.startDate = "Vui lòng chọn thời gian bắt đầu";
    }

    if (!formData.endDate) {
      newErrors.endDate = "Vui lòng chọn thời gian kết thúc";
    }

    if (formData.startDate && formData.endDate) {
      if (new Date(formData.endDate) <= new Date(formData.startDate)) {
        newErrors.endDate = "Thời gian kết thúc phải sau thời gian bắt đầu";
      }
    }

    if (!formData.registrationDeadline) {
      newErrors.registrationDeadline = "Vui lòng chọn thời gian mở đăng ký";
    }

    if (!formData.endTimeRegister) {
      newErrors.endTimeRegister = "Vui lòng chọn thời gian đóng đăng ký";
    }

    if (formData.registrationDeadline && formData.endTimeRegister) {
      if (
        new Date(formData.endTimeRegister) <=
        new Date(formData.registrationDeadline)
      ) {
        newErrors.endTimeRegister =
          "Thời gian đóng đăng ký phải sau thời gian mở đăng ký";
      }
    }

    if (formData.endTimeRegister && formData.startDate) {
      if (new Date(formData.endTimeRegister) > new Date(formData.startDate)) {
        newErrors.endTimeRegister =
          "Thời gian đóng đăng ký phải trước hoặc bằng thời gian bắt đầu sự kiện";
      }
    }

    if (formData.maxParticipants < 1) {
      newErrors.maxParticipants = "Số lượng người tham gia phải lớn hơn 0";
    }

    // Validate maxParticipants không vượt quá capacity của venue
    if (formData.venueId && formData.maxParticipants > 0) {
      const selectedVenue = venueList.find(
        (v) => v.id === Number(formData.venueId)
      );
      if (selectedVenue) {
        const venueCapacity =
          selectedVenue.capacity ||
          (selectedVenue.hasSeats
            ? selectedVenue.row * selectedVenue.column
            : 0);
        if (venueCapacity > 0 && formData.maxParticipants > venueCapacity) {
          newErrors.maxParticipants = `Số lượng người tham gia không được vượt quá sức chứa của địa điểm (${venueCapacity} người)`;
        }
      }
    }

    //VALIDATE VENUE
    if (!formData.venueId) {
      newErrors.venueId = "Vui lòng chọn địa điểm";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    console.log("=== SUBMIT START ===");
    console.log("Form data:", formData);
    console.log("Is editing:", !!event);

    if (!validateForm()) {
      console.log("Validation failed");
      toast.error("Vui lòng kiểm tra lại thông tin");
      return;
    }

    if (!organizerInfo) {
      toast.error("Không tìm thấy thông tin organizer");
      return;
    }

    const selectedVenue = venueList.find(
      (v) => v.id === Number(formData.venueId)
    );
    if (!selectedVenue) {
      toast.error("Vui lòng chọn địa điểm hợp lệ");
      return;
    }

    setIsSubmitting(true);

    try {
      // ✅ FIX: FORMAT DATETIME KHÔNG BỊ THAY ĐỔI TIMEZONE
      const formatDateTime = (dateString: string): string => {
        if (!dateString) return "";

        // Parse date string thành Date object
        const date = new Date(dateString);

        // Lấy các thành phần thời gian LOCAL (không convert UTC)
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, "0");
        const day = String(date.getDate()).padStart(2, "0");
        const hours = String(date.getHours()).padStart(2, "0");
        const minutes = String(date.getMinutes()).padStart(2, "0");
        const seconds = String(date.getSeconds()).padStart(2, "0");

        // Format: YYYY-MM-DDTHH:mm:ss+07:00 (giữ nguyên timezone local)
        const timezoneOffset = -date.getTimezoneOffset();
        const sign = timezoneOffset >= 0 ? "+" : "-";
        const offsetHours = Math.floor(Math.abs(timezoneOffset) / 60)
          .toString()
          .padStart(2, "0");
        const offsetMinutes = (Math.abs(timezoneOffset) % 60)
          .toString()
          .padStart(2, "0");

        return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${sign}${offsetHours}:${offsetMinutes}`;
      };

      // Check if recurrence is enabled
      const isRecurring =
        formData.recurrenceType && formData.recurrenceType !== "NONE";

      let response;

      if (event) {
        // UPDATE MODE
        const eventIdString = String(event.id);

        if (!eventIdString || eventIdString.trim() === "") {
          console.error("Invalid event ID");
          toast.error("ID sự kiện không hợp lệ");
          return;
        }

        const updateData: UpdateEventRequest = {};

        if (originalData) {
          const newTitle = formData.title.trim();
          if (newTitle !== originalData.title) {
            updateData.title = newTitle;
          }

          const newDescription = formData.description.trim();
          if (newDescription !== originalData.description) {
            updateData.description = newDescription;
          }

          const newCategory = formData.eventType;
          if (newCategory !== originalData.category) {
            updateData.category = newCategory;
          }

          const newBannerUrl = formData.bannerUrl?.trim();
          if (newBannerUrl !== originalData.bannerUrl) {
            updateData.bannerUrl = newBannerUrl;
          }

          // ✅ FIX: SO SÁNH THỜI GIAN VỚI FORMAT CHUẨN
          const newStartTime = formatDateTime(formData.startDate);
          const originalStartTime = formatDateTime(originalData.startTime);
          if (newStartTime !== originalStartTime) {
            updateData.startTime = newStartTime;
          }

          const newEndTime = formatDateTime(formData.endDate);
          const originalEndTime = formatDateTime(originalData.endTime);
          if (newEndTime !== originalEndTime) {
            updateData.endTime = newEndTime;
          }

          const newStartTimeRegister = formatDateTime(
            formData.registrationDeadline
          );
          const originalStartTimeRegister = formatDateTime(
            originalData.startTimeRegister
          );
          if (newStartTimeRegister !== originalStartTimeRegister) {
            updateData.startTimeRegister = newStartTimeRegister;
          }

          const newEndTimeRegister = formatDateTime(formData.endTimeRegister);
          const originalEndTimeRegister = formatDateTime(
            originalData.endTimeRegister
          );
          if (newEndTimeRegister !== originalEndTimeRegister) {
            updateData.endTimeRegister = newEndTimeRegister;
          }

          const newMaxCapacity = Number(formData.maxParticipants);
          if (newMaxCapacity !== originalData.maxCapacity) {
            updateData.maxCapacity = newMaxCapacity;
          }

          const newVenueId = Number(formData.venueId);
          if (newVenueId !== originalData.venueId) {
            updateData.venueId = newVenueId;
          }
        } else {
          // GỬI TẤT CẢ (KHÔNG CÓ ORIGINAL DATA)
          updateData.title = formData.title.trim();
          updateData.description = formData.description.trim();
          updateData.category = formData.eventType;
          updateData.bannerUrl = formData.bannerUrl?.trim();
          updateData.startTime = formatDateTime(formData.startDate);
          updateData.endTime = formatDateTime(formData.endDate);
          updateData.startTimeRegister = formatDateTime(
            formData.registrationDeadline
          );
          updateData.endTimeRegister = formatDateTime(formData.endTimeRegister);
          updateData.maxCapacity = Number(formData.maxParticipants);
          updateData.venueId = Number(formData.venueId);
          updateData.isGlobal = true;
          updateData.organizerId = organizerInfo.id;
        }

        console.log("Sending UPDATE data:", updateData);

        if (Object.keys(updateData).length === 0) {
          toast.info("Không có thay đổi nào để lưu");
          onClose();
          return;
        }

        response = await eventService.patchEventById({
          id: eventIdString,
          data: updateData,
        });
      } else {
        // CREATE MODE
        if (isRecurring) {
          // Use bookingWeekly for recurring events
          const weeklyData = {
            title: formData.title.trim(),
            description: formData.description.trim(),
            category: formData.eventType,
            bannerUrl: formData.bannerUrl?.trim() || undefined, // ✅ Thêm bannerUrl
            startTime: formatDateTime(formData.startDate),
            endTime: formatDateTime(formData.endDate),
            startTimeRegister: formatDateTime(formData.registrationDeadline),
            endTimeRegister: formatDateTime(formData.endTimeRegister),
            maxCapacity: Number(formData.maxParticipants),
            organizerId: organizerInfo.id,
            hostId: 1, // ✅ Thêm hostId
            venueId: formData.venueId ? Number(formData.venueId) : undefined,
            recurrenceType: formData.recurrenceType,
            recurrenceInterval: Number(formData.recurrenceInterval) || 1,
            recurrenceCount: formData.recurrenceCount || undefined,
            staffIds: selectedStaffIds || [], // ✅ Thêm staffIds
            speakers: [], // ✅ Thêm speakers (offline events có thể không có speakers, nhưng vẫn gửi array rỗng)
          };

          console.log("Sending RECURRING CREATE data:", weeklyData);
          // Cast để bypass type check vì BookingWeeklyRequest không có các trường này
          response = await eventService.bookingWeekly(weeklyData as any);
        } else {
          // Use normal postEvent for non-recurring events
          const requestData: CreateEventRequest = {
            title: formData.title.trim(),
            description: formData.description.trim(),
            category: formData.eventType,
            bannerUrl: formData.bannerUrl?.trim() || undefined,
            startTime: formatDateTime(formData.startDate),
            endTime: formatDateTime(formData.endDate),
            startTimeRegister: formatDateTime(formData.registrationDeadline),
            endTimeRegister: formatDateTime(formData.endTimeRegister),
            maxCapacity: Number(formData.maxParticipants),
            isGlobal: true,
            organizerId: organizerInfo.id,
            venueId: Number(formData.venueId),
            hostId: 1,
            staffIds: selectedStaffIds,
            speakers: [],
          };

          console.log("Sending CREATE data:", requestData);
          console.log("Formatted times:", {
            startTime: requestData.startTime,
            endTime: requestData.endTime,
            startTimeRegister: requestData.startTimeRegister,
            endTimeRegister: requestData.endTimeRegister,
          });

          response = await eventService.postEvent(requestData);
        }
      }

      // XỬ LÝ SUCCESS RESPONSE
      if (response.status === 201 || response.status === 200) {
        let apiEvent: any = null;

        const responseData = response.data as any;

        console.log("Full response data:", responseData);

        // Thử các cách lấy event data khác nhau từ response
        if (
          responseData?.events &&
          Array.isArray(responseData.events) &&
          responseData.events.length > 0
        ) {
          // Response mới: { events: [...], totalOccurrences: 1 }
          apiEvent = responseData.events[0];
          console.log("Found event in responseData.events[0]:", apiEvent);
        } else if (responseData?.data) {
          apiEvent = responseData.data;
        } else if (responseData?.event) {
          apiEvent = responseData.event;
        } else if (responseData?.id || responseData?.title) {
          apiEvent = responseData;
        } else if (responseData?.success && responseData?.message) {
          // Response chỉ có message thành công, không có data chi tiết
          // Tạo event object từ form data
          console.log("Response only has success message, using form data");
          apiEvent = {
            id: Date.now(), // temporary ID
            title: formData.title,
            description: formData.description,
            category: formData.eventType,
            startTime: formData.startDate,
            endTime: formData.endDate,
            startTimeRegistration: formData.registrationDeadline,
            maxCapacity: formData.maxParticipants,
            venueId: Number(formData.venueId),
            status: "PENDING",
          };
        }

        // Nếu vẫn không có apiEvent, sử dụng form data
        if (!apiEvent) {
          console.log("No event in response, creating from form data");
          apiEvent = {
            id: Date.now(),
            title: formData.title,
            description: formData.description,
            category: formData.eventType,
            startTime: formData.startDate,
            endTime: formData.endDate,
            startTimeRegistration: formData.registrationDeadline,
            maxCapacity: formData.maxParticipants,
            venueId: Number(formData.venueId),
            status: "PENDING",
          };
        }

        const savedEvent: Event = {
          id: String(apiEvent.id),
          title: apiEvent.title,
          description: apiEvent.description,
          eventType: (apiEvent.category || formData.eventType) as any,
          status: (apiEvent.status as any) || "PENDING",
          startDate: apiEvent.startTime || apiEvent.startDate,
          endDate: apiEvent.endTime || apiEvent.endDate,
          registrationDeadline:
            apiEvent.startTimeRegistration || apiEvent.startTimeRegister,
          maxParticipants: apiEvent.maxCapacity || formData.maxParticipants,
          currentParticipants: apiEvent.registeredCount || 0,
          venueId: apiEvent.venueId || Number(formData.venueId),
          venueName: apiEvent.venue?.name || selectedVenue.name,
          campusId: apiEvent.venue?.campusId || selectedVenue.campusId,
          campusName: apiEvent.venue?.campus?.name || organizerInfo.name || "",
          organizerId: apiEvent.organizerId || organizerInfo.id,
          organizerName: apiEvent.organizer?.name || organizerInfo.name,
          requiresApproval: true,
          isPublished: false,
        };

        console.log("Event saved successfully:", savedEvent);

        if (event) {
          toast.success(`Cập nhật sự kiện "${savedEvent.title}" thành công!`, {
            autoClose: 3000,
          });
        } else {
          toast.success(`Tạo sự kiện "${savedEvent.title}" thành công!`, {
            autoClose: 3000,
          });
        }

        onSuccess(savedEvent);
      } else {
        throw new Error(`Không thể lưu sự kiện. Status: ${response.status}`);
      }
    } catch (error: any) {
      console.error("Error submitting form:", error);
      console.error("Error response:", error.response);

      let errorMessage = event
        ? "Đã xảy ra lỗi khi cập nhật sự kiện"
        : "Đã xảy ra lỗi khi tạo sự kiện";

      // XỬ LÝ LỖI VENUE CONFLICT
      if (error.response?.status === 400) {
        const responseData = error.response.data;

        if (responseData?.message) {
          const message = responseData.message;

          if (
            message.includes("Venue đã được đặt") ||
            message.includes("venue is already booked") ||
            message.includes("conflict")
          ) {
            const eventNameMatch = message.match(/"([^"]+)"/);
            const conflictEventName = eventNameMatch
              ? eventNameMatch[1]
              : "một sự kiện khác";

            errorMessage =
              `Không thể đặt ${selectedVenue?.name || "địa điểm này"}!\n\n` +
              `Địa điểm đã được sử dụng cho sự kiện "${conflictEventName}" trong cùng khung giờ.\n\n` +
              `Vui lòng:\n` +
              `• Chọn địa điểm khác, hoặc\n` +
              `• Chọn thời gian khác`;

            toast.error(errorMessage, {
              autoClose: 8000,
              style: {
                whiteSpace: "pre-line",
              },
            });
            return;
          }
        }
      }

      // XỬ LÝ CÁC LỖI KHÁC
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.errors) {
        if (Array.isArray(error.response.data.errors)) {
          errorMessage = error.response.data.errors
            .map((e: any) => e.message || e)
            .join(", ");
        } else if (typeof error.response.data.errors === "object") {
          errorMessage = Object.entries(error.response.data.errors)
            .map(([field, msg]) => `${field}: ${msg}`)
            .join(", ");
        }
      }

      toast.error(errorMessage, {
        autoClose: 5000,
      });
    } finally {
      console.log("=== SUBMIT END ===");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-orange-600 px-6 py-4 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/20 rounded-lg">
              <Calendar className="text-white" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                {event ? "Chỉnh sửa sự kiện" : "Tạo sự kiện mới"}
              </h2>
              {organizerInfo && (
                <p className="text-white/90 text-sm mt-1">
                  {organizerInfo.name} - Campus ID: {organizerInfo.campusId}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose} // ✅ CHỈ NÚT NÀY MỚI ĐÓNG MODAL
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
            type="button"
          >
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-6">
            <div className="space-y-6">
              {/* HIỂN THỊ THÔNG BÁO NẾU ĐANG LOADING */}
              {isLoadingOrganizer && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                  <p className="text-sm text-blue-800">
                    Đang tải thông tin organizer...
                  </p>
                </div>
              )}

              {/* Tên sự kiện */}
              <div>
                <label
                  htmlFor="title"
                  className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2"
                >
                  <FileText size={16} className="text-orange-500" />
                  Tên sự kiện <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Nhập tên sự kiện..."
                  className={`w-full px-4 py-3 border ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
                  disabled={isSubmitting}
                />
                {errors.title && (
                  <p className="text-red-500 text-xs mt-1">{errors.title}</p>
                )}
              </div>

              {/* Loại sự kiện */}
              <div>
                <label
                  htmlFor="eventType"
                  className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2"
                >
                  <Tag size={16} className="text-orange-500" />
                  Loại sự kiện <span className="text-red-500">*</span>
                </label>
                <select
                  id="eventType"
                  name="eventType"
                  value={formData.eventType}
                  onChange={handleChange}
                  className={`w-full px-4 py-3 border ${
                    errors.eventType ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
                  disabled={isSubmitting}
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
                {errors.eventType && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.eventType}
                  </p>
                )}
              </div>

              {/* Mô tả */}
              <div>
                <label
                  htmlFor="description"
                  className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2"
                >
                  <FileText size={16} className="text-orange-500" />
                  Mô tả sự kiện <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Nhập mô tả chi tiết về sự kiện..."
                  rows={4}
                  className={`w-full px-4 py-3 border ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none transition-all`}
                  disabled={isSubmitting}
                />
                {errors.description && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Thời gian */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="startDate"
                    className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2"
                  >
                    <Calendar size={16} className="text-orange-500" />
                    Thời gian bắt đầu <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    selected={
                      formData.startDate ? new Date(formData.startDate) : null
                    }
                    onChange={(date) =>
                      setFormData({
                        ...formData,
                        startDate: date?.toISOString() || "",
                      })
                    }
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="dd/MM/yyyy HH:mm"
                    locale="vi"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholderText="DD/MM/YYYY HH:mm"
                    disabled={isSubmitting}
                    wrapperClassName="w-full"
                  />
                  {errors.startDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.startDate}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="endDate"
                    className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2"
                  >
                    <Calendar size={16} className="text-orange-500" />
                    Thời gian kết thúc <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    selected={
                      formData.endDate ? new Date(formData.endDate) : null
                    }
                    onChange={(date) =>
                      setFormData({
                        ...formData,
                        endDate: date?.toISOString() || "",
                      })
                    }
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="dd/MM/yyyy HH:mm"
                    locale="vi"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholderText="DD/MM/YYYY HH:mm"
                    disabled={isSubmitting}
                    wrapperClassName="w-full"
                  />
                  {errors.endDate && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.endDate}
                    </p>
                  )}
                </div>
              </div>

              {/* Hạn đăng ký */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="registrationDeadline"
                    className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2"
                  >
                    <Clock size={16} className="text-orange-500" />
                    Thời gian mở đăng ký <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    selected={
                      formData.registrationDeadline
                        ? new Date(formData.registrationDeadline)
                        : null
                    }
                    onChange={(date) =>
                      setFormData({
                        ...formData,
                        registrationDeadline: date?.toISOString() || "",
                      })
                    }
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="dd/MM/yyyy HH:mm"
                    locale="vi"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholderText="DD/MM/YYYY HH:mm"
                    disabled={isSubmitting}
                    wrapperClassName="w-full"
                  />
                  {errors.registrationDeadline && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.registrationDeadline}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="endTimeRegister"
                    className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2"
                  >
                    <Clock size={16} className="text-orange-500" />
                    Thời gian đóng đăng ký{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <DatePicker
                    selected={
                      formData.endTimeRegister
                        ? new Date(formData.endTimeRegister)
                        : null
                    }
                    onChange={(date) =>
                      setFormData({
                        ...formData,
                        endTimeRegister: date?.toISOString() || "",
                      })
                    }
                    showTimeSelect
                    timeFormat="HH:mm"
                    timeIntervals={15}
                    dateFormat="dd/MM/yyyy HH:mm"
                    locale="vi"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    placeholderText="DD/MM/YYYY HH:mm"
                    disabled={isSubmitting}
                    wrapperClassName="w-full"
                  />
                  {errors.endTimeRegister && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.endTimeRegister}
                    </p>
                  )}
                </div>
              </div>

              {/* VENUE DROPDOWN - Di chuyển lên trước Số lượng người tham gia */}
              <div>
                <label
                  htmlFor="venueId"
                  className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2"
                >
                  <MapPin size={16} className="text-orange-500" />
                  Địa điểm <span className="text-red-500">*</span>
                </label>

                {isLoadingVenues ? (
                  <div className="flex items-center justify-center py-3 border border-gray-300 rounded-lg">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-orange-500"></div>
                    <span className="ml-2 text-sm text-gray-600">
                      Đang tải địa điểm...
                    </span>
                  </div>
                ) : (
                  <>
                    <select
                      id="venueId"
                      name="venueId"
                      value={formData.venueId}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border ${
                        errors.venueId ? "border-red-500" : "border-gray-300"
                      } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
                      disabled={
                        isSubmitting || !organizerInfo || venueList.length === 0
                      }
                      required
                    >
                      <option value="">
                        {!organizerInfo
                          ? "Đang tải thông tin organizer..."
                          : venueList.length === 0
                          ? "Không có địa điểm nào"
                          : "Chọn địa điểm..."}
                      </option>
                      {venueList.map((venue) => {
                        const venueCapacity =
                          venue.capacity ||
                          (venue.hasSeats ? venue.row * venue.column : 0);
                        return (
                          <option key={venue.id} value={venue.id}>
                            {venue.name} - {venue.location} (Sức chứa:{" "}
                            {venueCapacity} người)
                          </option>
                        );
                      })}
                    </select>

                    {organizerInfo &&
                      venueList.length === 0 &&
                      !isLoadingVenues && (
                        <p className="text-xs text-orange-600 mt-1">
                          Không có địa điểm nào cho Campus ID:{" "}
                          {organizerInfo.campusId}
                        </p>
                      )}
                  </>
                )}

                {errors.venueId && (
                  <p className="text-red-500 text-xs mt-1">{errors.venueId}</p>
                )}
              </div>

              {/* Số lượng người tham gia - Di chuyển xuống sau Địa điểm */}
              <div>
                <label
                  htmlFor="maxParticipants"
                  className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2"
                >
                  <Users size={16} className="text-orange-500" />
                  Số lượng người tham gia tối đa{" "}
                  <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  id="maxParticipants"
                  name="maxParticipants"
                  value={formData.maxParticipants}
                  onChange={handleChange}
                  min="1"
                  max={
                    formData.venueId
                      ? venueList.find((v) => v.id === Number(formData.venueId))
                          ?.capacity ||
                        (venueList.find(
                          (v) => v.id === Number(formData.venueId)
                        )?.hasSeats
                          ? (venueList.find(
                              (v) => v.id === Number(formData.venueId)
                            )?.row || 0) *
                            (venueList.find(
                              (v) => v.id === Number(formData.venueId)
                            )?.column || 0)
                          : undefined)
                      : undefined
                  }
                  placeholder="100"
                  className={`w-full px-4 py-3 border ${
                    errors.maxParticipants
                      ? "border-red-500"
                      : "border-gray-300"
                  } rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all`}
                  disabled={isSubmitting}
                />
                {/* Hiển thị thông tin capacity của venue đã chọn */}
                {formData.venueId &&
                  (() => {
                    const selectedVenue = venueList.find(
                      (v) => v.id === Number(formData.venueId)
                    );
                    if (selectedVenue) {
                      const venueCapacity =
                        selectedVenue.capacity ||
                        (selectedVenue.hasSeats
                          ? selectedVenue.row * selectedVenue.column
                          : 0);
                      return (
                        <p className="text-xs text-gray-500 mt-1">
                          Sức chứa tối đa của địa điểm:{" "}
                          <span className="font-semibold text-orange-600">
                            {venueCapacity} người
                          </span>
                          {formData.maxParticipants < venueCapacity && (
                            <span className="text-green-600 ml-2">
                              (Còn trống{" "}
                              {venueCapacity - formData.maxParticipants} chỗ)
                            </span>
                          )}
                        </p>
                      );
                    }
                    return null;
                  })()}
                {!formData.venueId && (
                  <p className="text-xs text-gray-500 mt-1">
                    Vui lòng chọn địa điểm trước để xác định sức chứa tối đa
                  </p>
                )}
                {errors.maxParticipants && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.maxParticipants}
                  </p>
                )}
              </div>

              {/* Staff selection */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2">
                  <UserPlus size={16} className="text-orange-500" />
                  Chọn nhân viên hỗ trợ
                </label>

                {isLoadingStaff ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                  </div>
                ) : staffList.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Không có nhân viên nào
                  </div>
                ) : (
                  <div className="border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
                    {staffList.map((staff, index) => (
                      <label
                        key={`staff-${staff.id}-${index}`}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                      >
                        <input
                          type="checkbox"
                          checked={selectedStaffIds.includes(staff.id)}
                          onChange={() => handleStaffToggle(staff.id)}
                          className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
                          disabled={isSubmitting}
                        />
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {staff.firstName} {staff.lastName}
                          </div>
                          <div className="text-sm text-gray-600">
                            {staff.email}
                          </div>
                        </div>
                        {staff.campus && (
                          <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {staff.campus.name}
                          </span>
                        )}
                      </label>
                    ))}
                  </div>
                )}

                {selectedStaffIds.length > 0 && (
                  <p className="text-sm text-gray-600 mt-2">
                    Đã chọn {selectedStaffIds.length} nhân viên
                  </p>
                )}
              </div>

              {/* Recurrence Settings - Chỉ hiển thị khi tạo mới, không hiển thị khi chỉnh sửa */}
              {!event && (
                <div className="bg-gradient-to-r from-orange-50 to-orange-100 border border-orange-200 rounded-lg p-4">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-3">
                    <Repeat size={16} className="text-orange-500" />
                    Lặp lại sự kiện (Tùy chọn)
                  </label>
                  <div className="space-y-3">
                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <label className="text-xs text-gray-600 mb-1 block">
                          Loại lặp lại
                        </label>
                        <select
                          name="recurrenceType"
                          value={formData.recurrenceType}
                          onChange={handleChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                          disabled={isSubmitting}
                        >
                          <option value="NONE">Không lặp</option>
                          <option value="DAILY">Hàng ngày</option>
                          <option value="WEEKLY">Hàng tuần</option>
                          <option value="MONTHLY">Hàng tháng</option>
                        </select>
                      </div>
                      {formData.recurrenceType !== "NONE" && (
                        <>
                          <div className="w-24">
                            <label className="text-xs text-gray-600 mb-1 block">
                              Khoảng cách
                            </label>
                            <input
                              type="number"
                              name="recurrenceInterval"
                              value={formData.recurrenceInterval}
                              onChange={handleChange}
                              min="1"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                              disabled={isSubmitting}
                              placeholder="1"
                            />
                          </div>
                          <div className="w-32">
                            <label className="text-xs text-gray-600 mb-1 block">
                              Số lần (tùy chọn)
                            </label>
                            <input
                              type="number"
                              name="recurrenceCount"
                              value={formData.recurrenceCount}
                              onChange={handleChange}
                              min="1"
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                              disabled={isSubmitting}
                              placeholder="Không giới hạn"
                            />
                          </div>
                        </>
                      )}
                    </div>
                    {formData.recurrenceType !== "NONE" && (
                      <p className="text-xs text-gray-600">
                        Sự kiện sẽ lặp lại{" "}
                        {formData.recurrenceType === "DAILY"
                          ? "hàng ngày"
                          : formData.recurrenceType === "WEEKLY"
                          ? "hàng tuần"
                          : "hàng tháng"}
                        {formData.recurrenceInterval > 1 &&
                          ` (mỗi ${formData.recurrenceInterval} ${
                            formData.recurrenceType === "DAILY"
                              ? "ngày"
                              : formData.recurrenceType === "WEEKLY"
                              ? "tuần"
                              : "tháng"
                          })`}
                        {formData.recurrenceCount &&
                          `, tổng cộng ${formData.recurrenceCount} lần`}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Banner Upload */}
              <div>
                <label
                  htmlFor="banner"
                  className="flex items-center gap-2 text-sm font-semibold text-gray-900 mb-2"
                >
                  <ImageIcon size={16} className="text-orange-500" />
                  Banner sự kiện (tùy chọn)
                </label>

                {/* Preview */}
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
                    >
                      <X size={16} />
                    </button>
                  </div>
                )}

                {/* Upload input */}
                <div className="flex items-center gap-3">
                  <label
                    htmlFor="banner"
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed ${
                      errors.bannerUrl ? "border-red-500" : "border-gray-300"
                    } rounded-lg cursor-pointer hover:border-orange-500 transition-all ${
                      isUploadingBanner || isSubmitting
                        ? "opacity-50 cursor-not-allowed"
                        : ""
                    }`}
                  >
                    <ImageIcon size={20} className="text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {isUploadingBanner
                        ? "Đang tải lên..."
                        : bannerPreview
                        ? "Thay đổi ảnh"
                        : "Chọn ảnh banner"}
                    </span>
                    <input
                      type="file"
                      id="banner"
                      accept="image/*"
                      onChange={handleBannerUpload}
                      disabled={isUploadingBanner || isSubmitting}
                      className="hidden"
                    />
                  </label>
                </div>

                {errors.bannerUrl && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.bannerUrl}
                  </p>
                )}

                <p className="text-xs text-gray-500 mt-1">
                  Kích thước tối đa: 5MB. Định dạng: JPG, PNG, GIF
                </p>
              </div>
            </div>
          </div>

          {/* Footer - ✅ THÊM FLEX-SHRINK-0 */}
          <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-3 border-t border-gray-200 flex-shrink-0">
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
              disabled={
                isSubmitting || !organizerInfo || venueList.length === 0
              }
              className="px-6 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg hover:from-orange-600 hover:to-orange-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Đang lưu...
                </>
              ) : event ? (
                "Cập nhật"
              ) : (
                "Tạo sự kiện"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventFormModal;
