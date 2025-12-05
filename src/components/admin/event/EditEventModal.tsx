import { useState } from "react";
import { Save } from "lucide-react";

export default function EditEventModal({ initialData, onSubmit, submitting }: {
  initialData: any;
  onSubmit: (data: any) => void;
  submitting: boolean;
}) {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState<any>({});

  const validate = () => {
    const newErrors: any = {};
    if (!formData.name?.trim()) newErrors.name = "Tên sự kiện là bắt buộc";
    if (!formData.organizer?.trim()) newErrors.organizer = "Ban tổ chức là bắt buộc";
    if (!formData.date?.trim()) newErrors.date = "Ngày tổ chức là bắt buộc";
    if (!formData.venue?.trim()) newErrors.venue = "Địa điểm là bắt buộc";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
    setErrors((prev: any) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-6">

      {/* Image URL */}
      <div>
        <label className="block text-sm font-medium mb-2">URL Hình ảnh</label>
        <input
          type="text"
          name="image"
          value={formData.image}
          onChange={handleChange}
          placeholder="https://example.com/image.jpg"
          className="w-full px-4 py-2 border rounded-lg"
        />
        {formData.image && (
          <img
            src={formData.image}
            alt="Preview"
            className="w-full h-64 object-cover rounded-lg mt-2"
            onError={(e) => (e.currentTarget.style.display = "none")}
          />
        )}
      </div>

      {/* Name */}
      <div>
        <label className="block text-sm font-medium mb-2">Tên sự kiện *</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg ${errors.name ? "border-red-500" : "border-gray-300"}`}
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>

      {/* Organizer */}
      <div>
        <label className="block text-sm font-medium mb-2">Ban tổ chức *</label>
        <input
          type="text"
          name="organizer"
          value={formData.organizer}
          onChange={handleChange}
          className={`w-full px-4 py-2 border rounded-lg ${errors.organizer ? "border-red-500" : "border-gray-300"}`}
        />
        {errors.organizer && <p className="text-red-500 text-sm">{errors.organizer}</p>}
      </div>

      {/* Date + Venue */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Ngày tổ chức *</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg ${errors.date ? "border-red-500" : "border-gray-300"}`}
          />
          {errors.date && <p className="text-red-500 text-sm">{errors.date}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Địa điểm *</label>
          <input
            type="text"
            name="venue"
            value={formData.venue}
            onChange={handleChange}
            className={`w-full px-4 py-2 border rounded-lg ${errors.venue ? "border-red-500" : "border-gray-300"}`}
          />
          {errors.venue && <p className="text-red-500 text-sm">{errors.venue}</p>}
        </div>
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium mb-2">Trạng thái</label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="w-full px-4 py-2 border rounded-lg border-gray-300"
        >
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium mb-2">Mô tả</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={5}
          className="w-full px-4 py-2 border rounded-lg border-gray-300"
        />
      </div>

      {/* Buttons */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <button
          type="submit"
          disabled={submitting}
          className={`flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 ${submitting ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <Save size={20} />
          {submitting ? "Đang lưu..." : "Lưu"}
        </button>
      </div>
    </form>
  );
}
