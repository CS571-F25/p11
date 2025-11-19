import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const add = mutation({
  args: {
    movie_id: v.id("movies"),
    value: v.string(),
    parent_comment_id: v.optional(v.id("comments")),
  },
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) throw new Error("Must be logged in");

    const now = Date.now();
    return await ctx.db.insert("comments", {
      movie_id: args.movie_id,
      user_id: authUserId,
      value: args.value,
      created_at: now,
      parent_comment_id: args.parent_comment_id,
      like_count: 0,
      dislike_count: 0,
    });
  },
});

export const listByMovie = query({
  args: { movie_id: v.id("movies") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("comments")
      .withIndex("by_movie", (q) => q.eq("movie_id", args.movie_id))
      .collect();
  },
});


