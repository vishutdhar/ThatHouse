export interface Property {
  id: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  propertyType: PropertyType;
  listingType: ListingType;
  images: string[];
  description: string;
  yearBuilt: number;
  lotSize: number;
  features: string[];
  mlsNumber?: string;
  listingAgent?: Agent;
  latitude: number;
  longitude: number;
  isFavorite?: boolean;
  viewCount?: number;
  daysOnMarket: number;
  status: PropertyStatus;
  // Price tracking
  previousPrice?: number;
  priceChangedDate?: string;
  isPriceReduced?: boolean;
  // Open house tracking
  nextOpenHouse?: {
    startTime: string;
    endTime: string;
    notes?: string;
  };
}

export enum PropertyType {
  SINGLE_FAMILY = 'SINGLE_FAMILY',
  CONDO = 'CONDO',
  TOWNHOUSE = 'TOWNHOUSE',
  MULTI_FAMILY = 'MULTI_FAMILY',
  LAND = 'LAND',
  COMMERCIAL = 'COMMERCIAL',
}

export enum ListingType {
  FOR_SALE = 'FOR_SALE',
  FOR_RENT = 'FOR_RENT',
  SOLD = 'SOLD',
}

export enum PropertyStatus {
  ACTIVE = 'ACTIVE',
  PENDING = 'PENDING',
  SOLD = 'SOLD',
  OFF_MARKET = 'OFF_MARKET',
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profileImage?: string;
  userType: UserType;
  preferences?: UserPreferences;
  savedProperties: string[];
  rejectedProperties: string[];
  priorityProperties?: string[]; // Properties marked with superlike
  createdAt: string;
  lastActive: string;
}

export enum UserType {
  BUYER = 'BUYER',
  SELLER = 'SELLER',
  AGENT = 'AGENT',
  INVESTOR = 'INVESTOR',
}

export interface UserPreferences {
  minPrice?: number;
  maxPrice?: number;
  minBedrooms?: number;
  maxBedrooms?: number;
  minBathrooms?: number;
  maxBathrooms?: number;
  minSquareFeet?: number;
  maxSquareFeet?: number;
  propertyTypes: PropertyType[];
  searchRadius: number;
  locations: SearchLocation[];
}

export interface SearchLocation {
  city: string;
  state: string;
  zipCode?: string;
  latitude?: number;
  longitude?: number;
}

export interface Agent {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  profileImage?: string;
  brokerageName?: string;
  licenseNumber: string;
  rating?: number;
  reviewCount?: number;
  specialties?: string[];
}

export interface SwipeAction {
  propertyId: string;
  userId: string;
  action: SwipeActionType;
  timestamp: string;
}

export enum SwipeActionType {
  LIKE = 'LIKE',
  SUPER_LIKE = 'SUPER_LIKE',
  REJECT = 'REJECT',
  UNDO = 'UNDO',
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  recipientId: string;
  propertyId?: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  attachments?: MessageAttachment[];
}

export interface MessageAttachment {
  type: 'image' | 'document' | 'video';
  url: string;
  name: string;
  size?: number;
}

export interface Conversation {
  id: string;
  participants: string[];
  propertyId?: string;
  lastMessage?: Message;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface AppState {
  user: UserState;
  properties: PropertiesState;
  messages: MessagesState;
  ui: UIState;
}

export interface UserState {
  currentUser: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  savedProperties: string[];
  rejectedProperties: string[];
  priorityProperties: string[]; // Properties marked with superlike
}

export interface PropertiesState {
  properties: Property[];
  currentIndex: number;
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  filters: PropertyFilters;
  previousIndices: number[];
  propertyNotes: { [propertyId: string]: string };
  propertyCollections: { [propertyId: string]: string };
}

export interface PropertyFilters {
  priceRange: { min?: number; max?: number };
  bedrooms: { min?: number; max?: number };
  bathrooms: { min?: number; max?: number };
  squareFeet: { min?: number; max?: number };
  propertyTypes: PropertyType[];
  sortBy: 'price' | 'newest' | 'squareFeet' | 'bedrooms';
  sortOrder: 'asc' | 'desc';
}

export interface MessagesState {
  conversations: Conversation[];
  activeConversation: Conversation | null;
  messages: { [conversationId: string]: Message[] };
  isLoading: boolean;
  error: string | null;
}

export interface UIState {
  isOnboarding: boolean;
  activeTab: 'swipe' | 'saved' | 'messages' | 'profile';
  theme: 'light' | 'dark';
  notifications: {
    messages: boolean;
    matches: boolean;
    updates: boolean;
  };
}