import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const DetailEventPage = () => {
    const {id} = useParams();
    const [event, setEvent] = useState(null);
    const [showRejectBox, setShowRejectBox] = useState(false);
    const [rejectReason, setRejectReason] = useState("");

    useEffect(() => {
        // Mock data from ListEventPage
        const mockEvents = [
            {
                id: 1,
                name: "Tech Conference 2025",
                organizer: "FPT University",
                date: "2025-12-10",
                venue: "Hall A",
                status: "pending",
                image: "https://thanhnien.mediacdn.vn/Uploaded/dieutrang-qc/2022_04_24/fpt2-7865.jpg",
                description: "A comprehensive technology conference featuring the latest innovations in AI, blockchain, and cloud computing. Join industry leaders and innovators for networking and knowledge sharing."
            },
            {
                id: 2,
                name: "Music Festival Summer",
                organizer: "Student Club",
                date: "2025-08-15",
                venue: "Main Stadium",
                status: "approved",
                image: "https://images.unsplash.com/photo-1459749411175-04bf5292ceea?w=800",
                description: "An exciting summer music festival featuring local and international artists across multiple genres. Experience live performances, food stalls, and entertainment."
            },
            {
                id: 3,
                name: "Startup Pitching Day",
                organizer: "Innovation Hub",
                date: "2025-07-22",
                venue: "Room B2",
                status: "rejected",
                image: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800",
                description: "Aspiring entrepreneurs showcase their innovative startup ideas to potential investors and industry experts. Network with like-minded individuals and get valuable feedback."
            },
            {
                id: 4,
                name: "AI Robotics Workshop",
                organizer: "Tech Labs",
                date: "2025-06-14",
                venue: "Lab A1",
                status: "pending",
                image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800",
                description: "Hands-on workshop exploring the fundamentals of AI and robotics. Learn programming, machine learning basics, and build your own AI-powered robot."
            },
            {
                id: 5,
                name: "Charity Marathon",
                organizer: "Community Group",
                date: "2025-05-30",
                venue: "City Park",
                status: "approved",
                image: "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=800",
                description: "Join us for a charity marathon to raise funds for local communities. All skill levels welcome. Registration fees go directly to supporting education programs."
            },
        ];

        // Find event by id
        const foundEvent = mockEvents.find(e => e.id === parseInt(id));
        setEvent(foundEvent);
    }, [id]);

    if (!event){
        return <p className="p-6 text-gray-600">Loading event details...</p>
    }

    return(
        <div className="p-6 max-w-3xl mx-auto">
            <h1 className="text-2xl font-semibold mb-6">Review Event</h1>

            {/*EVENT CARD*/}
            <div className="border rounded-xl p-5 shadow-sm mb-6">
                <img 
                    src={event.image}
                    alt="Event"
                    className="rounded-lg mb-4 w-full h-60 object-cover"
                />

                <h2 className="text-xl font-bold mb-2">{event.name}</h2>
                <div className="space-y-1 text-gray-700">
                    <p><strong>Organizer:</strong> {event.organizer}</p>
                    <p><strong>Date:</strong> {event.date}</p>
                    <p><strong>Venue:</strong> {event.venue}</p>
                    <p><strong>Status:</strong> <span className="capitalize">{event.status}</span></p>
                </div>

                <div className="mt-4">
                    <p className="font-semibold mb-1">Description:</p>
                    <p className="text-gray-700">{event.description}</p>
                </div>
            </div>

            {/*ACTION BUTTONS*/}
            <div className="flex gap-3">
                <button
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
                    onClick={() => alert("Approve API here")}
                >
                    Approve
                </button>

                <button
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    onClick={() => setShowRejectBox(!showRejectBox)}
                >
                    Reject
                </button>
            </div>

            {/*Reject Reason Box*/}
            {showRejectBox && (
                <div className="mt-4 border rounded-xl p-4 bg-red-50">
                    <label className="block mb-1 font-semibold text-red-800">
                        Reason for Rejection:
                    </label>

                    <textarea
                        className="w-full border rounded-lg p-3"
                        rows={4}
                        placeholder="Enter reason..."
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                    />

                    <button
                        className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                        onClick={() => {
                            if(!rejectReason){
                                return alert("Please enter a reason!");
                            }
                            alert(`Reject API here with reason: ${rejectReason}`)
                        }}
                    >
                        Confirm Reject
                    </button>
                </div>
            )}
        </div>
    );
}
export default DetailEventPage;