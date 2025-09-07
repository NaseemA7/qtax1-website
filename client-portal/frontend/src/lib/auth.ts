import { create } from 'zustand';


export type Role = 'SUPER_ADMIN'|'ADMIN'|'BUSINESS_OWNER'|'BUSINESS_STAFF'|'INDIVIDUAL_CLIENT';


type State = {
accessToken?: string;
refreshToken?: string;
role?: Role;
setAuth: (t: { accessToken: string; refreshToken: string; role: Role }) => void;
clear: () => void;
};


export const useAuth = create<State>((set) => ({
setAuth: (t) => set(t),
clear: () => set({ accessToken: undefined, refreshToken: undefined, role: undefined })
}));