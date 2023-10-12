


export type OnSaveFn = () => void;

export interface OnSaveContext {
    setOnSave: (fn: OnSaveFn) => void;
}
