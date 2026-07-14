import { create } from "zustand";

interface DialogState {
  openDialogs: Record<string, boolean>;
  dialogData: Record<string, unknown>;
  open: (key: string, data?: unknown) => void;
  close: (key: string) => void;
  isOpen: (key: string) => boolean;
  getData: <T>(key: string) => T | undefined;
}

export const useDialogStore = create<DialogState>((set, get) => ({
  openDialogs: {},
  dialogData: {},

  open: (key, data) => {
    set((state) => ({
      openDialogs: { ...state.openDialogs, [key]: true },
      dialogData: { ...state.dialogData, [key]: data },
    }));
  },

  close: (key) => {
    set((state) => {
      const dialogs = { ...state.openDialogs };
      delete dialogs[key];
      return { openDialogs: dialogs };
    });
  },

  isOpen: (key) => !!get().openDialogs[key],

  getData: <T>(key: string) => get().dialogData[key] as T | undefined,
}));
