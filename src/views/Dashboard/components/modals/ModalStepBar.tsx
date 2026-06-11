'use client';

import { cn } from '@/lib/utils';

export type ModalStep = {
  id: string;
  label: string;
};

type ModalStepBarProps = {
  steps: ModalStep[];
  currentIndex: number;
  onStepClick?: (index: number) => void;
  canJumpToStep?: (index: number) => boolean;
};

export function ModalStepBar({ steps, currentIndex, onStepClick, canJumpToStep }: ModalStepBarProps) {
  return (
    <ol className="flex w-full items-start">
      {steps.map((step, index) => {
        const isActive = index === currentIndex;
        const isComplete = index < currentIndex;
        const jumpable = Boolean(onStepClick && (canJumpToStep?.(index) ?? index <= currentIndex));

        return (
          <li key={step.id} className="flex min-w-0 flex-1 items-start">
            <button
              type="button"
              disabled={!jumpable}
              onClick={() => jumpable && onStepClick?.(index)}
              className={cn(
                'group flex min-w-0 flex-1 flex-col items-center gap-1.5 px-1',
                jumpable ? 'cursor-pointer' : 'cursor-default',
              )}
            >
              <span
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors',
                  isActive && 'bg-primary text-primary-foreground',
                  isComplete && !isActive && 'bg-primary/15 text-primary group-hover:bg-primary/25',
                  !isActive && !isComplete && 'bg-muted text-muted-foreground',
                )}
              >
                {index + 1}
              </span>
              <span
                className={cn(
                  'w-full truncate text-center text-[10px] font-semibold uppercase tracking-wide sm:text-xs',
                  isActive && 'text-primary',
                  isComplete && !isActive && 'text-foreground',
                  !isActive && !isComplete && 'text-muted-foreground',
                )}
              >
                {step.label}
              </span>
            </button>
            {index < steps.length - 1 ? (
              <div
                aria-hidden
                className={cn(
                  'mt-4 h-px w-4 shrink-0 sm:w-8',
                  index < currentIndex ? 'bg-primary' : 'bg-border',
                )}
              />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
