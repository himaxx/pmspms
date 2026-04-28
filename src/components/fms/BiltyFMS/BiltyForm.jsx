import React, { useState, useEffect } from 'react';
import BiltyImageUploader from './BiltyImageUploader';
import { fetchBiltyBills } from '../../../utils/biltyDb';

export default function BiltyForm({ item, onClose, onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    dispatcherName: '',
    transport: '',
    parcelCount: 1,
    parcelBearerName: '',
    receivingStatus: 'Received',
    receivingRemark: '',
    photoSendStatus: 'Sent',
    biltyNumber: '',
    photoUrl: '',
    photoSendRemark: '',
    deliveryStatus: 'Delivered',
    deliveryRemark: '',
    billNumbers: [],
  });

  const [newBillNumber, setNewBillNumber] = useState('');

  useEffect(() => {
    if (item) {
      setFormData({
        ...formData,
        ...item,
      });

      // If we have an item and it's at step 3, fetch associated bills
      if (item.id) {
        fetchBiltyBills(item.id).then(bills => {
          setFormData(prev => ({ ...prev, billNumbers: bills }));
        });
      }
    }
  }, [item]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isNew = !item;
  const currentStep = item ? (
    item.deliveryStatus === 'Delivered' ? 5 :
    item.photoSendStatus === 'Sent' ? 4 :
    item.receivingStatus === 'Received' ? 3 : 2
  ) : 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-sm anim-fadeIn">
      <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden anim-scaleIn">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">
            {isNew ? 'New Parcel Dispatch' : `Update Bilty Flow`}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Step 1 Fields (Only for New or Always Visible) */}
          {(isNew || currentStep === 1) && (
            <div className="space-y-4">
               <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Your Name</label>
                  <input
                    required
                    type="text"
                    value={formData.dispatcherName}
                    onChange={e => setFormData({ ...formData, dispatcherName: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50/30 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm font-medium"
                    placeholder="e.g. Rahul Sharma"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Transport Name</label>
                  <input
                    required
                    type="text"
                    value={formData.transport}
                    onChange={e => setFormData({ ...formData, transport: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50/30 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm font-medium"
                    placeholder="e.g. VRL Logistics"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Parcel Count</label>
                  <input
                    required
                    type="number"
                    min="1"
                    value={formData.parcelCount}
                    onChange={e => setFormData({ ...formData, parcelCount: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50/30 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Bearer Name</label>
                  <input
                    type="text"
                    value={formData.parcelBearerName}
                    onChange={e => setFormData({ ...formData, parcelBearerName: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50/30 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm font-medium"
                    placeholder="Who is carrying it?"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2 Fields */}
          {!isNew && currentStep === 2 && (
            <div className="space-y-4 anim-slideUp">
               <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100">
                 <p className="text-xs font-bold text-amber-700">Step 2: Bilty Receiving</p>
                 <p className="text-[10px] text-amber-600/70 mt-0.5">Please confirm if the Bilty has been received from the transport.</p>
               </div>
               <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Remark</label>
                  <textarea
                    value={formData.receivingRemark}
                    onChange={e => setFormData({ ...formData, receivingRemark: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50/30 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm font-medium min-h-[80px]"
                    placeholder="Any comments about receiving..."
                  />
                </div>
            </div>
          )}

          {/* Step 3 Fields */}
          {!isNew && currentStep === 3 && (
            <div className="space-y-4 anim-slideUp">
               <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100">
                 <p className="text-xs font-bold text-blue-700">Step 3: Bilty & Bill Photo Send</p>
                 <p className="text-[10px] text-blue-600/70 mt-0.5">Enter the Bilty number and attach the photo link.</p>
               </div>
               <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Bilty Number</label>
                  <input
                    required
                    type="text"
                    value={formData.biltyNumber}
                    onChange={e => setFormData({ ...formData, biltyNumber: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50/30 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm font-medium"
                    placeholder="Enter LR/Bilty No."
                  />
                </div>

                <div className="space-y-3">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Linked Bills (Multiple)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newBillNumber}
                      onChange={e => setNewBillNumber(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          if (newBillNumber.trim()) {
                            setFormData(prev => ({ ...prev, billNumbers: [...prev.billNumbers, newBillNumber.trim()] }));
                            setNewBillNumber('');
                          }
                        }
                      }}
                      className="flex-1 px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50/30 focus:bg-white focus:border-indigo-500 transition-all outline-none text-sm font-medium"
                      placeholder="Add Bill No. (Press Enter)"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (newBillNumber.trim()) {
                          setFormData(prev => ({ ...prev, billNumbers: [...prev.billNumbers, newBillNumber.trim()] }));
                          setNewBillNumber('');
                        }
                      }}
                      className="px-4 py-3 rounded-2xl bg-gray-900 text-white text-xs font-bold"
                    >
                      Add
                    </button>
                  </div>
                  
                  {formData.billNumbers.length > 0 && (
                    <div className="flex flex-wrap gap-2 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                      {formData.billNumbers.map((bill, idx) => (
                        <div key={idx} className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-gray-200 text-xs font-bold text-gray-700 shadow-sm">
                          <span>{bill}</span>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, billNumbers: prev.billNumbers.filter((_, i) => i !== idx) }))}
                            className="text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                            </svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <BiltyImageUploader 
                  currentUrl={formData.photoUrl}
                  onUploadComplete={(url) => setFormData({ ...formData, photoUrl: url })}
                />
                <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Remark</label>
                  <textarea
                    value={formData.photoSendRemark}
                    onChange={e => setFormData({ ...formData, photoSendRemark: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50/30 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm font-medium min-h-[80px]"
                    placeholder="Any comments..."
                  />
                </div>
            </div>
          )}

          {/* Step 4 Fields */}
          {!isNew && currentStep === 4 && (
            <div className="space-y-4 anim-slideUp">
               <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-100">
                 <p className="text-xs font-bold text-emerald-700">Step 4: Bilty Delivered to Agent</p>
                 <p className="text-[10px] text-emerald-600/70 mt-0.5">Final step: confirm delivery to the agent.</p>
               </div>
               <div>
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5 ml-1">Remark</label>
                  <textarea
                    value={formData.deliveryRemark}
                    onChange={e => setFormData({ ...formData, deliveryRemark: e.target.value })}
                    className="w-full px-4 py-3 rounded-2xl border border-gray-100 bg-gray-50/30 focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none text-sm font-medium min-h-[80px]"
                    placeholder="Delivery notes..."
                  />
                </div>
            </div>
          )}
        </form>

        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-2.5 rounded-2xl bg-gray-900 text-white text-sm font-bold shadow-lg shadow-gray-900/10 hover:shadow-gray-900/20 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Saving...' : (isNew ? 'Create Dispatch' : 'Complete Step')}
          </button>
        </div>
      </div>
    </div>
  );
}
