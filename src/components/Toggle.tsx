import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
}) => {
  return (
    <label className="flex items-center cursor-pointer">
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div
          className={`block w-14 h-8 rounded-full transition-all duration-300 border-2 ${checked
            ? 'bg-[var(--theme-tertiary)]/20 border-[var(--theme-tertiary)]'
            : 'bg-[var(--theme-quaternary)]/10 border-[var(--theme-secondary)]'
            } ${disabled ? 'opacity-50' : ''}`}
        />
        <div
          className={`absolute left-1 top-1 w-6 h-6 rounded-full transition-all duration-300 shadow-md ${checked
            ? 'bg-[var(--theme-tertiary)] transform translate-x-6'
            : 'bg-[var(--theme-secondary)] transform translate-x-0'
            }`}
        />
      </div>
      {label && (
        <span className={`ml-3 text-[var(--theme-tertiary)] ${disabled ? 'opacity-50' : ''}`}>
          {label}
        </span>
      )}
    </label>
  );
};

export default Toggle;
