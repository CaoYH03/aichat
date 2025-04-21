// 搜索
import { create } from 'zustand';
interface SearchStore {
    recordList: RecordItem<CompanyProps>[];
    setRecordList: (recordList: RecordItem<CompanyProps>[]) => void;
    total: number;
    setTotal: (total: number) => void;
    page: number;
    setPage: (page: number) => void;
}
export const useSearchStore = create<SearchStore>((set) => ({
    recordList: [],
    setRecordList: (recordList: RecordItem<CompanyProps>[]) => set({ recordList }),
    total: 0,
    setTotal: (total: number) => set({ total }),
    page: 1,
    setPage: (page: number) => set({ page }),
}));