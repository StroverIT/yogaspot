import type { ComponentPropsWithoutRef } from 'react';
import type * as DialogPrimitive from '@radix-ui/react-dialog';

type DialogContentProps = ComponentPropsWithoutRef<typeof DialogPrimitive.Content>;

/** Prevents Radix dialogs from closing when clicking the backdrop / outside the panel. */
export const preventDialogOutsideClose: Pick<
  DialogContentProps,
  'onPointerDownOutside' | 'onInteractOutside'
> = {
  onPointerDownOutside: e => e.preventDefault(),
  onInteractOutside: e => e.preventDefault(),
};
