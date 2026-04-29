import { useState } from "react";

/**
 * Manages open/close state + optional payload for create-or-edit modal patterns.
 *
 * - Call open()      to open in "create" mode  (item = undefined)
 * - Call open(item)  to open in "edit"   mode  (item = T)
 * - Call close()     to close and clear the item
 *
 * Usage:
 *   const { isOpen, item, open, close } = useModalState<IDepartment>();
 *   <Modal isOpen={isOpen} onClose={close}>
 *     <DeptForm dept={item} />   // undefined → create, T → edit
 *   </Modal>
 */
export const useModalState = <T = undefined>() => {
  const [isOpen, setIsOpen] = useState(false);
  const [item, setItem]     = useState<T | undefined>(undefined);

  const open  = (editItem?: T) => { setItem(editItem); setIsOpen(true); };
  const close  = ()             => { setIsOpen(false); setItem(undefined); };

  return { isOpen, item, open, close };
};
