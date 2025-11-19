import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  userProfiles: defineTable({
    userId: v.id("users"), // auth user id
    username: v.string(),
    enable_rated_r: v.boolean(),
    avatar_file_id: v.optional(v.string()),
  })
    .index("by_user_id", ["userId"])
    .index("by_username", ["username"]),

  movies: defineTable({
    external_id: v.string(),
    rating: v.optional(v.number()),
    overview: v.optional(v.string()),
    genre: v.string(),
    release_year: v.number(),
    backdrop_url: v.string(),
    poster_url: v.string(),
  }).index("by_external_id", ["external_id"]),

  comments: defineTable({
    movie_id: v.id("movies"),
    user_id: v.id("users"),
    value: v.string(),
    created_at: v.number(),
    parent_comment_id: v.optional(v.id("comments")),
    like_count: v.optional(v.number()),
    dislike_count: v.optional(v.number()),
  }).index("by_movie", ["movie_id"]).index("by_parent", ["parent_comment_id"]),

  reactions: defineTable({
    user_id: v.id("userProfiles"),
    movie_id: v.id("movies"),
    liked: v.boolean(),
    created_at: v.number(),
    updated_at: v.number(),
  }).index("by_user_movie", ["user_id", "movie_id"]).index("by_movie", ["movie_id"]),
});


