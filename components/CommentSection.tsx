"use client";
import { useState } from "react";
import { useMutation, useQueries, useQuery, useConvexAuth } from "convex/react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
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
  const [sortBy, setSortBy] = useState<SortOption>("most_liked");
  const { isAuthenticated } = useConvexAuth();

  const movie = useQuery(api.movies.getByExternalId, {
    external_id: movieId,
  });

  const queryComments = useQuery(
    api.comments.listByMovie,
    movie ? { movie_id: movie._id } : "skip",
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
    } catch {
      toast.error("Must be logged in to comment!");
    }

    setNewComment("");
  };

  if (!movie) return <p>Loading movie...</p>;
  if (!comments) return <p>Loading comments...</p>;

  const sortedComments = [...comments].sort((a, b) => {
    switch (sortBy) {
      case "most_liked":
        return ((b.like_count || 0) - (b.dislike_count || 0)) - ((a.like_count || 0) - (a.dislike_count || 0));
      case "most_disliked":
        return ((b.dislike_count || 0) - (b.like_count || 0)) - ((a.dislike_count || 0) - (a.like_count || 0))
      case "newest":
        return b.created_at - a.created_at;
      case "oldest":
        return a.created_at - b.created_at;
      default:
        return 0;
    }
  });

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Comments</h2>
        <div className="w-52">
          <Label htmlFor="sort-comments" className="sr-only">Sort comments</Label>
          <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortOption)}>
            <SelectTrigger id="sort-comments" className="w-full bg-background text-white border focus:ring-0 focus:border-ring">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent className="bg-background text-white border border-border">
              <SelectItem value="most_liked">Most Liked</SelectItem>
              <SelectItem value="most_disliked">Most Disliked</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="oldest">Oldest</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <div className="flex-1">
          <Label htmlFor="new-comment" className="sr-only">Write a comment</Label>
          <Input
            id="new-comment"
            className="w-full"
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
        </div>
        <Button onClick={handleSubmit} disabled={!isAuthenticated}>Post</Button>
      </div>

      <div className="space-y-3">
        {sortedComments.filter(comment => !comment.parent_comment_id).map((comment) => (
          <Comment key={comment._id} comment={comment} />
        ))}
      </div>
    </div>
  );
}
