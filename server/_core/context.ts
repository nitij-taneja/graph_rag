import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { getOrCreateDefaultUser } from "../db";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  // In single-user mode, always use the default user
  const user = await getOrCreateDefaultUser();

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
