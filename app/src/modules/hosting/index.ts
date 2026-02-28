import type { Env } from "@app/config/env";
import type { AppContext } from "@app/context";

export interface HostingFile {
  filename: string;
  url: string;
}

const getHostingConfig = (
  env: Env,
): { url: string; authName: string; authToken: string } => {
  const { HOSTING_URL, HOSTING_AUTH_NAME, HOSTING_AUTH_TOKEN } = env;
  if (!HOSTING_URL || !HOSTING_AUTH_NAME || !HOSTING_AUTH_TOKEN) {
    throw new Error(
      "Hosting is not configured: set HOSTING_URL, HOSTING_AUTH_NAME, and HOSTING_AUTH_TOKEN",
    );
  }

  return {
    url: HOSTING_URL,
    authName: HOSTING_AUTH_NAME,
    authToken: HOSTING_AUTH_TOKEN,
  };
};

const getAuthHeaders = (env: Env): Record<string, string> => {
  const { authName, authToken } = getHostingConfig(env);

  return {
    Authorization: `${authName} ${authToken}`,
  };
};

export const deleteAllFiles = async (ctx: AppContext): Promise<void> => {
  const { url } = getHostingConfig(ctx.env);
  const apiUrl = new URL("/f", url);

  const res = await fetch(apiUrl.toString(), {
    method: "DELETE",
    headers: getAuthHeaders(ctx.env),
  });

  if (!res.ok) {
    throw new Error(`Hosting delete failed: ${res.status} ${res.statusText}`);
  }
};

export const uploadUrlFile = async (
  ctx: AppContext,
  files: HostingFile[],
): Promise<HostingFile[]> => {
  const { url } = getHostingConfig(ctx.env);
  const apiUrl = new URL("/dl", url);

  const res = await fetch(apiUrl.toString(), {
    method: "POST",
    headers: {
      ...getAuthHeaders(ctx.env),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(files),
  });

  if (!res.ok) {
    throw new Error(`Hosting upload failed: ${res.status} ${res.statusText}`);
  }

  return (await res.json()) as HostingFile[];
};
