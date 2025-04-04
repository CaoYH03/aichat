// zustand
import { create } from 'zustand';

export const useMessageStore = create<MessageStore>((set) => ({
  messages: [],
  setMessages: (messages: Message[]) => set({ messages }),
  addMessage: (message: Message[]) => set((state) => ({ messages: [...state.messages, ...message] })),
}));

interface Message {
  role: 'user' | 'assistant';
  content: string;
  id: string;
}

interface MessageStore {
  messages: Message[];
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message[]) => void;
}
