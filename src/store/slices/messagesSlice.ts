import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Conversation, Message, MessagesState } from '../../types';

const initialState: MessagesState = {
  conversations: [],
  activeConversation: null,
  messages: {},
  isLoading: false,
  error: null,
};

const messagesSlice = createSlice({
  name: 'messages',
  initialState,
  reducers: {
    fetchConversationsStart: (state) => {
      state.isLoading = true;
      state.error = null;
    },
    fetchConversationsSuccess: (state, action: PayloadAction<Conversation[]>) => {
      state.isLoading = false;
      state.conversations = action.payload;
      state.error = null;
    },
    fetchConversationsFailure: (state, action: PayloadAction<string>) => {
      state.isLoading = false;
      state.error = action.payload;
    },
    setActiveConversation: (state, action: PayloadAction<Conversation | null>) => {
      state.activeConversation = action.payload;
    },
    addMessage: (state, action: PayloadAction<Message>) => {
      const { conversationId } = action.payload;
      if (!state.messages[conversationId]) {
        state.messages[conversationId] = [];
      }
      state.messages[conversationId].push(action.payload);
      
      const conversation = state.conversations.find(c => c.id === conversationId);
      if (conversation) {
        conversation.lastMessage = action.payload;
        conversation.updatedAt = new Date().toISOString();
      }
    },
    markMessageAsRead: (state, action: PayloadAction<{ conversationId: string; messageId: string }>) => {
      const { conversationId, messageId } = action.payload;
      const messages = state.messages[conversationId];
      if (messages) {
        const message = messages.find(m => m.id === messageId);
        if (message) {
          message.isRead = true;
        }
      }
    },
    updateUnreadCount: (state, action: PayloadAction<{ conversationId: string; count: number }>) => {
      const conversation = state.conversations.find(c => c.id === action.payload.conversationId);
      if (conversation) {
        conversation.unreadCount = action.payload.count;
      }
    },
    createConversation: (state, action: PayloadAction<Conversation>) => {
      state.conversations.unshift(action.payload);
    },
  },
});

export const {
  fetchConversationsStart,
  fetchConversationsSuccess,
  fetchConversationsFailure,
  setActiveConversation,
  addMessage,
  markMessageAsRead,
  updateUnreadCount,
  createConversation,
} = messagesSlice.actions;

export default messagesSlice.reducer;