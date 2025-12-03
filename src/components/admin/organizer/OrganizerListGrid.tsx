import React, { useState } from 'react'
import OrganizerCard from './OrganizerCard'
import OrganizerModal from './OrganizerModal';

const OrganizerListGrid = () => {
  const [selectedOrganizer, setSelectedOrganizer] = useState(null);


  const [organizers, setOrganizers] = useState([
     {
    id: 1,
    name: "FPT Event Club",
    description: "A student-led group responsible for organizing cultural, entertainment, and academic events at FPT University.",
    contactEmail: "eventclub@fpt.edu.vn",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/4/43/FPT_Education_logo.png",
    campus: "FPT University Hà Nội"
  },
  {
    id: 2,
    name: "FPT Media Team",
    description: "Specializes in media production, photography, and event livestream support for university activities.",
    contactEmail: "mediateam@fpt.edu.vn",
    logo_url: "https://media.glassdoor.com/sql/472026/fpt-software-squarelogo-1568261569651.png",
    campus: "FPT University Hồ Chí Minh"
  },
  {
    id: 3,
    name: "FPT Volunteer Club",
    description: "Organizes charity events, community services, and volunteer activities for students.",
    contactEmail: "volunteer@fpt.edu.vn",
    logo_url: "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/FPT_Polytechnic.png/640px-FPT_Polytechnic.png",
    campus: "FPT University Đà Nẵng"
  },
  {
    id: 4,
    name: "FPT Developer Student Club",
    description: "A tech community that hosts workshops, hackathons, and developer training programs.",
    contactEmail: "dsc@fpt.edu.vn",
    logo_url: "https://seeklogo.com/images/G/google-developers-logo-55B3A9F9E8-seeklogo.com.png",
    campus: "FPT University Cần Thơ"
  } 
  ]);

  const handleOpenDetails = (org) => {
    setSelectedOrganizer(org);
  };

  const handleCloseDetails = () => {
    setSelectedOrganizer(null);
  };

  const handleDeleteOrganizer = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tổ chức này?")) {
      setOrganizers(organizers.filter(org => org.id !== id));
    }
  };

  return (

    <div className="grid 
        grid-cols-1 
        sm:grid-cols-2 
        lg:grid-cols-3 
        xl:grid-cols-4 
        gap-6">
            
        {organizers.map(org => (
          <OrganizerCard 
            key={org.id} 
            organizer={org} 
            onOpenDetails={handleOpenDetails} 
            onDelete={handleDeleteOrganizer}
          />
        ))}
      
      <OrganizerModal 
        organizer={selectedOrganizer} 
        onClose={handleCloseDetails} 
      />
    </div>
  )
}



export default OrganizerListGrid