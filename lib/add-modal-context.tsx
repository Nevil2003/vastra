"use client";

import { createContext, useContext, useState } from "react";
import { AddGarmentModal } from "@/components/wardrobe/add-garment-modal";

interface AddModalCtx { openAdd: () => void; }
const Ctx = createContext<AddModalCtx>({ openAdd: () => {} });

export function AddModalProvider({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <Ctx.Provider value={{ openAdd: () => setOpen(true) }}>
      {children}
      <AddGarmentModal open={open} onClose={() => setOpen(false)} />
    </Ctx.Provider>
  );
}

export const useAddModal = () => useContext(Ctx);
