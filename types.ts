export interface User {
  id: string; // Unique ID (UUID)
  username: string; // For login/display
  linkId: string; // Unique ID for their public link
}

export interface Message {
  id: string;
  userId: string; // To whom it belongs
  content: string;
  createdAt: string; // ISO Date
}

export interface AuthResponse {
  user: User;
  token?: string; // Simplificado para este prototipo
}
