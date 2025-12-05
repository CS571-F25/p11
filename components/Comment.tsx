"use client";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThumbsUp, ThumbsDown, Trash2 } from "lucide-react";

export function Comment({ comment }: any) {
  const react = useMutation(api.comments.reactToComment);
  const getOrCreateUser = useMutation(api.userProfiles.getOrCreateCurrentUser);
  const deleteCommentMutation = useMutation(api.comments.deleteComment);
  const addComment = useMutation(api.comments.add);

  const [userId, setUserId] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [collapsed, setCollapsed] = useState(true);
  const [userReaction, setUserReaction] = useState<"like" | "dislike" | null>(null);
  const [replying, setReplying] = useState(false);
  const [replyText, setReplyText] = useState("");

  // Fetch or create the current user's profile
  useEffect(() => {
    getOrCreateUser()
      .then((profile) => {
        setUserId(profile || null);

        const reaction = comment.reactions?.find((r: any) => r.user_id === profile);
        setUserReaction(reaction?.reaction || null);
      })
      .catch(() => setUserId(null));
  }, [getOrCreateUser, comment.reactions]);

  const isOwner = userId === comment.user_id;

  const handleDelete = async () => {
    if (!userId) return;
    if (!confirm("Are you sure you want to delete this comment?")) return;

    setIsDeleting(true);
    try {
      await deleteCommentMutation({ commentId: comment._id });
    } catch (err) {
      console.error(err);
      alert("Failed to delete comment.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReaction = async (reaction: "like" | "dislike") => {
    if (!userId) return;

    await react({
      commentId: comment._id,
      userId,
      reaction,
    });

    if (userReaction === reaction) setUserReaction(null);
    else setUserReaction(reaction);
  };

  const handleReply = async () => {
    if (!userId || !replyText.trim()) return;

    await addComment({
      movie_id: comment.movie_id,
      value: replyText,
      parent_comment_id: comment._id,
    });

    setReplyText("");
    setReplying(false);
  };

  // Fetch replies to this comment
  const replies = useQuery(
    api.comments.listByMovie,
    { movie_id: comment.movie_id }
  )?.filter((c) => c.parent_comment_id === comment._id);

  return (
    <div key={comment._id} className="relative p-4 border rounded-lg ml-0">
      {isOwner && (
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 p-1"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </Button>
      )}

      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{comment.username}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(comment.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div
        className={`text-sm text-muted-foreground mb-3 break-words whitespace-normal overflow-hidden transition-all duration-200 ${
          collapsed ? "max-h-6" : "max-h-screen"
        }`}
      >
        {comment.value}
      </div>

      <div className="flex items-center gap-3 mb-2">
        <Button
          size="sm"
          variant={userReaction === "like" ? "default" : "outline"}
          className="flex items-center gap-1"
          disabled={!userId}
          onClick={() => handleReaction("like")}
        >
          <ThumbsUp className="w-4 h-4" />
          {comment.like_count}
        </Button>

        <Button
          size="sm"
          variant={userReaction === "dislike" ? "default" : "outline"}
          className="flex items-center gap-1"
          disabled={!userId}
          onClick={() => handleReaction("dislike")}
        >
          <ThumbsDown className="w-4 h-4" />
          {comment.dislike_count}
        </Button>

        {userId && (
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setReplying(!replying)}
          >
            Reply
          </Button>
        )}
      </div>

      {replying && (
        <div className="flex flex-col gap-2 mb-2 ml-4">
          <Input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Write a reply..."
          />
          <Button size="sm" onClick={handleReply}>
            Post Reply
          </Button>
        </div>
      )}

      <div className="ml-4 space-y-2">
        {replies
          ?.slice()
          .sort((a, b) => ((b.like_count || 0) - (b.dislike_count || 0)) - ((a.like_count || 0) - (a.dislike_count || 0)))
          .map((r) => (
            <Comment key={r._id} comment={r} />
        ))}
      </div>
    </div>
  );
}
