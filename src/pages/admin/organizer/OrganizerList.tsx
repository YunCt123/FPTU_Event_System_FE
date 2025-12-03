import OrganizerListGrid from '../../../components/admin/organizer/OrganizerListGrid'



const OrganizerList = () => {
  return (
    <div>
       <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Nhà tổ chức</h1>
          <p className="text-gray-600 mt-1 mb-6">Quản lý danh sách các nhà tổ chức sự kiện</p>        
        </div>
        <div>
            <OrganizerListGrid/>
        </div>
        
    </div>
  )
}



export default OrganizerList