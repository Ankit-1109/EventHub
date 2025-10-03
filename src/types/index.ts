export type UserRole = 'admin' | 'user';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  eventDate: string;
  createdBy: string;
  createdAt: string;
}

export interface Certificate {
  id: string;
  eventId: string;
  userId: string;
  certificateNumber: string;
  issuedAt: string;
  verified: boolean;
  deliveryStatus: 'pending' | 'sent' | 'delivered';
  eventTitle?: string;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, role: UserRole) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => void;
  updateProfile: (fullName: string) => Promise<void>;
}
