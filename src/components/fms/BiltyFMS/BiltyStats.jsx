import React from 'react';

const StatCard = ({ label, value, color, icon: Icon }) => (
  <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm ag-lift">
    <div className="flex items-center gap-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${color}`}>
        <Icon />
      </div>
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</p>
        <p className="text-2xl font-black text-gray-900 mt-0.5">{value}</p>
      </div>
    </div>
  </div>
);

const PendingIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zM12.75 6a.75.75 0 00-1.5 0v6c0 .414.336.75.75.75h4.5a.75.75 0 000-1.5h-3.75V6z" clipRule="evenodd" />
  </svg>
);

const CameraIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path d="M12 9a3.75 3.75 0 100 7.5A3.75 3.75 0 0012 9z" />
    <path fillRule="evenodd" d="M9.344 3.071a2.25 2.25 0 012.112-.647 6.015 6.015 0 004.144 0 2.25 2.25 0 012.112.647 4.75 4.75 0 004.144 1.707c.801-.06 1.488.583 1.488 1.385V16.5c0 .802-.687 1.445-1.488 1.385a4.75 4.75 0 00-4.144 1.707 2.25 2.25 0 01-2.112.647 6.015 6.015 0 00-4.144 0 2.25 2.25 0 01-2.112-.647 4.75 4.75 0 00-4.144-1.707c-.801.06-1.488-.583-1.488-1.385V6.5c0-.802.687-1.445 1.488-1.385a4.75 4.75 0 004.144-1.707zM12 7.5a5.25 5.25 0 100 10.5 5.25 5.25 0 000-10.5z" clipRule="evenodd" />
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
    <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zm13.36-1.814a.75.75 0 10-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 00-1.06 1.06l2.25 2.25a.75.75 0 001.14-.094l3.75-5.25z" clipRule="evenodd" />
  </svg>
);

export default function BiltyStats({ data = [] }) {
  const pendingReceiving = data.filter(d => d.receivingStatus === 'Pending').length;
  const pendingPhotos = data.filter(d => d.receivingStatus !== 'Pending' && d.photoSendStatus === 'Pending').length;
  const completed = data.filter(d => d.deliveryStatus === 'Delivered').length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <StatCard 
        label="Pending Receiving" 
        value={pendingReceiving} 
        color="bg-amber-50 text-amber-600" 
        icon={PendingIcon} 
      />
      <StatCard 
        label="Awaiting Photos" 
        value={pendingPhotos} 
        color="bg-blue-50 text-blue-600" 
        icon={CameraIcon} 
      />
      <StatCard 
        label="Total Delivered" 
        value={completed} 
        color="bg-emerald-50 text-emerald-600" 
        icon={CheckIcon} 
      />
    </div>
  );
}
