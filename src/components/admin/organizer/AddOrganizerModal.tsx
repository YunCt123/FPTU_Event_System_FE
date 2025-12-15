import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { X } from 'lucide-react'
import userService from '../../../services/userService'
import organizerService from '../../../services/organizerService'
import { uploadImageToCloudinary } from '../../../utils/uploadImg'
import type { User } from '../../../types/User'
import type { OrganizerRequest, OrganizerResponse } from '../../../types/Organizer'

interface AddOrganizerModalProps {
  onClose: () => void;
  onSuccess: (newOrganizer: OrganizerResponse) => void;
}

const AddOrganizerModal: React.FC<AddOrganizerModalProps> = ({ onClose, onSuccess }) => {
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
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [currentUserRole, setCurrentUserRole] = useState<string>('');

  // Check user role and fetch event organizers
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await userService.getUserInUse();
        const currentUser = response.data;
        console.log("object", currentUser);
        
        // Extract role from user object
        const role = currentUser.role || currentUser.roleName;
        setCurrentUserRole(role);
        
        // If user is event_organizer, auto-fill ownerId and campusId
        if (role === 'event_organizer') {
          if (currentUser.id) {
            setFormData(prev => ({ 
              ...prev, 
              ownerId: Number(currentUser.id),
              campusId: currentUser.campus?.id ? Number(currentUser.campus.id) : 0
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        // Fallback to localStorage if API fails
        const userStr = localStorage.getItem('user');
        if (userStr) {
          try {
            const user = JSON.parse(userStr);
            const role = user.role || user.roleName || user["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];
            setCurrentUserRole(role);
            
            // If user is event_organizer, auto-fill ownerId and campusId from localStorage
            if (role === 'event_organizer') {
              const userId = user.id || user.sub || user["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
              const userCampusId = user.campusId || user.CampusId;
              
              if (userId) {
                setFormData(prev => ({ 
                  ...prev, 
                  ownerId: Number(userId),
                  campusId: userCampusId ? Number(userCampusId) : 0
                }));
              }
            }
          } catch (error) {
            console.error('Error parsing user from localStorage:', error);
          }
        }
      }
    };
    
    fetchCurrentUser();
    fetchEventOrganizers();
    
    // Cleanup preview URL on unmount
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
      if(currentUserRole === 'admin'){
        console.error('Error fetching event organizers:', error);
        toast.error('Không thể tải danh sách event organizer');
      }    
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    // Create preview using Object URL
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    // Upload image to Cloudinary immediately
    setIsUploading(true);
    try {
      const imageUrl = await uploadImageToCloudinary(file);
      setFormData(prev => ({ ...prev, logoUrl: imageUrl }));
      toast.success('Tải ảnh lên thành công!');
    } catch (err: any) {
      toast.error('Có lỗi xảy ra khi tải ảnh lên');
      console.error('Error uploading image:', err);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl('');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl('');
    setFormData(prev => ({ ...prev, logoUrl: '' }));
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
    // Cleanup preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    // Reset form khi hủy
    setFormData({
      name: '',
      description: '',
      contactEmail: '',
      logoUrl: '',
      campusId: 0,
      ownerId: 0
    });
    setPreviewUrl('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div 
        className="bg-white rounded-xl shadow-xl w-full max-w-2xl flex flex-col overflow-hidden"
        style={{ maxHeight: '90vh' }}
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-6 bg-gradient-to-r from-[#F27125] to-[#d95c0b] rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold text-white">Thêm nhà tổ chức mới</h2>
            <p className="text-sm text-white/90">Điền thông tin để tạo nhà tổ chức</p>
          </div>
          <button 
            onClick={handleCancel} 
            className="text-white/80 hover:text-white transition-colors"
            aria-label="Đóng"
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* Form Content - Scrollable */}
          <div className="flex-1 overflow-y-auto p-6" style={{ maxHeight: 'calc(90vh - 180px)' }}>
            <div className="space-y-6">
          {/* Logo Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Logo <span className="text-red-500">*</span>
            </label>
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                disabled={isUploading}
                aria-label="Chọn ảnh logo"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent outline-none transition file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#F27125] file:text-white hover:file:bg-[#d65d1a] disabled:opacity-50 disabled:cursor-not-allowed"
              />
              {isUploading && (
                <p className="text-sm text-[#F27125]">Đang tải ảnh lên...</p>
              )}
              {previewUrl && (
                <div className="flex items-center gap-3">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-24 h-24 object-contain p-2 bg-gray-50 border border-gray-200 rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="text-red-600 hover:text-red-700 text-sm font-medium"
                  >
                    Xóa ảnh
                  </button>
                </div>
              )}
            </div>
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
              disabled={currentUserRole === 'event_organizer'}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="0">Chọn cơ sở</option>
              <option value="1">FU - Hà Nội</option>
              <option value="2">FU - Hồ Chí Minh</option>
              <option value="3">FU - Đà Nẵng</option>
              <option value="4">FU - Cần Thơ</option>
              <option value="5">FU - Quy Nhơn</option>
            </select>
            {currentUserRole === 'event_organizer' && (
              <p className="text-sm text-blue-600 mt-1">
                Cơ sở được tự động chọn theo tài khoản của bạn
              </p>
            )}
          </div>

          {/* Event Organizer (Owner) */}
          {currentUserRole !== 'event_organizer' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Organizer <span className="text-red-500">*</span>
            </label>
            <select
              name="ownerId"
              value={formData.ownerId}
              onChange={(e) => setFormData(prev => ({ ...prev, ownerId: parseInt(e.target.value) }))}
              required
              disabled={isLoading || currentUserRole === 'event_organizer'}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent outline-none transition disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="0">{isLoading ? 'Đang tải...' : 'Chọn Event Organizer'}</option>
              {eventOrganizers.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName} ({user.email})
                </option>
              ))}
            </select>
            {currentUserRole === 'event_organizer' && (
              <p className="text-sm text-blue-600 mt-1">
                Bạn đang được tự động chọn làm Event Organizer
              </p>
            )}
            {eventOrganizers.length === 0 && !isLoading && currentUserRole !== 'event_organizer' && (
              <p className="text-sm text-amber-600 mt-1">
                Không có Event Organizer nào. Vui lòng tạo user với role event_organizer trước.
              </p>
            )}
          </div>
          )}

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
            </div>
          </div>

          {/* Footer - Fixed */}
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <button
              type="button"
              onClick={handleCancel}
              disabled={isSubmitting}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || (currentUserRole !== 'event_organizer' && eventOrganizers.length === 0)}
              className="px-6 py-2.5 bg-[#F27125] text-white rounded-lg hover:bg-[#d65d1a] transition-colors shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
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
