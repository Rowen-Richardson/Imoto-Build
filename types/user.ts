export interface UserProfile {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  profilePic?: string;
  loginMethod?: 'email' | 'google' | 'facebook' | 'apple';
  phone?: string;
  suburb?: string;
  city?: string;
  province?: string;
}
