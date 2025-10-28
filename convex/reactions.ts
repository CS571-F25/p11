import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const upsert = mutation({
  args: {
    movie_id: v.id("movies"),
    liked: v.boolean(),
  },
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) throw new Error("Must be logged in");

    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", authUserId))
      .unique();
    if (!profile) throw new Error("Profile required");

    const existing = await ctx.db
      .query("reactions")
      .withIndex("by_user_movie", (q) => q.eq("user_id", profile._id).eq("movie_id", args.movie_id))
      .unique();

    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { liked: args.liked, updated_at: now });
      return existing._id;
    }
    return await ctx.db.insert("reactions", {
      user_id: profile._id,
      movie_id: args.movie_id,
      liked: args.liked,
      created_at: now,
      updated_at: now,
    });
  },
});

export const getForMovie = query({
  args: { movie_id: v.id("movies") },
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) return null;
    const profile = await ctx.db
      .query("userProfiles")
      .withIndex("by_user_id", (q) => q.eq("userId", authUserId))
      .unique();
    if (!profile) return null;
    return await ctx.db
      .query("reactions")
      .withIndex("by_user_movie", (q) => q.eq("user_id", profile._id).eq("movie_id", args.movie_id))
      .unique();
  },
});


