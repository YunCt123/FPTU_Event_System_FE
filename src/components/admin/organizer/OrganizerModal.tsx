import React from 'react'

interface OrganizerModalProps {
  organizer: {
    id: number;
    name: string;
    description: string;
    contactEmail: string;
    logo_url: string;
    campus: string;
  } | null;
  onClose: () => void;
}

const OrganizerModal: React.FC<OrganizerModalProps> = ({ organizer, onClose }) => {

  if (!organizer) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center items-center p-4" onClick={onClose}>
      {/* Modal Content */}
      <div 
        className="bg-white rounded-xl p-8 w-full max-w-2xl shadow-2xl transform transition-all duration-300 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()} 
      >
        <div className="flex justify-between items-start border-b pb-4 mb-6">
          <h3 className="text-3xl font-bold text-gray-800">{organizer.name}</h3>
          {/* <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button> */}
        </div>
        
        <div className="space-y-6">
          <div className="flex items-start space-x-6 bg-gray-50 p-6 rounded-lg">
            <div className="flex-shrink-0">
              <img 
                src={organizer.logo_url} 
                alt={`${organizer.name} Logo`} 
                className="w-24 h-24 object-contain p-2 bg-white border-2 border-gray-200 rounded-lg shadow-sm"
              />
            </div>
            <div className="flex-1">
              <div className="mb-3">
                <p className="text-sm text-gray-500 font-medium">Cơ sở</p>
                <p className="text-lg text-gray-800 font-semibold">{organizer.campus}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Email liên hệ</p>
                <a 
                  href={`mailto:${organizer.contactEmail}`}
                  className="text-lg text-[#F27125] hover:text-[#d95c0b] font-medium hover:underline"
                >
                  {organizer.contactEmail}
                </a>
              </div>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-[#F27125]" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              Mô tả chi tiết
            </h4>
            <p className="text-gray-700 leading-relaxed text-justify">
              {organizer.description}
            </p>
          </div>
        </div>
        
        <div className="mt-6 pt-4 border-t flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  )
}


export default OrganizerModal