import React from 'react'


const OrganizerCard = ({ organizer, onOpenDetails, onDelete }) => {

  return (
    <div className="bg-orange-100 p-5 rounded-xl shadow-lg flex flex-col items-center relative w-72 m-4 transition transform hover:shadow-xl cursor-pointer"
    onClick={() => onOpenDetails(organizer)}
    >
      <button
        onClick={(e) => {
          e.stopPropagation(); 
          onDelete(organizer.id);
        }}   
            
      className="absolute top-3 right-3 text-[#F27125] hover:text-[#d95c0b] p-1 rounded-full transition duration-150 z-10 cursor-pointer"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>
      
      <div className="w-28 h-28 border-2 border-gray-100 rounded-full overflow-hidden mb-4 ">
        <img 
          src={organizer.logo_url} 
          alt={""} 
          className="w-full h-full object-contain"
        />

        
      </div>
      <div className="flex flex-col text-center mb-6">
        <div className="h-20 flex items-center">
          <h2 className="text-xl font-bold text-gray-800 mb-1">{`${organizer.name}`}</h2>
        </div>  
        <div className="">
          <p className="text-sm text-gray-500">{organizer.campus}</p>
          <p className="text-xs text-gray-400 mt-2">{organizer.contactEmail}</p>
        </div>     
        
      </div>
      <div className="flex w-full space-x-3 max-w-xs">
        {/* <button 
          onClick={() => onOpenDetails(organizer)}
          className="flex-1 py-3 px-2 bg-blue-100 text-blue-500 rounded-xl transition hover:bg-blue-200 font-medium text-lg">
          <span className="icon">👁️</span>
        </button> */}

        {/* <button 
          onClick={() => onDelete(organizer.id)}
          className="flex-1 py-3 px-2 bg-red-400 text-white rounded-xl transition hover:bg-red-500 font-medium text-lg">
          <span> Xóa </span>
        </button> */}
      </div>
    </div>
  )
}


export default OrganizerCard