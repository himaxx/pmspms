import React, { useState } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { useUpdateStep2 } from '../hooks/useJobs';
import { STEP_PEOPLE } from '../utils/constants';
import { 
  FieldLabel, 
  SelectBase, 
  YesNoToggle, 
  TextAreaBase, 
  SubmitButton, 
  ConfirmationPopup 
} from './FormBase';

export default function ApprovalForm({ job, onSuccess, onCancel }) {
  const { t } = useLanguage();
  const init = { name: '', yesNo: null, instructions: '', inhouseCutting: null };
  const [form, setForm] = useState(init);
  const [confirmData, setConfirmData] = useState(null);
  
  const updateStep2Mutation = useUpdateStep2();
  const loading = updateStep2Mutation.isPending;

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.name) return alert('Name is required!');
    if (form.yesNo === null) return alert('Please specify if approved for production.');

    setConfirmData({
      [t('common.jobNo')]: job.jobNo,
      [t('common.item')]: job.item,
      [t('forms.yourName')]: form.name,
      [t('forms.approveForProduction')]: form.yesNo === true ? '✅ ' + t('common.approve') : '❌ ' + t('common.reject'),
      [t('forms.instructionsReason')]: form.instructions,
      [t('forms.inhouseCutting')]: form.inhouseCutting === true ? t('common.yes') : (form.inhouseCutting === false ? t('common.no') : t('forms.notSpecified'))
    });
  }

  async function executeSubmit() {
    try {
      await updateStep2Mutation.mutateAsync({
        jobNo:          job.jobNo,
        yesNo:          form.yesNo,
        instructions:   form.instructions,
        inhouseCutting: form.inhouseCutting,
        name:           form.name,
      });
      setConfirmData(null);
      onSuccess({ jobNo: job.jobNo, item: job.item });
    } catch (err) { 
      alert('Submit failed: ' + err.message); 
      setConfirmData(null); 
    }
  }

  return (
    <div className="p-1">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <FieldLabel required>{t('forms.yourName')}</FieldLabel>
          <SelectBase value={form.name} onChange={set('name')}>
            <option value="">{t('forms.select')}</option>
            {STEP_PEOPLE[2].map((n) => <option key={n}>{n}</option>)}
          </SelectBase>
        </div>
        <div>
          <FieldLabel>{t('forms.approveForProduction')}</FieldLabel>
          <YesNoToggle value={form.yesNo}
            onChange={(v) => setForm((p) => ({ ...p, yesNo: v }))}
            yesLabel={'✅ ' + t('common.approve')} noLabel={'❌ ' + t('common.reject')} />
        </div>
        <div>
          <FieldLabel>{t('forms.instructionsReason')}</FieldLabel>
          <TextAreaBase rows={3} placeholder={t('forms.addInstructionsPlaceholder')}
            value={form.instructions} onChange={set('instructions')} />
        </div>
        <div>
          <FieldLabel>{t('forms.inhouseCutting')}</FieldLabel>
          <YesNoToggle value={form.inhouseCutting}
            onChange={(v) => setForm((p) => ({ ...p, inhouseCutting: v }))} />
        </div>
        
        <div className="flex gap-3 pt-2">
          {onCancel && (
            <button 
              type="button" 
              onClick={onCancel}
              className="flex-1 py-4 rounded-2xl font-bold text-gray-500 text-base bg-gray-100 hover:bg-gray-200 btn-press transition-all"
            >
              {t('common.cancel')}
            </button>
          )}
          <SubmitButton loading={loading} />
        </div>

        <ConfirmationPopup 
          title={t('forms.confirmProductionApproval')} 
          details={confirmData} 
          onConfirm={executeSubmit} 
          onCancel={() => setConfirmData(null)} 
          loading={loading} 
        />
      </form>
    </div>
  );
}
