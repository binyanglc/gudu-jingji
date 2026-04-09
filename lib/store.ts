import { Redis } from "@upstash/redis";

export interface GroupData {
  id: number;
  name: string;
  productName: string;
  description: string;
  imageUrl: string | null;
  submitted: boolean;
  generationCount: number;
}

const GROUP_NAMES: Record<number, string> = {
  1: "第一组",
  2: "第二组",
  3: "第三组",
  4: "第四组",
  5: "老师体验组",
};

const GROUP_MEMBERS: Record<number, number> = {
  1: 3,
  2: 3,
  3: 3,
  4: 2,
  5: 0,
};

export function getGroupMeta(id: number) {
  return {
    name: GROUP_NAMES[id] || `第${id}组`,
    members: GROUP_MEMBERS[id] || 2,
  };
}

// In-memory fallback for local development
const g = globalThis as unknown as { __memStore?: Map<string, GroupData> };
if (!g.__memStore) g.__memStore = new Map();
const memStore = g.__memStore;

function getRedis(): Redis | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL ||
    process.env.REDIS_REST_URL ||
    process.env.REDIS_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    process.env.REDIS_REST_TOKEN ||
    process.env.REDIS_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

export function getRedisStatus() {
  const envKeys = [
    "UPSTASH_REDIS_REST_URL",
    "KV_REST_API_URL",
    "REDIS_REST_URL",
    "REDIS_URL",
  ];
  const found = envKeys.filter((k) => !!process.env[k]);
  return {
    connected: getRedis() !== null,
    envVarsFound: found,
  };
}

export async function getGroup(id: number): Promise<GroupData | null> {
  const r = getRedis();
  if (r) {
    return r.get<GroupData>(`group:${id}`);
  }
  return memStore.get(`group:${id}`) ?? null;
}

export async function setGroup(id: number, data: GroupData): Promise<void> {
  const r = getRedis();
  if (r) {
    await r.set(`group:${id}`, data);
    return;
  }
  memStore.set(`group:${id}`, data);
}

export const ALL_GROUP_IDS = [1, 2, 3, 4, 5];

export async function getAllGroups(): Promise<(GroupData | null)[]> {
  return Promise.all(ALL_GROUP_IDS.map((id) => getGroup(id)));
}

export async function resetAllGroups(): Promise<void> {
  const r = getRedis();
  if (r) {
    await Promise.all(ALL_GROUP_IDS.map((id) => r.del(`group:${id}`)));
    return;
  }
  memStore.clear();
}
