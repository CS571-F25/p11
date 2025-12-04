"use client";
import { useState } from "react";
import { useMutation, useQuery, useConvexAuth } from "convex/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";

interface CommentsSectionProps {
  movieId: string;
}

export function CommentSection({ movieId }: CommentsSectionProps) {
  const [newComment, setNewComment] = useState("");
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
    }
    catch {
      toast.error("Must be logged in to comment!");
    }

    setNewComment("");
  };

  if (!movie) return <p>Loading movie...</p>;
  if (!comments) return <p>Loading comments...</p>;

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold mb-4">Comments</h2>

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
        {comments.map((comment) => (
          <div key={comment._id} className="p-4 border rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-semibold">{comment.username}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(comment.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="text-sm text-muted-foreground">{comment.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
