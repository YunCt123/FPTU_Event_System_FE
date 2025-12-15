import React from 'react'
import UserListTable from '../../../components/admin/user/UserListTable'


const UserList = (param: role) => {
  return (
    <div className="p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Quản lý User</h1>
          <p className="text-gray-600 mt-1">Quản lý danh sách người dùng trong hệ thống</p>
        </div>
        <div>
            <UserListTable/>
        </div>
    </div>
  )
}



export default UserList