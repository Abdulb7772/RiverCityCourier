import { mkdir, readFile, writeFile } from 'fs/promises';
import path from 'path';
import bcrypt from 'bcryptjs';

export interface UserRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  passwordHash: string;
  createdAt: string;
}

export interface CreateUserInput {
  fullName: string;
  email: string;
  phone: string;
  password: string;
}

const dataDir = path.join(process.cwd(), '.data');
const usersFile = path.join(dataDir, 'users.json');

async function ensureStore(): Promise<void> {
  await mkdir(dataDir, { recursive: true });

  try {
    await readFile(usersFile, 'utf8');
  } catch {
    await writeFile(usersFile, '[]', 'utf8');
  }
}

async function readUsers(): Promise<UserRecord[]> {
  await ensureStore();
  const contents = await readFile(usersFile, 'utf8');

  try {
    const parsed = JSON.parse(contents) as UserRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeUsers(users: UserRecord[]): Promise<void> {
  await ensureStore();
  await writeFile(usersFile, JSON.stringify(users, null, 2), 'utf8');
}

export async function findUserByEmail(email: string): Promise<UserRecord | undefined> {
  const normalizedEmail = email.trim().toLowerCase();
  const users = await readUsers();

  return users.find((user) => user.email.toLowerCase() === normalizedEmail);
}

export async function createUser(input: CreateUserInput): Promise<UserRecord> {
  const normalizedEmail = input.email.trim().toLowerCase();
  const existingUser = await findUserByEmail(normalizedEmail);

  if (existingUser) {
    throw new Error('A user with that email already exists.');
  }

  const users = await readUsers();
  const passwordHash = await bcrypt.hash(input.password, 10);

  const user: UserRecord = {
    id: crypto.randomUUID(),
    fullName: input.fullName.trim(),
    email: normalizedEmail,
    phone: input.phone.trim(),
    passwordHash,
    createdAt: new Date().toISOString(),
  };

  users.push(user);
  await writeUsers(users);

  return user;
}

export async function verifyUserCredentials(
  email: string,
  password: string,
): Promise<UserRecord | null> {
  const user = await findUserByEmail(email);

  if (!user) {
    return null;
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);

  return isValid ? user : null;
}