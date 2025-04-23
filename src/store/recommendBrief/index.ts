// 推荐简报
import { create } from 'zustand';
interface RecommendBrief {
  briefUser: string;
  id: number;
  name: string;
  shareId: string;
  title: string;
  updatedAt: string;
}
interface RecommendBriefState {
  recommendBrief: RecommendBrief[];
  setRecommendBrief: (recommendBrief: RecommendBrief[]) => void;
}

export const useRecommendBriefStore = create<RecommendBriefState>((set) => ({
  recommendBrief: [],
  setRecommendBrief: (recommendBrief: RecommendBrief[]) => set({ recommendBrief }),
}));
