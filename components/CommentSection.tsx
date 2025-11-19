"use client";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";

interface CommentsSectionProps {
  movieId: string;
}

export function CommentSection({ movieId }: CommentsSectionProps) {
  const [newComment, setNewComment] = useState("");

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

    await addComment({
      movie_id: movie._id,
      value: newComment,
    });

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
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <Button onClick={handleSubmit}>Post</Button>
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
