import { cache } from "react";
import { api } from "@/lib/api";
import { mapLoginResponse, mapMeResponse } from "./auth.mapper";
import type { LoginResponse, MeResponse } from "./auth.types";

export async function loginApi(
  tenantSlug: string,
  email: string,
  senha: string,
  rememberMe: boolean
): Promise<LoginResponse> {
  const raw = await api.post("/v1/auth/login", { email, senha, remember_me: rememberMe });
  return mapLoginResponse(raw);
}

export async function logoutApi(): Promise<void> {
  await api.post("/v1/auth/logout", {});
}

export const getMeApi = cache(
  (): Promise<MeResponse> =>
    api
      .get("/v1/auth/me", { next: { revalidate: 300, tags: ["auth-me"] } })
      .then(mapMeResponse)
);
