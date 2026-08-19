"use server";

import { Client, Account, Databases, Users } from "node-appwrite";
import { cookies } from "next/headers";

export async function createSessionClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!);

  const session = cookies().get("appwrite-session");

  if (!session || !session.value) {
    throw new Error("No session");
  }

  client.setJWT(session.value);

  return {
    get account() {
      return new Account(client);
    },
  };
}

export async function createAdminClient() {
  const client = new Client()
    .setEndpoint(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!)
    .setProject(process.env.NEXT_PUBLIC_APPWRITE_PROJECT!)
    .setKey(process.env.NEXT_APPWRITE_KEY!);

  return {
    get account() {
      return new Account(client);
    },
    get database() {
      return new Databases(client);
    },
    get user() {
      return new Users(client);
    }
  };
}

export async function createSessionJWT(email: string, password: string): Promise<{ jwt: string; userId: string }> {
  console.log("[DEBUG] createSessionJWT called for email:", email);
  const baseEndpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!.replace(/\/v1$/, "");
  const project = process.env.NEXT_PUBLIC_APPWRITE_PROJECT!;
  console.log("[DEBUG] Endpoint:", baseEndpoint, "Project:", project);

  const sessionResp = await fetch(`${baseEndpoint}/v1/account/sessions/email`, {
    method: "POST",
    headers: {
      "X-Appwrite-Project": project,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  });

  if (!sessionResp.ok) {
    const error = await sessionResp.json().catch(() => ({}));
    throw new Error(error.message || "Failed to create session");
  }

  const session = await sessionResp.json();

  const setCookie = (sessionResp.headers as { getSetCookie?: () => string[] })
    .getSetCookie?.();
  if (!setCookie || setCookie.length === 0) {
    throw new Error("No session cookie returned");
  }

  const cookieHeader = setCookie.map((c: string) => c.split(";")[0]).join("; ");

  const jwtResp = await fetch(`${baseEndpoint}/v1/account/jwt`, {
    method: "POST",
    headers: {
      "X-Appwrite-Project": project,
      "Cookie": cookieHeader,
    },
    cache: "no-store",
  });

  if (!jwtResp.ok) {
    const error = await jwtResp.json().catch(() => ({}));
    throw new Error(error.message || "Failed to create JWT");
  }

  const jwtData = await jwtResp.json();

  return { jwt: jwtData.jwt, userId: session.userId };
}

