const BASE = import.meta.env.VITE_API_URL ?? "/api";

function headersWithAuth(init?: HeadersInit): Headers {
  const h = new Headers(init);
  const token = localStorage.getItem("accessToken");
  if (token) h.set("Authorization", `Bearer ${token}`);
  return h;
}

export async function api<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    headers: headersWithAuth(init.headers),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? res.statusText);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export type UserMe = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  district: string;
  language: string;
  averageRating: number;
  ratingCount: number;
  verifiedAt: string | null;
  creditBalance?: number;
  userSkills: {
    id: string;
    offered: boolean;
    proficiency: string;
    skillTaxonomy: { id: string; nameEn: string; nameNy: string; category: string };
  }[];
};

export type TaxonomySkill = {
  id: string;
  nameEn: string;
  nameNy: string;
  category: string;
};

export type MatchRow = {
  id: string;
  name: string;
  district: string;
  averageRating: number;
  ratingCount: number;
  verified: boolean;
  score: number;
  mutualSkills: string[];
  skills: UserMe["userSkills"];
};

export type Exchange = {
  id: string;
  user1Id: string;
  user2Id: string;
  status: string;
  hoursAgreed: number;
  scheduleTime: string | null;
  skillOffered: TaxonomySkill;
  skillWanted: TaxonomySkill;
  user1: { id: string; name: string; email: string; district: string };
  user2: { id: string; name: string; email: string; district: string };
};
