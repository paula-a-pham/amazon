export type User = {
  id: string;
  name: string;
  email: string;
  role: 'CUSTOMER' | 'SELLER' | 'ADMIN';
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  user: User;
  accessToken: string;
};
