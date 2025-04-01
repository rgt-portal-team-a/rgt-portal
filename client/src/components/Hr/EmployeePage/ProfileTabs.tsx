import React from "react";
import { Edit, User } from "lucide-react";
import { Employee } from "@/types/employee";

interface ProfileTabsProps {
  employee: Employee;
  activeTab: "details" | "activity";
  setActiveTab: (tab: "details" | "activity") => void;
}

const ProfileTabs: React.FC<ProfileTabsProps> = ({
  employee,
  activeTab,
  setActiveTab,
}) => (
  <>
    <div className="bg-purple-50 py-6 px-4">
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-4">
          {/* Profile avatar */}
          <div className="w-16 h-16 rounded-full overflow-hidden bg-purple-200 flex items-center justify-center">
            <User size={32} className="text-purple-600" />
          </div>

          {/* Employee name and title */}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-medium text-slate-700">
                {employee.firstName} {employee.lastName}
              </h2>
              <span className="px-2 py-0.5 text-xs bg-green-100 text-green-600 rounded-full">
                {employee.workType}
              </span>
            </div>
            <p className="text-slate-500">{employee.role?.name.toUpperCase()}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="relative">
          <div className="absolute inset-0 bg-purple-50 h-12"></div>
          <div className="relative flex px-6 z-10">
            {/* Details Tab */}
            <div
              className={`relative cursor-pointer ${
                activeTab === "details" ? "text-purple-700" : "text-slate-500"
              }`}
              onClick={() => setActiveTab("details")}
            >
              {activeTab === "details" && (
                <div
                  className="absolute -bottom-6 left-0 right-0 h-12 bg-white"
                  style={{
                    borderTopLeftRadius: "60px",
                    borderTopRightRadius: "60px",
                    width: "100%",
                    left: "0%",
                    bottom: "-70px",
                    height: "100px",
                    zIndex: -1,
                  }}
                ></div>
              )}
              <span className="relative z-10 pt-10 px-8 text-sm block">
                Details
              </span>
            </div>

            {/* Activity Tab */}
            <div
              className={`relative cursor-pointer ${
                activeTab === "activity" ? "text-purple-700" : "text-slate-500"
              }`}
              onClick={() => setActiveTab("activity")}
            >
              {activeTab === "activity" && (
                <div
                  className="absolute -bottom-6 left-0 right-0 h-12 bg-white"
                  style={{
                    borderTopLeftRadius: "60px",
                    borderTopRightRadius: "60px",
                    width: "120%",
                    left: "0%",
                    bottom: "-70px",
                    height: "100px",
                    zIndex: -1,
                  }}
                ></div>
              )}
              <span className="relative z-10 pt-10 px-8 text-sm block">
                Activity
              </span>
            </div>
          </div>
        </div>

        <button className="text-purple-500 hover:text-purple-700 p-4">
          <Edit size={18} />
        </button>
      </div>
    </div>
  </>
);

export default ProfileTabs;
