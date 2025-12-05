import { query, mutation } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import type { MutationCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) {
      return null;
    }

    return await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", authUserId))
      .unique();
  },
});

// Helper function to get or create a user profile with default username
// This is used internally by other mutations
export async function getOrCreateUserProfile(ctx: MutationCtx, authUserId: Id<"users">) {
  // Try to get existing profile
  const existing = await ctx.db
    .query("userProfiles")
    .withIndex("by_user_id", (q: any) => q.eq("userId", authUserId))
    .unique();

  if (existing) {
    return existing._id;
  }

  // Get user email for default username
  const user = await ctx.db.get(authUserId);
  let emailPrefix = "user";
  if (user && "email" in user && typeof user.email === "string") {
    emailPrefix = user.email.split("@")[0];
  }
  
  // Generate a unique default username
  let defaultUsername = `user_${emailPrefix}`;
  let counter = 1;
  
  // Check if username is taken, if so append a number
  let usernameTaken = await ctx.db
    .query("userProfiles")
    .withIndex("by_username", (q: any) => q.eq("username", defaultUsername))
    .first();

  while (usernameTaken) {
    defaultUsername = `user_${emailPrefix}_${counter}`;
    usernameTaken = await ctx.db
      .query("userProfiles")
      .withIndex("by_username", (q: any) => q.eq("username", defaultUsername))
      .first();
    counter++;
  }

  // Create new profile with default username
  return await ctx.db.insert("userProfiles", {
    userId: authUserId,
    username: defaultUsername,
    enable_rated_r: false,
  });
}

export const getOrCreateCurrentUser = mutation({
  handler: async (ctx) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) return null;

    return await getOrCreateUserProfile(ctx, authUserId);
  },
});

export const createOnSignUp = mutation({
  args: {
    username: v.string(),
  },
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) {
      throw new Error("Must be logged in");
    }

    // Check if profile already exists
    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", authUserId))
      .unique();

    if (existing) {
      return existing._id;
    }

    // Check if username is already taken
    const usernameTaken = await ctx.db
      .query("userProfiles")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (usernameTaken) {
      throw new Error("Username is already taken");
    }

    // Create new profile with default values
    return await ctx.db.insert("userProfiles", {
      userId: authUserId,
      username: args.username,
      enable_rated_r: false,
    });
  },
});

export const upsert = mutation({
  args: {
    username: v.string(),
    enable_rated_r: v.boolean(),
    avatar_file_id: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) {
      throw new Error("Must be logged in");
    }

    const existing = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", authUserId))
      .unique();

    if (existing) {
      // If username is being changed, check if it's already taken by another user
      if (args.username !== existing.username) {
        const usernameTaken = await ctx.db
          .query("userProfiles")
          .withIndex("by_username", (q) => q.eq("username", args.username))
          .first();

        if (usernameTaken && usernameTaken._id !== existing._id) {
          throw new Error("Username is already taken");
        }
      }

      await ctx.db.patch(existing._id, args);
      return existing._id;
    }

    // Check if username is already taken for new profiles
    const usernameTaken = await ctx.db
      .query("userProfiles")
      .withIndex("by_username", (q) => q.eq("username", args.username))
      .first();

    if (usernameTaken) {
      throw new Error("Username is already taken");
    }

    return await ctx.db.insert("userProfiles", {
      userId: authUserId,
      ...args,
    });
  },
});
