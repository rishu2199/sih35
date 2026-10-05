import { UserProfile, UserRole } from '../types/laboratory';
import { CANONICAL_USERS, USER_METROLOGIST } from '../data/users';

export interface UserRepository {
  list(): Promise<UserProfile[]>;
  getById(id: string): Promise<UserProfile | null>;
  getByRole(role: UserRole): Promise<UserProfile | null>;
  getCurrentUser(): Promise<UserProfile>;
  setCurrentUser(user: UserProfile): Promise<void>;
  setCurrentRole(role: UserRole): Promise<UserProfile>;
}

const STORAGE_KEY_USER = 'metrologix:currentUser';
const STORAGE_KEY_ROLE = 'metrologix:role';

class MockUserRepository implements UserRepository {
  private users: Map<string, UserProfile> = new Map();
  private currentUser: UserProfile = USER_METROLOGIST;

  constructor() {
    this.loadFromStorageOrSeed();
  }

  private loadFromStorageOrSeed(): void {
    CANONICAL_USERS.forEach((u) => {
      this.users.set(u.id, { ...u });
    });

    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        const storedRole = localStorage.getItem(STORAGE_KEY_ROLE) as UserRole | null;
        if (storedRole) {
          const found = Array.from(this.users.values()).find((u) => u.role === storedRole);
          if (found) this.currentUser = found;
        }
        const storedUser = localStorage.getItem(STORAGE_KEY_USER);
        if (storedUser) {
          this.currentUser = JSON.parse(storedUser);
        }
      } catch (e) {
        console.warn('LocalStorage error in MockUserRepository', e);
      }
    }
  }

  private persist(): void {
    if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(this.currentUser));
        localStorage.setItem(STORAGE_KEY_ROLE, this.currentUser.role);
      } catch (e) {
        // Ignore
      }
    }
  }

  async list(): Promise<UserProfile[]> {
    return Array.from(this.users.values());
  }

  async getById(id: string): Promise<UserProfile | null> {
    const u = this.users.get(id);
    return u ? { ...u } : null;
  }

  async getByRole(role: UserRole): Promise<UserProfile | null> {
    for (const u of this.users.values()) {
      if (u.role === role) return { ...u };
    }
    return null;
  }

  async getCurrentUser(): Promise<UserProfile> {
    return { ...this.currentUser };
  }

  async setCurrentUser(user: UserProfile): Promise<void> {
    this.currentUser = { ...user };
    this.persist();
  }

  async setCurrentRole(role: UserRole): Promise<UserProfile> {
    const user = await this.getByRole(role);
    if (user) {
      this.currentUser = user;
      this.persist();
      return user;
    }
    return this.currentUser;
  }
}

export const userRepository: UserRepository = new MockUserRepository();
