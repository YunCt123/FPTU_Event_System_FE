import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { X } from 'lucide-react'
import type { OrganizerResponse } from '../../../types/Organizer'
import organizerService from '../../../services/organizerService'
import userService from '../../../services/userService'
import { uploadImageToCloudinary } from '../../../utils/uploadImg'
import type { User } from '../../../types/User'

interface OrganizerModalProps {
  organizer: OrganizerResponse | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const OrganizerModal: React.FC<OrganizerModalProps> = ({ organizer, isOpen, onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [eventOrganizers, setEventOrganizers] = useState<User[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contactEmail: '',
    logoUrl: '',
    campusId: 0,
    campusName: '',
    ownerId: 0,
    ownerName: '',
    createdAt: '',
    updatedAt: ''
  });

  useEffect(() => {
    if (isOpen && organizer) {
      setFormData({
        name: organizer.name,
        description: organizer.description,
        contactEmail: organizer.contactEmail,
        logoUrl: organizer.logoUrl || '',
        campusId: organizer.campusId,
        campusName: organizer.campus?.name || '',
        ownerId: organizer.ownerId || 0,
        ownerName: organizer.owner ? `${organizer.owner.firstName || ''} ${organizer.owner.lastName || ''}`.trim() : 'Chưa có',
        createdAt: organizer.createdAt,
        updatedAt: organizer.updatedAt
      });
      setPreviewUrl(organizer.logoUrl || '');
      fetchEventOrganizers();
    }

    return () => {
      if (previewUrl && previewUrl !== organizer?.logoUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [isOpen, organizer]);

  const fetchEventOrganizers = async () => {
    setIsLoadingUsers(true);
    try {
      const response = await userService.getUsers({ 
        roleName: 'event_organizer'
      });
      if (response) {
        setEventOrganizers(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching event organizers:', error);
    } finally {
      setIsLoadingUsers(false);
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

    if (previewUrl && previewUrl !== organizer?.logoUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    setIsUploading(true);
    try {
      const imageUrl = await uploadImageToCloudinary(file);
      setFormData(prev => ({ ...prev, logoUrl: imageUrl }));
      toast.success('Tải ảnh lên thành công!');
    } catch (err: any) {
      toast.error('Có lỗi xảy ra khi tải ảnh lên');
      console.error('Error uploading image:', err);
      if (previewUrl && previewUrl !== organizer?.logoUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPreviewUrl(organizer?.logoUrl || '');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    if (previewUrl && previewUrl !== organizer?.logoUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewUrl('');
    setFormData(prev => ({ ...prev, logoUrl: '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!organizer) return;

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
      const updateData = {
        name: formData.name,
        description: formData.description,
        contactEmail: formData.contactEmail,
        logoUrl: formData.logoUrl,
        campusId: formData.campusId,
        ownerId: formData.ownerId
      };

      const response = await organizerService.putOrganizer(organizer.id, updateData);
      
      if (response.status === 200 || response.data.success) {
        toast.success('Cập nhật nhà tổ chức thành công!');
        onSuccess?.();
        onClose();
      }
    } catch (error: any) {
      console.error('Error updating organizer:', error);
      const errorMessage = error.response?.data?.message || 
                          error.response?.data?.data?.message || 
                          'Không thể cập nhật nhà tổ chức!';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!organizer) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div 
        className="bg-white rounded-xl shadow-xl w-full max-w-3xl"
        onClick={(e) => e.stopPropagation()} 
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 bg-gradient-to-r from-[#F27125] to-[#d95c0b] rounded-t-xl">
          <div>
            <h2 className="text-xl font-bold text-white">Cập nhật nhà tổ chức</h2>
            <p className="text-sm text-white/90">Chỉnh sửa thông tin nhà tổ chức</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white transition-colors"
            aria-label="Đóng"
          >
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          {/* Form Content */}
          <div className="p-5">
            <div className="grid grid-cols-2 gap-4">
              {/* Left Column */}
              <div className="space-y-4">
                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Logo <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-3">
                    {previewUrl ? (
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="w-16 h-16 object-contain p-1 bg-gray-50 border border-gray-200 rounded-lg"
                      />
                    ) : (
                      <div className="w-16 h-16 bg-gray-100 border border-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs">
                        No image
                      </div>
                    )}
                    <div className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        disabled={isUploading}
                        aria-label="Chọn ảnh logo"
                        className="w-full text-sm border border-gray-300 rounded-lg file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-[#F27125] file:text-white hover:file:bg-[#d65d1a] disabled:opacity-50"
                      />
                      {isUploading && <p className="text-xs text-[#F27125] mt-1">Đang tải...</p>}
                      {previewUrl && (
                        <button type="button" onClick={handleRemoveImage} className="text-red-600 text-xs mt-1">
                          Xóa ảnh
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tên nhà tổ chức */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tên nhà tổ chức <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent outline-none text-sm"
                    placeholder="Nhập tên nhà tổ chức"
                  />
                </div>

                {/* Cơ sở */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cơ sở <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="campusId"
                    value={formData.campusId}
                    onChange={(e) => setFormData(prev => ({ ...prev, campusId: parseInt(e.target.value) }))}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent outline-none text-sm"
                  >
                    <option value="0">Chọn cơ sở</option>
                    <option value="1">FU - Hà Nội</option>
                    <option value="2">FU - Hồ Chí Minh</option>
                    <option value="3">FU - Đà Nẵng</option>
                    <option value="4">FU - Cần Thơ</option>
                    <option value="5">FU - Quy Nhơn</option>
                  </select>
                </div>

                {/* Event Organizer */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Event Organizer <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="ownerId"
                    value={formData.ownerId}
                    onChange={(e) => setFormData(prev => ({ ...prev, ownerId: parseInt(e.target.value) }))}
                    required
                    disabled={isLoadingUsers}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent outline-none text-sm disabled:bg-gray-100"
                  >
                    <option value="0">{isLoadingUsers ? 'Đang tải...' : 'Chọn Event Organizer'}</option>
                    {eventOrganizers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.firstName} {user.lastName} ({user.email})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Right Column */}
              <div className="space-y-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email liên hệ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent outline-none text-sm"
                    placeholder="example@fpt.edu.vn"
                  />
                </div>

                {/* Mô tả */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Mô tả chi tiết <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent outline-none text-sm resize-none"
                    placeholder="Mô tả về nhà tổ chức..."
                  />
                </div>

                {/* Thông tin thời gian */}
                {/* <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Ngày tạo</label>
                    <input
                      type="text"
                      value={formData.createdAt ? new Date(formData.createdAt).toLocaleString('vi-VN') : 'N/A'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Cập nhật cuối</label>
                    <input
                      type="text"
                      value={formData.updatedAt ? new Date(formData.updatedAt).toLocaleString('vi-VN') : 'N/A'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600 text-sm"
                    />
                  </div>
                </div> */}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors disabled:opacity-50"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploading}
              className="px-5 py-2 bg-[#F27125] text-white rounded-lg hover:bg-[#d65d1a] transition-colors shadow-md disabled:opacity-50"
            >
              {isSubmitting ? 'Đang cập nhật...' : 'Cập nhật'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default OrganizerModal