import React from "react";
import {Link} from "react-router-dom"


const ProfileHeader: React.FC = () => (
  <div className="mb-4">
    <h1 className="text-2xl font-medium text-slate-600">Employee Profile</h1>
    <div className="flex items-center text-sm text-slate-500">
      {/* <span>Employee Cards</span> */}
      <Link to="/admin/manageemployees" className={"hover:text-gray-700"}>
        Employee Cards
      </Link>
      <span className="mx-2">&gt;</span>
      <span>Employee Profile</span>
    </div>
  </div>
);

export default ProfileHeader;
