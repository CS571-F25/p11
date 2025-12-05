import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";
import { getOrCreateUserProfile } from "./userProfiles";

export const add = mutation({
  args: {
    movie_id: v.id("movies"),
    value: v.string(),
    parent_comment_id: v.optional(v.id("comments")),
  },
  handler: async (ctx, args) => {
    const authUserId = await getAuthUserId(ctx);
    if (!authUserId) throw new Error("Must be logged in");

    // Get or create user profile (creates one with default username if doesn't exist)
    const userProfileId = await getOrCreateUserProfile(ctx, authUserId);

    const now = Date.now();
    return await ctx.db.insert("comments", {
      movie_id: args.movie_id,
      user_id: userProfileId,
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
    const comments = await ctx.db
      .query("comments")
      .withIndex("by_movie", (q) => q.eq("movie_id", args.movie_id))
      .collect();

    // Join with userProfiles to get username
    return await Promise.all(
      comments.map(async (comment) => {
        const userProfile = await ctx.db.get(comment.user_id);
        return {
          ...comment,
          username: userProfile?.username || "Unknown",
        };
      })
    );
  },
});

export const like = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, { commentId }) => {
    const c = await ctx.db.get(commentId);
    if (!c) return;
    await ctx.db.patch(commentId, {
      like_count: (c.like_count ?? 0) + 1,
    });
  },
});

export const dislike = mutation({
  args: { commentId: v.id("comments") },
  handler: async (ctx, { commentId }) => {
    const c = await ctx.db.get(commentId);
    if (!c) return;
    await ctx.db.patch(commentId, {
      dislike_count: (c.dislike_count ?? 0) + 1,
    });
  },
});

export const reactToComment = mutation({
  args: {
    commentId: v.id("comments"),
    userId: v.id("userProfiles"),
    reaction: v.union(v.literal("like"), v.literal("dislike")),
  },

  handler: async (ctx, { commentId, userId, reaction }) => {
    const existing = await ctx.db
      .query("commentReactions")
      .withIndex("by_comment_user", q =>
        q.eq("comment_id", commentId).eq("user_id", userId)
      )
      .unique();

    const now = Date.now();

    if (existing && existing.reaction === reaction) {
      await ctx.db.delete(existing._id);
    }

    else if (existing) {
      await ctx.db.patch(existing._id, {
        reaction,
        updated_at: now,
      });
    }

    else {
      await ctx.db.insert("commentReactions", {
        comment_id: commentId,
        user_id: userId,
        reaction,
        created_at: now,
        updated_at: now,
      });
    }

    const reactions = await ctx.db
      .query("commentReactions")
      .withIndex("by_comment", q => q.eq("comment_id", commentId))
      .collect();

    const likeCount = reactions.filter(r => r.reaction === "like").length;
    const dislikeCount = reactions.filter(r => r.reaction === "dislike").length;

    await ctx.db.patch(commentId, {
      like_count: likeCount,
      dislike_count: dislikeCount,
    });
  },
});