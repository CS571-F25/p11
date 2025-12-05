"use client";
import { useState } from "react";
import { useMutation, useQuery, useConvexAuth } from "convex/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Comment } from "./Comment";

interface CommentsSectionProps {
  movieId: string;
}

type SortOption = "newest" | "oldest" | "most_liked" | "most_disliked"; 

export function CommentSection({ movieId }: CommentsSectionProps) {
  const [newComment, setNewComment] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("newest");
  const { isAuthenticated } = useConvexAuth();

  const movie = useQuery(api.movies.getByExternalId, {
    external_id: movieId,
  });

  const comments = useQuery(
    api.comments.listByMovie,
    movie ? { movie_id: movie._id } : "skip"
  );

  const addComment = useMutation(api.comments.add);

  const handleSubmit = async () => {
    if (!newComment.trim() || !movie) return;

    try {
      await addComment({
        movie_id: movie._id,
        value: newComment,
      });
    } catch {
      toast.error("Must be logged in to comment!");
    }

    setNewComment("");
  };

  if (!movie) return <p>Loading movie...</p>;
  if (!comments) return <p>Loading comments...</p>;

  const sortedComments = [...comments].sort((a, b) => {
    switch (sortBy) {
      case "newest":
        return b.created_at - a.created_at;
      case "oldest":
        return a.created_at - b.created_at;
      case "most_liked":
        return ((b.like_count || 0) - (b.dislike_count || 0)) - ((a.like_count || 0) - (a.dislike_count || 0));
      case "most_disliked":
        return ((b.dislike_count || 0) - (b.like_count || 0)) - ((a.dislike_count || 0) - (a.like_count || 0))
      default:
        return 0;
    }
  });

  return (
    <div className="mt-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Comments</h2>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="border rounded px-2 py-1 text-sm bg-gray-900 text-white"
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
          <option value="most_liked">Most Liked</option>
          <option value="most_disliked">Most Disliked</option>
        </select>
      </div>

      <div className="flex gap-2 mb-6">
        <Input
          className="flex-1"
          placeholder={isAuthenticated ? "Write a comment..." : "Log in to comment..."}
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit();
            }
          }}
          disabled={!isAuthenticated}
        />
        <Button onClick={handleSubmit} disabled={!isAuthenticated}>Post</Button>
      </div>

      <div className="space-y-4">
        {sortedComments.map((comment) => (
          <Comment key={comment._id} comment={comment} />
        ))}
      </div>
    </div>
  );
}
