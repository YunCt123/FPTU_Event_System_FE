import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";

interface EventData {
  id: number;
  name: string;
  organizer: string;
  date: string;
  venue: string;
  status: string;
  description: string;
  image: string;
}

export default function EditEventPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<EventData | null>(null);

  // mock data load
  useEffect(() => {
    const mockEvents: EventData[] = [
      {
        id: 1,
        name: "Tech Conference 2025",
        organizer: "FPT University",
        date: "2025-12-10",
        venue: "Hall A",
        status: "pending",
        image:
          "https://thanhnien.mediacdn.vn/Uploaded/dieutrang-qc/2022_04_24/fpt2-7865.jpg",
        description:
          "A comprehensive technology conference featuring the latest innovations.",
      },
      {
        id: 2,
        name: "Music Festival Summer",
        organizer: "Student Club",
        date: "2025-08-15",
        venue: "Main Stadium",
        status: "approved",
        image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800",
        description: "Exciting summer music festival with international artists.",
      },
    ];

    const found = mockEvents.find((e) => e.id === Number(id));
    if (!found) {
      alert("Không tìm thấy sự kiện!");
      navigate("/admin/list-events");
      return;
    }

    setFormData(found);
    setLoading(false);
  }, [id, navigate]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData) return;

    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 500));
    console.log("Updated event:", formData);
    alert("Cập nhật sự kiện thành công!");
    navigate("/admin/list-events");
  };

  if (loading) return <div className="p-6 text-gray-600">Loading...</div>;
  if (!formData) return null;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft size={24} />
        </button>

        <div>
          <h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
          <p className="text-gray-600 mt-1">Chỉnh sửa thông tin sự kiện</p>
        </div>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6">
        {/* Image Preview */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Event Image
          </label>
          {formData.image && (
            <img
              src={formData.image}
              alt="Event"
              className="w-full h-64 object-cover rounded-lg mb-3"
            />
          )}
          <input
            type="text"
            name="image"
            value={formData.image}
            onChange={handleChange}
            placeholder="Image URL"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Event Name */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Tên sự kiện <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Organizer */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Ban tổ chức <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="organizer"
            value={formData.organizer}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Date & Venue */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Ngày tổ chức <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Địa điểm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="venue"
              value={formData.venue}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Status */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Trạng thái
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Mô tả
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows={5}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={submitting}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            <Save size={20} />
            {submitting ? "Đang lưu..." : "Lưu thay đổi"}
          </button>

          <button
            type="button"
            onClick={() => navigate(-1)}
            className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  );
}
