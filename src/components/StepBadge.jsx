import { STEP_LABELS } from '../utils/constants';

const STEP_COLORS = {
  1: 'bg-indigo-100 text-indigo-700 ring-indigo-200',
  2: 'bg-blue-100   text-blue-700   ring-blue-200',
  3: 'bg-orange-100 text-orange-700 ring-orange-200',
  4: 'bg-purple-100 text-purple-700 ring-purple-200',
  5: 'bg-green-100  text-green-700  ring-green-200',
  6: 'bg-gray-100   text-gray-600   ring-gray-200',
};

const SIZE_CLASSES = {
  sm: 'text-xs  px-2   py-0.5',
  md: 'text-sm  px-2.5 py-1',
};

/**
 * StepBadge
 * Props:
 *   step  (1–6)         — step number
 *   size  ('sm' | 'md') — defaults to 'sm'
 *   showLabel (boolean) — show the label text alongside the number
 */
export default function StepBadge({ step = 1, size = 'sm', showLabel = false }) {
  const color = STEP_COLORS[step] ?? STEP_COLORS[6];
  const sizeClass = SIZE_CLASSES[size] ?? SIZE_CLASSES.sm;
  const label = STEP_LABELS[step] ?? `Step ${step}`;

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-full ring-1 ${color} ${sizeClass}`}
    >
      <span>S{step}</span>
      {showLabel && <span className="font-normal opacity-80 truncate max-w-[12rem]">{label}</span>}
    </span>
  );
}
