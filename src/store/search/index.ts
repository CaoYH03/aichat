// 搜索
import { create } from 'zustand';
interface SearchStore {
    recordList: RecordItem<CompanyProps>[];
    setRecordList: (recordList: RecordItem<CompanyProps>[]) => void;
}
export const useSearchStore = create<SearchStore>((set) => ({
    recordList: [],
    setRecordList: (recordList: RecordItem<CompanyProps>[]) => set({ recordList }),
}));