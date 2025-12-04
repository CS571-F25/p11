"use client";
import { useEffect, useState } from "react";
import { useMutation, useQueries, useQuery } from "convex/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Comment } from "./Comment";

interface CommentsSectionProps {
  movieId: string;
}

export function CommentSection({ movieId }: CommentsSectionProps) {
  const [newComment, setNewComment] = useState("");

  const movie = useQuery(api.movies.getByExternalId, {
    external_id: movieId,
  });

  const queryComments = useQuery(
    api.comments.listByMovie,
    movie ? { movie_id: movie._id } : "skip"
  );

  const comments = queryComments ? queryComments.reverse() : [];

  const currentUser = useQuery(api.userProfiles.getCurrent);

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
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <Button onClick={handleSubmit}>Post</Button>
      </div>

      <div className="space-y-4">
        {comments.map((comment) => {
          return <Comment key={comment._id} comment={comment}></Comment>
        })}
      </div>
    </div>
  );
}
