import React, { useState } from 'react';
import { useLanguage } from '../../i18n/LanguageContext';
import BiltyStats from '../../components/fms/BiltyFMS/BiltyStats';
import BiltyList from '../../components/fms/BiltyFMS/BiltyList';
import BiltyForm from '../../components/fms/BiltyFMS/BiltyForm';
import { 
  useBiltyFMS, 
  useCreateBiltyEntry, 
  useUpdateBiltyStep2, 
  useUpdateBiltyStep3, 
  useUpdateBiltyStep4 
} from '../../hooks/useBiltyFMS';

export default function BiltyFMSPage() {
  const { t } = useLanguage();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const { data: entries, isLoading, isError } = useBiltyFMS();
  const createMutation = useCreateBiltyEntry();
  const updateStep2 = useUpdateBiltyStep2();
  const updateStep3 = useUpdateBiltyStep3();
  const updateStep4 = useUpdateBiltyStep4();

  const handleOpenForm = (item = null) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setSelectedItem(null);
    setIsFormOpen(false);
  };

  const handleSubmit = async (formData) => {
    try {
      if (!selectedItem) {
        // Create new entry (Step 1)
        await createMutation.mutateAsync(formData);
      } else {
        // Update existing entry based on current step
        const currentStep = (
          selectedItem.deliveryStatus === 'Delivered' ? 5 :
          selectedItem.photoSendStatus === 'Sent' ? 4 :
          selectedItem.receivingStatus === 'Received' ? 3 : 2
        );

        if (currentStep === 2) {
          await updateStep2.mutateAsync({ id: selectedItem.id, ...formData });
        } else if (currentStep === 3) {
          await updateStep3.mutateAsync({ id: selectedItem.id, ...formData });
        } else if (currentStep === 4) {
          await updateStep4.mutateAsync({ id: selectedItem.id, ...formData });
        }
      }
      handleCloseForm();
    } catch (err) {
      console.error('Bilty form submission error:', err);
      alert(t('biltyFms.failedToSave'));
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-3xl border border-red-100">
        <p className="text-red-600 font-bold">{t('biltyFms.errorLoading')}</p>
        <button onClick={() => window.location.reload()} className="mt-4 text-sm text-red-500 underline">{t('biltyFms.tryRefreshing')}</button>
      </div>
    );
  }

  return (
    <div className="space-y-6 anim-fadeIn">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">{t('biltyFms.title')}</h2>
          <p className="text-xs text-gray-400 mt-1">{t('biltyFms.subtitle')}</p>
        </div>
        <button
          onClick={() => handleOpenForm()}
          className="flex items-center justify-center gap-2 px-6 py-3 rounded-2xl bg-indigo-600 text-white text-sm font-bold shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 hover:-translate-y-0.5 active:translate-y-0 transition-all"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          {t('biltyFms.newDispatch')}
        </button>
      </div>

      {/* Stats Cards */}
      <BiltyStats data={entries} />

      {/* List Table */}
      <BiltyList 
        data={entries} 
        onSelect={handleOpenForm} 
      />

      {/* Form Modal */}
      {isFormOpen && (
        <BiltyForm 
          item={selectedItem} 
          onClose={handleCloseForm} 
          onSubmit={handleSubmit}
          isSubmitting={createMutation.isPending || updateStep2.isPending || updateStep3.isPending || updateStep4.isPending}
        />
      )}
    </div>
  );
}
