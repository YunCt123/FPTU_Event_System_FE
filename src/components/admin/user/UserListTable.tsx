import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import { useSearchParams } from 'react-router-dom';
import userService from '../../../services/userService';
import type { User } from '../../../types/User';
import { UserStar, UserCog, User as UserIcon, Search, Loader, Mail, Phone, MapPin } from 'lucide-react';

const UserListTable = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const roleFromUrl = searchParams.get('role') as 'event_organizer' | 'staff' | 'student' | null;
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'event_organizer' | 'staff' | 'student'>(roleFromUrl || 'event_organizer');
  const [searchTerm, setSearchTerm] = useState('');

  const roleLabels = {
    event_organizer: 'Event Organizer',
    staff: 'Staff',
    student: 'Student'
  };

  const roleIcons = {
    event_organizer: <UserStar size={20} className="text-purple-600" />,
    staff: <UserCog size={20} className="text-blue-600" />,
    student: <UserIcon size={20} className="text-green-600" />
  };

  useEffect(() => {
    if (roleFromUrl && roleFromUrl !== activeTab) {
      setActiveTab(roleFromUrl);
    }
  }, [roleFromUrl]);

  useEffect(() => {
    fetchUsers();
  }, [activeTab]);

  useEffect(() => {
    filterUsers();
    console.log("object", roleFromUrl);
  }, [users, searchTerm]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await userService.getUsers({ roleName: activeTab });
      if (response.data.data) {
        setUsers(response.data.data);
      }
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Không thể tải danh sách người dùng');
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    if (!searchTerm.trim()) {
      setFilteredUsers(users);
      return;
    }

    const term = searchTerm.toLowerCase();
    const filtered = users.filter(user => 
      user.userName.toLowerCase().includes(term) ||
      user.email.toLowerCase().includes(term) ||
      user.firstName.toLowerCase().includes(term) ||
      user.lastName.toLowerCase().includes(term) ||
      user.studentCode?.toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
  };

  const getCampusName = (campusId: number) => {
    const campuses: { [key: number]: string } = {
      1: 'FU - Hòa Lạc',
      2: 'FU - Hồ Chí Minh',
      3: 'FU - Đà Nẵng',
      4: 'FU - Cần Thơ',
      5: 'FU - Quy Nhơn'
    };
    return campuses[campusId] || 'N/A';
  };

  return (
    <div className="bg-white rounded-xl shadow-sm">
      {/* Search Bar */}
      <div className="p-4 border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Tìm kiếm theo tên, email, mã sinh viên..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#F27125] focus:border-transparent outline-none"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="animate-spin text-[#F27125]" size={40} />
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-block p-4 bg-gray-100 rounded-full mb-4">
              {roleIcons[activeTab]}
            </div>
            <p className="text-gray-500">
              {searchTerm ? 'Không tìm thấy người dùng phù hợp' : `Chưa có ${roleLabels[activeTab]} nào`}
            </p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">ID</th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Người dùng
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Campus
                </th>
                
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm text-gray-700">{user.id}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {user.avatar ? (
                        <img 
                          src={user.avatar} 
                          alt={user.userName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F27125] to-[#d95c0b] flex items-center justify-center text-white font-semibold">
                          {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-gray-900">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-sm text-gray-500">@{user.userName}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-700">
                      {getCampusName(user.campus?.id)}
                    </span>
                  </td>                
                  <td className="px-6 py-4">   
                    <a
                        href={`mailto:${user.email}`}
                        className="text-sm text-[#F27125] hover:text-[#d95c0b] hover:underline"
                      >{user.email}</a>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`
                      inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                      ${user.isActive 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                      }
                    `}>
                      {user.isActive ? 'Hoạt động' : 'Vô hiệu hóa'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-600">
                      {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Footer */}
      {!loading && filteredUsers.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            Tổng số: <span className="font-semibold">{filteredUsers.length}</span> {roleLabels[activeTab]}
          </p>
        </div>
      )}
    </div>
  );
};

export default UserListTable;