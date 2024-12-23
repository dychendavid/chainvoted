import { create } from "zustand";

export type UserStoreProps = {
  userId: number;
};

// NOTE needs authorization features in future
const useUserStore = create<UserStoreProps>((set, get) => ({
  userId: 1,
}));

export default useUserStore;
