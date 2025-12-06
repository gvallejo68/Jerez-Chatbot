export enum AgentType {
  TOURIST = 'TOURIST',
  EMERGENCY = 'EMERGENCY'
}

export enum ToneType {
  FORMAL = 'FORMAL',
  COLLOQUIAL = 'COLLOQUIAL',
  ENTHUSIASTIC = 'ENTHUSIASTIC'
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  isError?: boolean;
  groundingUrls?: Array<{uri: string, title: string}>;
}

export interface ChatState {
  messages: Message[];
  isLoading: boolean;
}