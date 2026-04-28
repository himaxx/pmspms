import React from 'react';
import { fmtWorkingDateTime } from '../../../utils/workingHours';

const StatusBadge = ({ status, delay }) => {
  const isPending = status === 'Pending';
  const isDelayed = delay > 0;

  if (isPending) {
    return (
      <span className="px-2 py-1 rounded-full bg-gray-100 text-gray-500 text-[10px] font-bold uppercase tracking-wider">
        Pending
      </span>
    );
  }

  return (
    <div className="flex flex-col gap-0.5">
      <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-center
        ${isDelayed ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'}`}>
        {status}
      </span>
      {isDelayed && (
        <span className="text-[9px] font-medium text-red-400 text-center">
          +{delay}h delay
        </span>
      )}
    </div>
  );
};

export default function BiltyList({ data = [], onSelect }) {
  return (
    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50 border-b border-gray-100">
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Dispatch Details</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Receiving</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Bilty & Photo</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Delivery</th>
              <th className="px-6 py-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-gray-50/50 transition-colors group">
                {/* Step 1: Dispatch */}
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="text-sm font-bold text-gray-900">{item.transport}</span>
                    <span className="text-xs text-gray-400 mt-0.5">{item.dispatcherName} • {item.parcelCount} Parcels</span>
                    <span className="text-[10px] text-gray-300 mt-1">{fmtWorkingDateTime(item.dispatchTimestamp)}</span>
                  </div>
                </td>

                {/* Step 2: Receiving */}
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5">
                    <StatusBadge status={item.receivingStatus} delay={item.receivingDelayHours} />
                    <span className="text-[10px] text-gray-400">
                      Pl: {fmtWorkingDateTime(item.receivingPlannedAt)}
                    </span>
                  </div>
                </td>

                {/* Step 3: Photo Send */}
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5">
                    <StatusBadge status={item.photoSendStatus} delay={item.photoSendDelayHours} />
                    {item.biltyNumber && (
                      <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded-md self-start">
                        #{item.biltyNumber}
                      </span>
                    )}
                    {item.photoUrl && (
                       <a href={item.photoUrl} target="_blank" rel="noreferrer" className="text-[10px] text-blue-500 hover:underline">
                         View Photo
                       </a>
                    )}
                  </div>
                </td>

                {/* Step 4: Delivery */}
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1.5">
                    <StatusBadge status={item.deliveryStatus} delay={item.deliveryDelayHours} />
                    <span className="text-[10px] text-gray-400">
                      Pl: {fmtWorkingDateTime(item.deliveryPlannedAt)}
                    </span>
                  </div>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 text-right">
                  <button 
                    onClick={() => onSelect(item)}
                    className="p-2 rounded-xl bg-gray-50 text-gray-400 hover:bg-indigo-50 hover:text-indigo-600 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                      <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                      <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr>
                <td colSpan="5" className="px-6 py-12 text-center text-gray-400 text-sm">
                  No Bilty entries found. Start by dispatching a parcel.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
