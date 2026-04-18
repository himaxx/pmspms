import StepBadge from './StepBadge';

/* Determine which step is the current active one */
function detectCurrentStep(job) {
  if (job.s6SettleQty)     return 6;
  if (job.s5JamaQty)       return 5;
  if (job.s4StartDate)     return 4;
  if (job.s3Actual)        return 3;
  if (job.s2Actual)        return 2;
  return 1;
}

/* Determine which steps have been completed */
function getCompletedSteps(job) {
  return {
    1: Boolean(job.date),        // always done once job exists
    2: Boolean(job.s2Actual),
    3: Boolean(job.s3Actual),
    4: Boolean(job.s4StartDate),
    5: Boolean(job.s5JamaQty),
    6: Boolean(job.s6SettleQty),
  };
}

/**
 * JobCard
 * Props:
 *   job       — job object from getAllJobs() / getJobFromFMS()
 *   showSteps — whether to render the 6-step mini timeline (default: true)
 */
export default function JobCard({ job, showSteps = true }) {
  if (!job) return null;

  const currentStep = detectCurrentStep(job);
  const completed   = getCompletedSteps(job);

  return (
    <article className="anim-slideUp ag-lift bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3">

      {/* ── Row 1: Job number + Item name ──────────────────────────── */}
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-[11px] font-medium text-gray-400 tracking-wider uppercase">
            Job #{job.jobNo}
          </p>
          <h3 className="font-bold text-gray-900 leading-tight mt-0.5 text-base">
            {job.item || '—'}
          </h3>
        </div>
        {/* Item group badge */}
        {job.itemGroup && (
          <span className="shrink-0 text-[10px] font-semibold bg-blue-50 text-blue-600
                           ring-1 ring-blue-100 rounded-full px-2 py-0.5 mt-0.5">
            {job.itemGroup}
          </span>
        )}
      </div>

      {/* ── Row 2: Size / Qty / Reason ─────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
        {job.size && (
          <span><span className="font-medium text-gray-800">Size:</span> {job.size}</span>
        )}
        {job.qty && (
          <span><span className="font-medium text-gray-800">Qty:</span> {job.qty}</span>
        )}
        {job.reason && (
          <span className="text-gray-500 truncate max-w-[160px]">{job.reason}</span>
        )}
      </div>

      {/* ── Row 3: Current step badge ───────────────────────────────── */}
      <div className="flex items-center gap-2">
        <StepBadge step={currentStep} size="sm" showLabel />
      </div>

      {/* ── Row 4: Special instruction ─────────────────────────────── */}
      {job.specialInstruction && (
        <div className="flex items-start gap-1.5">
          <span className="inline-flex items-center text-[11px] font-medium
                           bg-yellow-50 text-yellow-700 ring-1 ring-yellow-200
                           rounded-lg px-2.5 py-1 leading-snug">
            ⚠️ {job.specialInstruction}
          </span>
        </div>
      )}

      {/* ── Row 5: Step timeline ────────────────────────────────────── */}
      {showSteps && (
        <div className="pt-1 border-t border-gray-50">
          <div className="flex items-center justify-between gap-1">
            {[1, 2, 3, 4, 5, 6].map((step) => {
              const done   = completed[step];
              const active = step === currentStep;
              return (
                <div key={step} className="flex flex-col items-center gap-1 flex-1">
                  {/* connector line */}
                  <div className="flex items-center w-full">
                    {step > 1 && (
                      <div className={`h-0.5 flex-1 rounded-full ${done || active ? 'bg-indigo-300' : 'bg-gray-200'}`} />
                    )}
                    {/* circle */}
                    <span
                      className={`flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold
                                  shrink-0 border-2 transition-all duration-200
                                  ${active  ? 'border-indigo-500 bg-indigo-500 text-white scale-110'
                                  : done    ? 'border-indigo-300 bg-indigo-50  text-indigo-500'
                                            : 'border-gray-200   bg-gray-50    text-gray-400'}`}
                    >
                      {done && !active ? '✓' : step}
                    </span>
                    {step < 6 && (
                      <div className={`h-0.5 flex-1 rounded-full ${done ? 'bg-indigo-300' : 'bg-gray-200'}`} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </article>
  );
}
