import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

const DetailEventPage = () => {
    const {id} = useParams();
    const [event, setEvent] = useState(null);
    const [showRejectBox, setShowRejectBox] = useState(false);
    const [rejectReason, setRejectReason] = useState = ("");

    useEffect(() => {

    },[id]);

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

                <h2 className="text-xl" font-bold mb-2>{event.name}</h2>
                <div className="space-y-1 text-gray-700">
                    <p><strong>Organizer:</strong></p>
                    <p><strong>Date:</strong></p>
                    <p><strong>Venuew:</strong></p>
                    <p><strong>Status:</strong></p>
                </div>

                <div className="mt-4">
                    <p className="font-semibold mb-1">Decription:</p>
                    <p className="text-gray-700">{event.description}</p>
                </div>
            </div>

            {/*ACTION BUTTONS*/}
            <div className="flex gap-3">
                <button
                    className="bg green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
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

            {/*Reject Reasion Box*/}
            {showRejectBox && (
                <div className="mt-4 border rounded-xl p-4 bg-red-50">
                    <label className="block mb-1 font-semiblod text-red-800">
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
                            alert(`Reject API here with a reason: ${rejectReason}`)
                        }
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