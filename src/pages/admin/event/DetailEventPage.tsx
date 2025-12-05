import { useState } from "react";
import EventModal from "../../../components/admin/event/EventModal";
import type { EventFormData } from "../../../types/Event";

const DetailEventPage = () => {
  const [open, setOpen] = useState(false);

  const eventData: EventFormData = {
    name: "FPT Event Day",
    description: "A fun event for students",
    location: "Hall A",
    date: "2025-12-20",
  };

  const handleSave = (data: EventFormData) => {
    console.log("Updated Data:", data);
  };

  return (
    <div>
      <button
        className="px-4 py-2 bg-blue-600 text-white rounded"
        onClick={() => setOpen(true)}
      >
        Edit Event
      </button>

      <EventModal
        title="Edit Event"
        isOpen={open}
        initialData={eventData}
        onClose={() => setOpen(false)}
        onSubmit={handleSave}
      />
    </div>
  );
};

export default DetailEventPage;
