import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Edit, User } from 'lucide-react';

const EmployeeProfile = () => {
  const [activeTab, setActiveTab] = useState('details');

  const employee = {
    name: 'Bernard Parry Koranteng',
    title: 'Senior UI/UX',
    status: 'Active',
    personalDetails: {
      phone: '+123 456 7890',
      personalEmail: 'giveittoparry@gmail.com',
      workEmail: 'bparry@reallygreatech.com',
      location: 'Accra, Great Accra, Ghana',
      skills: 'UI/UX, Front-End'
    },
    workDetails: {
      startDate: '07-12-2013',
      department: 'Design',
      seniority: '12 years in service'
    }
  };

  return (
    <div className="bg-slate-100 min-h-screen w-full p-4">
      {/* Header with Breadcrumbs */}
      <div className="mb-4">
        <h1 className="text-2xl font-medium text-slate-600">Employee Profile</h1>
        <div className="flex items-center text-sm text-slate-500">
          <span>Employee Cards</span>
          <span className="mx-2">&gt;</span>
          <span>Employee Profile</span>
        </div>
      </div>

      {/* Profile Card */}
      <Card className="w-full bg-white shadow-sm rounded-lg overflow-hidden">
        {/* Profile Header */}
        <div className="bg-purple-50 py-6 px-4">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full overflow-hidden bg-purple-200 flex items-center justify-center">
                <User size={32} className="text-purple-600" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-xl font-medium text-slate-700">{employee.name}</h2>
                  <span className="px-2 py-0.5 text-xs bg-green-100 text-green-600 rounded-full">
                    {employee.status}
                  </span>
                </div>
                <p className="text-slate-500">{employee.title}</p>
              </div>
            </div>

            {/* Custom Fluid Tabs */}
            <div className="relative">
                {/* Tabs Background */}
                <div className="absolute inset-0 bg-purple-50 h-12"></div>
                
                {/* Tabs Container */}
                <div className="relative flex px-6 z-10">
                    {/* Details Tab with Fluid Connection */}
                    <div 
                    className={`relative cursor-pointer ${activeTab === 'details' ? 'text-purple-700' : 'text-slate-500'}`}
                    onClick={() => setActiveTab('details')}
                    >
                        {activeTab === 'details' && (
                            <div className="absolute -bottom-6 left-0 right-0 h-12 bg-white" style={{
                            borderTopLeftRadius: '60px',
                            borderTopRightRadius: '60px',
                            width: '100%',
                            left: '0%',
                            bottom: '-70px',
                            height: '100px',
                            zIndex: -1
                            }}></div>
                        )}
                        <span className="relative z-10 pt-8 px-8 text-sm block">Details</span>
                    </div>
                    
                    {/* Activity Tab */}
                    <div 
                    className={`relative cursor-pointer ${activeTab === 'activity' ? 'text-purple-700' : 'text-slate-500'}`}
                    onClick={() => setActiveTab('activity')}
                    >
                    {activeTab === 'activity' && (
                        <>
                        <div className="absolute -bottom-6 left-0 right-0 h-12 bg-white" style={{
                            borderTopLeftRadius: '60px',
                            borderTopRightRadius: '60px',
                            width: '120%',
                            left: '0%',
                            bottom: '-70px',
                            height: '100px',
                            zIndex: -1
                        }}></div>
                        {/* <div className="absolute -bottom-6 left-0 right-0 h-12 bg-white" style={{
                        borderTopLeftRadius: '24px',
                        borderTopRightRadius: '24px',
                        width: '120%',
                        left: '-10%',
                        bottom: '-4px',
                        height: '50px',
                        zIndex: -1
                        }}></div> */}
                        </>
                    )}
                    <span className="relative z-10 pt-8 px-8 block">Activity</span>
                    </div>
                </div>
            </div>

            <button className="text-purple-500 hover:text-purple-700 p-4">
              <Edit size={18} />
            </button>
          </div>
        </div>



        {/* Tab Content */}
        <div className="bg-white p-6">
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 gap-8">
              {/* Personal Details Section */}
              <div>
                <div className="bg-purple-200 text-purple-700 py-3 px-6 rounded-lg inline-block mb-8">
                  Personal Details
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Phone */}
                  <div className="bg-purple-100 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-slate-600 mb-1">Phone</h3>
                    <p className="text-purple-700">{employee.personalDetails.phone}</p>
                  </div>

                  {/* Personal Email */}
                  <div className="bg-purple-100 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-slate-600 mb-1">Personal Email</h3>
                    <p className="text-purple-700">{employee.personalDetails.personalEmail}</p>
                  </div>

                  {/* Work Email */}
                  <div className="bg-purple-100 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-slate-600 mb-1">Work Email</h3>
                    <p className="text-purple-700">{employee.personalDetails.workEmail}</p>
                  </div>

                  {/* Location */}
                  <div className="bg-purple-100 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-slate-600 mb-1">Location</h3>
                    <p className="text-purple-700">{employee.personalDetails.location}</p>
                  </div>

                  {/* Skills */}
                  <div className="bg-purple-100 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-slate-600 mb-1">Skills</h3>
                    <p className="text-purple-700">{employee.personalDetails.skills}</p>
                  </div>
                </div>
              </div>

              {/* Work Details Section */}
              <div>
                <div className="bg-purple-200 text-purple-700 py-3 px-6 rounded-lg inline-block mb-8">
                  Work Details
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Start Date */}
                  <div className="bg-purple-100 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-slate-600 mb-1">Start Date</h3>
                    <p className="text-purple-700">{employee.workDetails.startDate}</p>
                  </div>

                  {/* Department */}
                  <div className="bg-purple-100 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-slate-600 mb-1">Department</h3>
                    <p className="text-purple-700">{employee.workDetails.department}</p>
                  </div>

                  {/* Seniority */}
                  <div className="bg-purple-100 rounded-lg p-4">
                    <h3 className="text-sm font-medium text-slate-600 mb-1">Seniority</h3>
                    <p className="text-purple-700">{employee.workDetails.seniority}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {activeTab === 'activity' && (
            <div className="text-center p-8 text-slate-500">
              Activity details will be displayed here.
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default EmployeeProfile;