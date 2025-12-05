import { useState } from "react";
import EventModal from "../../../components/admin/event/EventModal";
import EditEventModal from "../../../components/admin/event/EditEventModal";

interface EventData {
  id?: number;
  name: string;
  description: string;
  organizer?: string;
  date: string;
  venue: string;
  status?: string;
  image?: string;
}

const DetailEventPage = () => {
  const [open, setOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const eventData: EventData = {
    id: 1,
    name: "FPT Event Day",
    description: "A fun event for students",
    organizer: "FPT University",
    venue: "Hall A",
    date: "2025-12-20",
    status: "Đang xử lý",
    image: "https://thanhnien.mediacdn.vn/Uploaded/dieutrang-qc/2022_04_24/fpt2-7865.jpg",
  };

  const handleSave = async (data: EventData) => {
    setSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Updated Data:", data);
    alert("Cập nhật thành công!");
    setSubmitting(false);
    setOpen(false);
  };

  return (
    <div className="p-6">
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        onClick={() => setOpen(true)}
      >
        Edit Event
      </button>

      {open && (
        <EventModal title="Edit Event" onClose={() => setOpen(false)}>
          <EditEventModal
            initialData={eventData}
            onSubmit={handleSave}
            submitting={submitting}
          />
        </EventModal>
      )}
    </div>
  );
};

export default DetailEventPage;
