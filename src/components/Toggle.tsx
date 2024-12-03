import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const Toggle: React.FC<ToggleProps> = ({
  checked,
  onChange,
  label,
  disabled = false,
  size = 'md'
}) => {
  const sizes = {
    sm: {
      toggle: 'w-9 h-5',
      circle: 'w-3.5 h-3.5',
      translate: 'translate-x-4',
      text: 'text-sm'
    },
    md: {
      toggle: 'w-11 h-6',
      circle: 'w-4.5 h-4.5',
      translate: 'translate-x-5',
      text: 'text'
    },
    lg: {
      toggle: 'w-14 h-7',
      circle: 'w-5.5 h-5.5',
      translate: 'translate-x-7',
      text: 'text-lg'
    }
  };

  return (
    <label className={`
      inline-flex items-center gap-3 select-none
      ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
    `}>
      <div className="relative">
        <input
          type="checkbox"
          className="sr-only peer"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          disabled={disabled}
        />
        <div
          className={`
            ${sizes[size].toggle}
            rounded-full transition-all duration-300
            border border-[var(--theme-border)]
            peer-focus-visible:ring-2 peer-focus-visible:ring-[var(--theme-border)]
            ${checked
              ? 'bg-[var(--theme-border)] bg-opacity-10'
              : 'bg-[var(--theme-accent)]'
            }
            ${disabled ? 'opacity-50' : ''}
          `}
        />
        <div
          className={`
            absolute left-0.5 top-0.5
            ${sizes[size].circle}
            rounded-full transition-all duration-300
            shadow-sm
            ${checked
              ? `bg-[var(--theme-border)] ${sizes[size].translate}`
              : 'bg-[var(--theme-border)]'
            }
            ${!disabled && checked
              ? 'shadow-[var(--theme-border)]'
              : 'shadow-[var(--theme-accent)]'
            }
          `}
        />
      </div>
      {label && (
        <span className={`
          ${sizes[size].text}
          text-[var(--theme-text)]
          ${disabled ? 'opacity-50' : ''}
        `}>
          {label}
        </span>
      )}
    </label>
  );
};

export default Toggle;
