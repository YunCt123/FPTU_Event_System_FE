import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import userService from '../../../services/userService'
import organizerService from '../../../services/organizerService'
import type { User } from '../../../types/User'
import type { OrganizerRequest, OrganizerResponse } from '../../../types/Organizer'

interface AddOrganizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newOrganizer: OrganizerResponse) => void;
}

const AddOrganizerModal: React.FC<AddOrganizerModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contactEmail: '',
    logoUrl: '',
    campusId: 0,
    ownerId: 0
  });
  
  const [eventOrganizers, setEventOrganizers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch event organizers when modal opens
  useEffect(() => {
    if (isOpen) {
      fetchEventOrganizers();
    }
  }, [isOpen]);

  const fetchEventOrganizers = async () => {
    setIsLoading(true);
    try {
      const response = await userService.getUsers({ 
        roleName: 'event_organizer'
      });
     
      if (response) {
        setEventOrganizers(response.data.data);
      }else{
        console.log("no data");
      }
    } catch (error: any) {
      console.error('Error fetching event organizers:', error);
      toast.error('Không thể tải danh sách event organizer');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.logoUrl) {
      toast.error('URL Logo là bắt buộc!');
      return;
    }
    
    if (!formData.ownerId) {
      toast.error('Vui lòng chọn Event Organizer!');
      return;
    }

    if (!formData.campusId) {
      toast.error('Vui lòng chọn cơ sở!');
      return;
    }

    setIsSubmitting(true);
    try {
      // Create FormData
      const payload: OrganizerRequest = {
  name: formData.name,
  description: formData.description || "",
  contactEmail: formData.contactEmail,
  logoUrl: formData.logoUrl,
  ownerId: Number(formData.ownerId),
  campusId: Number(formData.campusId),
};

      const response = await organizerService.postOrganizer(payload);
      console.log("data", response);
      if (response.status === 201) {
        toast.success('Thêm nhà tổ chức thành công!');
        onSuccess(response.data as any);
        
        // Reset form
        setFormData({
          name: '',
          description: '',
          contactEmail: '',
          logoUrl: '',
          campusId: 0,
          ownerId: 0
        });
        
        onClose();
      }
    } catch (error: any) {
      console.error('Error adding organizer:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.data?.message || 
                          'Không thể thêm nhà tổ chức!';
      toast.error(errorMessage);
      console.log("Response data:", error.response?.data);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    // Reset form khi hủy
    setFormData({
      name: '',
      description: '',
      contactEmail: '',
      logoUrl: '',
      campusId: 0,
      ownerId: 0
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex justify-center items-center p-4" onClick={handleCancel}>
      {/* Modal Content */}
      <div 
        className="bg-white rounded-xl p-8 w-full max-w-2xl shadow-2xl transform transition-all duration-300 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex justify-between items-start border-b pb-4 mb-6">
          <h3 className="text-3xl font-bold text-gray-800">Thêm nhà tổ chức mới</h3>
          <button 
            onClick={handleCancel} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Logo URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL Logo <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              name="logoUrl"
              value={formData.logoUrl}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent outline-none transition"
              placeholder="https://example.com/logo.png"
            />
            {formData.logoUrl && (
              <div className="mt-3 flex justify-center">
                <img 
                  src={formData.logoUrl} 
                  alt="Preview" 
                  className="w-24 h-24 object-contain p-2 bg-gray-50 border border-gray-200 rounded-lg"
                  onError={(e) => {
                    e.currentTarget.src = 'https://via.placeholder.com/96?text=No+Image';
                  }}
                />
              </div>
            )}
          </div>

          {/* Tên nhà tổ chức */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tên nhà tổ chức <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent outline-none transition"
              placeholder="Nhập tên nhà tổ chức"
            />
          </div>

          {/* Cơ sở */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cơ sở <span className="text-red-500">*</span>
            </label>
            <select
              name="campusId"
              value={formData.campusId}
              onChange={(e) => setFormData(prev => ({ ...prev, campusId: parseInt(e.target.value) }))}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent outline-none transition"
            >
              <option value="0">Chọn cơ sở</option>
              <option value="1">FU - Hà Nội</option>
              <option value="2">FU - Hồ Chí Minh</option>
              <option value="3">FU - Đà Nẵng</option>
              <option value="4">FU - Cần Thơ</option>
              <option value="5">FU - Quy Nhơn</option>
            </select>
          </div>

          {/* Event Organizer (Owner) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Organizer <span className="text-red-500">*</span>
            </label>
            <select
              name="ownerId"
              value={formData.ownerId}
              onChange={(e) => setFormData(prev => ({ ...prev, ownerId: parseInt(e.target.value) }))}
              required
              disabled={isLoading}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="0">{isLoading ? 'Đang tải...' : 'Chọn Event Organizer'}</option>
              {eventOrganizers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </select>
            {eventOrganizers.length === 0 && !isLoading && (
              <p className="text-sm text-amber-600 mt-1">
                Không có Event Organizer nào. Vui lòng tạo user với role event_organizer trước.
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email liên hệ <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="contactEmail"
              value={formData.contactEmail}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent outline-none transition"
              placeholder="example@fpt.edu.vn"
            />
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Mô tả chi tiết <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent outline-none transition resize-none"
              placeholder="Mô tả về nhà tổ chức..."
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || eventOrganizers.length === 0}
              className="px-6 py-2.5 bg-[#F27125] text-white rounded-lg hover:bg-[#d95c0b] transition-colors font-medium shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Đang thêm...' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddOrganizerModal
