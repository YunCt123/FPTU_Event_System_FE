import React, { useState } from "react";
import OrganizerCard from "./OrganizerCard";
import OrganizerModal from "./OrganizerModal";
import { Search } from "lucide-react";

const OrganizerListGrid = () => {
  const [selectedOrganizer, setSelectedOrganizer] = useState(null);

  const [organizers, setOrganizers] = useState([
    {
      id: 1,
      name: "FPT Event Club",
      description:
        "A student-led group responsible for organizing cultural, entertainment, and academic events at FPT University.",
      contactEmail: "eventclub@fpt.edu.vn",
      logo_url:
        "https://upload.wikimedia.org/wikipedia/commons/4/43/FPT_Education_logo.png",
      campus: "FPT University Hà Nội",
    },
    {
      id: 2,
      name: "FPT Media Team",
      description:
        "Specializes in media production, photography, and event livestream support for university activities.",
      contactEmail: "mediateam@fpt.edu.vn",
      logo_url:
        "https://media.glassdoor.com/sql/472026/fpt-software-squarelogo-1568261569651.png",
      campus: "FPT University Hồ Chí Minh",
    },
    {
      id: 3,
      name: "FPT Volunteer Club",
      description:
        "Organizes charity events, community services, and volunteer activities for students.",
      contactEmail: "volunteer@fpt.edu.vn",
      logo_url:
        "https://upload.wikimedia.org/wikipedia/commons/thumb/b/b2/FPT_Polytechnic.png/640px-FPT_Polytechnic.png",
      campus: "FPT University Đà Nẵng",
    },
    {
      id: 4,
      name: "FPT Developer Student Club",
      description:
        "A tech community that hosts workshops, hackathons, and developer training programs.",
      contactEmail: "dsc@fpt.edu.vn",
      logo_url:
        "https://seeklogo.com/images/G/google-developers-logo-55B3A9F9E8-seeklogo.com.png",
      campus: "FPT University Cần Thơ",
    },
  ]);

  const handleOpenDetails = (org) => {
    setSelectedOrganizer(org);
  };

  const handleCloseDetails = () => {
    setSelectedOrganizer(null);
  };

  const handleDeleteOrganizer = (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa tổ chức này?")) {
      setOrganizers(organizers.filter((org) => org.id !== id));
    }
  };

  return (
    <div>
      <div className="flex justify-center mb-6">
        <div className="hidden lg:flex items-center bg-gray-100 rounded-full px-3 py-1.5 focus-within:ring-2 focus-within:ring-[#F27125] transition-all w-64">
          <Search size={18} className="text-gray-400" />
          <input
            type="text"
            placeholder="Tìm nhà tổ chức..."
            className="bg-transparent border-none focus:outline-none text-sm ml-2 w-full placeholder-gray-400 text-gray-700"
          />
        </div>
      </div>
      <div
        className="grid 
        grid-cols-1 
        sm:grid-cols-2 
        lg:grid-cols-3 
        xl:grid-cols-4 
        gap-6"
      >
        <div className="bg-orange-100 p-5 rounded-xl shadow-lg flex flex-col justify-center items-center relative w-72 m-4 transition transform hover:shadow-xl cursor-pointer">
          <div className="w-28 h-28 border-3 border-gray-100 rounded-full overflow-hidden mb-4 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-16 w-16 stroke-2 "
              fill="none"
              viewBox="0 0 24 24"
              stroke="gray"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-600 transition-colors">
            Thêm
          </h2>
        </div>
        {organizers.map((org) => (
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
    </div>
  );
};

export default OrganizerListGrid;
