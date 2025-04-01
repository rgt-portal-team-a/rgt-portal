import React from "react";

const ActivityView: React.FC = () => (
  <div className="text-center p-8 text-slate-500">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Recent Activities */}
      <div className="bg-slate-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-slate-700">
          Recent Activities
        </h3>
        <div className="space-y-3">
          {/* Activity items */}
          <div className="flex items-start">
            <div className="w-3 h-3 bg-purple-500 rounded-full mt-1.5 mr-3"></div>
            <div>
              <p className="text-sm text-slate-600">
                Updated Profile Information
              </p>
              <span className="text-xs text-slate-500">2 hours ago</span>
            </div>
          </div>
          {/* More activity items... */}
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="bg-slate-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-slate-700">
          Performance Metrics
        </h3>
        {/* Performance metric items */}
      </div>

      {/* Upcoming Events */}
      <div className="bg-slate-50 p-4 rounded-lg">
        <h3 className="text-lg font-semibold mb-4 text-slate-700">
          Upcoming Events
        </h3>
        {/* Event items */}
      </div>
    </div>
  </div>
);

export default ActivityView;
