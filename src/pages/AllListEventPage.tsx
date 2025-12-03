import { useState } from "react";
const AllListEventPage = () => {
    const [statusFilter, setStatusFilter] = useState("");
  const [events, setEvents] = useState([]);
  return (
    <div className="p-6">
      {/*Title*/}
      <h1 className="text-2xl font-semibold mb-4">Event Approval List</h1>

      {/*Search + Filter*/}
      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          placeholder="Tìm sự kiện"
          className="border rounded-lg px-3 py-2 w-1/3 focus:outline-none" // border(bo tron khung vien), rounded-lg (khung vien), w-1/3(chiem 1/3 thanh ngang)
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          {/* Placeholder that is NOT a selectable option */}
          <option value="" disabled hidden>
            Status
          </option>
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {/*Table*/}
      <div className="overflow-x-auto rounded-lg border">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Organizer</th>
              <th className="px-4 py-3">Date</th>
              <th className="px-4 py-3">Venue</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {events.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-4 text-gray-500">
                  Không có dữ liệu
                </td>
              </tr>
            ) : (
              events.map((e) => (
                <tr key={e.id} className="border-b hover:bg-gray-50">
                  <td className="px-4 py-3">{e.id}</td>
                  <td className="px-4 py-3">{e.name}</td>
                  <td className="px-4 py-3">{e.organizer}</td>
                  <td className="px-4 py-3">{e.date}</td>
                  <td className="px-4 py-3">{e.venue}</td>
                  <td className="px-4 py-3">{e.status}</td>

                  <td className="px-4 py-3 text-center">
                    <a
                      href={`/manager/event/${e.id}`}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </a>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
export default AllListEventPage;