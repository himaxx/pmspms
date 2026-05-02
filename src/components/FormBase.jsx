import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

export function cls(...parts) { return parts.filter(Boolean).join(' '); }

export function FieldLabel({ children, required }) {
  return (
    <label className="block text-sm font-semibold text-gray-700 mb-1.5">
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

export function InputBase({ error, className, ...props }) {
  return (
    <input
      className={cls(
        'w-full rounded-xl border px-4 py-3 text-base text-gray-900 bg-white',
        'placeholder:text-gray-400 outline-none transition-shadow',
        'focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400',
        error ? 'border-red-400 input-error' : 'border-gray-200',
        className
      )}
      {...props}
    />
  );
}

export function SelectBase({ error, children, className, ...props }) {
  return (
    <select
      className={cls(
        'w-full rounded-xl border px-4 py-3 text-base text-gray-900 bg-white',
        'outline-none transition-shadow appearance-none',
        'focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400',
        error ? 'border-red-400 input-error' : 'border-gray-200',
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function TextAreaBase({ error, className, ...props }) {
  return (
    <textarea
      className={cls(
        'w-full rounded-xl border px-4 py-3 text-base text-gray-900 bg-white',
        'placeholder:text-gray-400 outline-none transition-shadow resize-none',
        'focus:ring-2 focus:ring-indigo-400 focus:border-indigo-400',
        error ? 'border-red-400 input-error' : 'border-gray-200',
        className
      )}
      {...props}
    />
  );
}

export function YesNoToggle({ value, onChange, yesLabel, noLabel }) {
  const { t } = useLanguage();
  const yLabel = yesLabel || t('common.yes');
  const nLabel = noLabel || t('common.no');
  return (
    <div className="flex gap-2">
      {[true, false].map((v) => (
        <button
          key={String(v)}
          type="button"
          onClick={() => onChange(v)}
          className={cls(
            'flex-1 py-3 rounded-xl text-sm font-semibold border-2 btn-press transition-colors duration-150',
            value === v
              ? (v ? 'bg-green-500 border-green-500 text-white' : 'bg-red-500 border-red-500 text-white')
              : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
          )}
        >
          {v ? yLabel : nLabel}
        </button>
      ))}
    </div>
  );
}

export function SubmitButton({ loading, label }) {
  const { t } = useLanguage();
  const displayLabel = label || t('forms.submitEntry');
  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full py-4 rounded-2xl font-bold text-white text-base bg-gradient-to-r
                 from-indigo-600 to-blue-500 shadow-lg shadow-indigo-200
                 hover:from-indigo-700 hover:to-blue-600
                 disabled:opacity-60 disabled:cursor-not-allowed btn-press transition-all"
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
          {t('forms.submitting')}
        </span>
      ) : displayLabel}
    </button>
  );
}

export function ConfirmationPopup({ title, details, onConfirm, onCancel, loading }) {
  const { t } = useLanguage();
  if (!details) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm anim-fadeIn">
      <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden shadow-2xl anim-slideUp">
        <div className="p-5 border-b border-gray-100">
          <h3 className="text-lg font-black text-gray-900">{title}</h3>
          <p className="text-xs text-gray-500 mt-1">{t('forms.reviewDetails')}</p>
        </div>
        <div className="p-5 max-h-[60vh] overflow-y-auto bg-gray-50/50 space-y-3">
          {Object.entries(details).map(([key, val]) => {
             if (val === null || val === undefined || val === '') return null;
             return (
               <div key={key}>
                 <p className="text-[10px] font-black uppercase text-gray-400">{key}</p>
                 <p className="text-sm font-semibold text-gray-900 mt-0.5 whitespace-pre-wrap">{String(val)}</p>
               </div>
             )
          })}
        </div>
        <div className="p-4 bg-white border-t border-gray-100 flex gap-3">
          <button 
            type="button" 
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl border-2 border-gray-200 text-gray-600 font-bold text-sm hover:bg-gray-50 btn-press disabled:opacity-50"
          >
            {t('common.cancel')}
          </button>
          <button 
            type="button" 
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl bg-indigo-600 text-white font-bold text-sm hover:bg-indigo-700 shadow-md shadow-indigo-200 btn-press disabled:opacity-50"
          >
            {loading ? t('forms.submitting') : t('common.confirm')}
          </button>
        </div>
      </div>
    </div>
  );
}
