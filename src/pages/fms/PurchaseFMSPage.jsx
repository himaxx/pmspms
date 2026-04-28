import { useState } from 'react';
import PurchaseStats from '../../components/fms/PurchaseFMS/PurchaseStats';
import PurchaseList  from '../../components/fms/PurchaseFMS/PurchaseList';
import PurchaseForm  from '../../components/fms/PurchaseFMS/PurchaseForm';
import {
  usePurchaseFMS,
  useCreatePurchaseEntry,
  useUpdatePurchaseStep2,
  useUpdatePurchaseStep3,
  useUpdatePurchaseStep4,
} from '../../hooks/usePurchaseFMS';
import { getPurchaseStage } from '../../utils/purchaseDb';

export default function PurchaseFMSPage() {
  const [isFormOpen,   setIsFormOpen]   = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const { data: entries = [], isLoading, isError } = usePurchaseFMS();

  const createMutation  = useCreatePurchaseEntry();
  const updateStep2     = useUpdatePurchaseStep2();
  const updateStep3     = useUpdatePurchaseStep3();
  const updateStep4     = useUpdatePurchaseStep4();

  const isSubmitting =
    createMutation.isPending ||
    updateStep2.isPending    ||
    updateStep3.isPending    ||
    updateStep4.isPending;

  /* ── open form ──────────────────────────────────────────────────────────── */
  const openForm = (item = null) => {
    setSelectedItem(item);
    setIsFormOpen(true);
  };
  const closeForm = () => {
    setSelectedItem(null);
    setIsFormOpen(false);
  };

  /* ── submit handler ─────────────────────────────────────────────────────── */
  const handleSubmit = async (formData) => {
    try {
      if (!selectedItem) {
        // Step 1 — create new requirement
        await createMutation.mutateAsync(formData);
      } else {
        const stage = getPurchaseStage(selectedItem);
        if (stage === 2) await updateStep2.mutateAsync({ id: selectedItem.id, ...formData });
        if (stage === 3) await updateStep3.mutateAsync({ id: selectedItem.id, ...formData });
        if (stage === 4) await updateStep4.mutateAsync({ id: selectedItem.id, ...formData });
      }
      closeForm();
    } catch (err) {
      console.error('Purchase FMS submit error:', err);
      alert(`Error: ${err.message}`);
    }
  };

  /* ── loading / error states ─────────────────────────────────────────────── */
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-10 h-10 border-4 border-emerald-100 border-t-emerald-500 rounded-full animate-spin" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-8 text-center bg-red-50 rounded-3xl border border-red-100">
        <p className="text-red-600 font-bold">Error loading Purchase FMS data.</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 text-sm text-red-500 underline"
        >
          Try refreshing
        </button>
      </div>
    );
  }

  /* ── main render ────────────────────────────────────────────────────────── */
  return (
    <div className="space-y-5 anim-fadeIn">

      {/* ── Page Header ──────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Purchase FMS</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            End-to-end procurement tracking — Requirement → Order → GI → Follow-Up
          </p>
        </div>

        <button
          onClick={() => openForm()}
          className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl
                     bg-emerald-600 text-white text-sm font-bold
                     shadow-lg shadow-emerald-600/20
                     hover:bg-emerald-700 hover:-translate-y-0.5 active:translate-y-0
                     transition-all duration-200 self-start sm:self-auto"
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path d="M10.75 4.75a.75.75 0 00-1.5 0v4.5h-4.5a.75.75 0 000 1.5h4.5v4.5a.75.75 0 001.5 0v-4.5h4.5a.75.75 0 000-1.5h-4.5v-4.5z" />
          </svg>
          New Requirement
        </button>
      </div>

      {/* ── Stage Pipeline Banner ──────────────────────────────────────────── */}
      <div className="flex items-center gap-0 rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
        {[
          { num: 1, label: 'Requirement',  bg: 'bg-gray-100',    icon: '📋' },
          { num: 2, label: 'Order Done',   bg: 'bg-amber-100',   icon: '🛒' },
          { num: 3, label: 'Goods Inward', bg: 'bg-blue-100',    icon: '📦' },
          { num: 4, label: 'Follow-Up',    bg: 'bg-violet-100',  icon: '📞' },
        ].map((step, i) => (
          <div key={step.num} className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 ${step.bg} relative`}>
            <span className="text-sm">{step.icon}</span>
            <span className="text-[10px] font-bold text-gray-600 hidden sm:block">{step.label}</span>
            {i < 3 && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 z-10"
                style={{ borderTop: '12px solid transparent', borderBottom: '12px solid transparent', borderLeft: `8px solid white` }} />
            )}
          </div>
        ))}
      </div>

      {/* ── Stats Cards ──────────────────────────────────────────────────── */}
      <PurchaseStats data={entries} />

      {/* ── List ─────────────────────────────────────────────────────────── */}
      <PurchaseList data={entries} onSelect={openForm} />

      {/* ── Form Modal ───────────────────────────────────────────────────── */}
      {isFormOpen && (
        <PurchaseForm
          item={selectedItem}
          onClose={closeForm}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      )}
    </div>
  );
}
