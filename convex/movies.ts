import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const upsertByExternalId = mutation({
  args: {
    external_id: v.string(),
    rating: v.optional(v.number()),
    overview: v.optional(v.string()),
    genre: v.string(),
    release_year: v.number(),
    backdrop_url: v.string(),
    poster_url: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("movies")
      .withIndex("by_external_id", (q) => q.eq("external_id", args.external_id))
      .unique();

    if (existing) {
      await ctx.db.patch(existing._id, {
        rating: args.rating ?? existing.rating ?? 0,
        overview: args.overview,
        genre: args.genre,
        release_year: args.release_year,
        backdrop_url: args.backdrop_url,
        poster_url: args.poster_url,
      });
      return existing._id;
    }

    return await ctx.db.insert("movies", {
      external_id: args.external_id,
      rating: args.rating ?? 0,
      overview: args.overview,
      genre: args.genre,
      release_year: args.release_year,
      backdrop_url: args.backdrop_url,
      poster_url: args.poster_url,
    });
  },
});

export const getByExternalId = query({
  args: { external_id: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("movies")
      .withIndex("by_external_id", (q) => q.eq("external_id", args.external_id))
      .unique();
  },
});


