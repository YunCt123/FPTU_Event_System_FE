import React, { useState } from 'react'
import { toast } from 'react-toastify'

import type { Organizer } from '../../../types/Organizer';

interface AddOrganizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newOrganizer: Organizer) => void;
}

const AddOrganizerModal: React.FC<AddOrganizerModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    contactEmail: '',
    logo_url: '',
    campus: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: Gọi API thêm mới
    const newOrganizer = {
      id: Date.now(), // Tạm thời dùng timestamp làm ID
      ...formData
    };
    
    onSuccess(newOrganizer);
    toast.success('Thêm nhà tổ chức thành công!');
    
    // Reset form
    setFormData({
      name: '',
      description: '',
      contactEmail: '',
      logo_url: '',
      campus: ''
    });
    
    onClose();
  };

  const handleCancel = () => {
    // Reset form khi hủy
    setFormData({
      name: '',
      description: '',
      contactEmail: '',
      logo_url: '',
      campus: ''
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
              URL Logo
            </label>
            <input
              type="text"
              name="logo_url"
              value={formData.logo_url}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent outline-none transition"
              placeholder="https://example.com/logo.png"
            />
            {formData.logo_url && (
              <div className="mt-3 flex justify-center">
                <img 
                  src={formData.logo_url} 
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
              name="campus"
              value={formData.campus}
              onChange={handleChange}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent outline-none transition"
            >
              <option value="">Chọn cơ sở</option>
              <option value="FPT University Hà Nội">FPT University Hà Nội</option>
              <option value="FPT University Hồ Chí Minh">FPT University Hồ Chí Minh</option>
              <option value="FPT University Đà Nẵng">FPT University Đà Nẵng</option>
              <option value="FPT University Cần Thơ">FPT University Cần Thơ</option>
              <option value="FPT University Quy Nhơn">FPT University Quy Nhơn</option>
            </select>
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
              className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-[#F27125] text-white rounded-lg hover:bg-[#d95c0b] transition-colors font-medium shadow-md"
            >
              Thêm mới
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default AddOrganizerModal
