import { useState } from "react";

const ListEventPage = () => {
  const [statusFilter, setStatusFilter] = useState("");
  return (
    <div className="p-6">
      {/*Title*/}
      <h1 className="text-2xl font-semibold mb-4">Event Approval List</h1>

      {/*Search + Filter*/}
      <div className="flex items-center gap-5 mb-4">
        <input
          type="text" 
          placeholder="Search events"
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
      
    </div>
  );
};

export default ListEventPage;
