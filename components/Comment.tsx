"use client";
import { useEffect, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ThumbsUp, ThumbsDown, Trash2, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";

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
  const [showReplies, setShowReplies] = useState(false);

  // Fetch or create the current user's profile
  useEffect(() => {
    getOrCreateUser()
      .then((profile) => {
        setUserId(profile || null);

        const reaction = comment.reactions?.find((r: any) => r.user_id === profile);
        setUserReaction(reaction?.reaction || null);
      })
      .catch(() => setUserId(null));
  }, [getOrCreateUser, comment.reactions, comment._id]);

  const isOwner = userId === comment.user_id;


  const handleDelete = async () => {
    if (!userId) return;

    toast("Are you sure you want to delete this comment?", {
      action: {
        label: "Delete",
        onClick: async () => {
          setIsDeleting(true);
          try {
            await deleteCommentMutation({ commentId: comment._id });
            toast.success("Comment deleted.");
          } catch (err) {
            console.error(err);
            toast.error("Failed to delete comment.");
          } finally {
            setIsDeleting(false);
          }
        }
      },
      cancel: {
        label: "Cancel",
        onClick: () => {}
      }
    });
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

  const hasLiked = userReaction === "like";

  return (
    <div key={comment._id} className="relative p-4 rounded-lg ml-0">
      {isOwner && (
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 p-1"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          <Trash2 className="w-4 h-4 text-red-500" aria-label="Delete comment" />
        </Button>
      )}

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold">{comment.username}</span>
          <span className="text-xs text-muted-foreground">
            {new Date(comment.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div
        className={`text-sm text-white mb-3 break-words whitespace-normal overflow-hidden transition-all duration-200 ${
          collapsed ? "max-h-6" : "max-h-screen"
        }`}
      >
        {comment.value}
      </div>

      <div className="flex items-center gap-3 mb-3">
        <Button
          size="sm"
          variant={userReaction === "like" ? "default" : "outline"}
          className={`flex items-center gap-1 ${
            userReaction === "like" ? "bg-primary text-primary-foreground" : ""
          }`}
          disabled={!userId || isOwner}
          onClick={() => handleReaction("like")}
        >
          <ThumbsUp className="w-4 h-4" aria-label="Like" />
          {comment.like_count || 0}
        </Button>

        <Button
          size="sm"
          variant={userReaction === "dislike" ? "default" : "outline"}
          className={`flex items-center gap-1 ${
            userReaction === "dislike" ? "bg-primary text-primary-foreground" : ""
          }`}
          disabled={!userId || isOwner}
          onClick={() => handleReaction("dislike")}
        >
          <ThumbsDown className="w-4 h-4" aria-label="Dislike" />
          {comment.dislike_count || 0}
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
        <div className="flex flex-row gap-2 mt-3 w-1/2">
          <div className="flex-1">
            <Label htmlFor={`reply-input-${comment._id}`} className="sr-only">Write a reply</Label>
            <Input
              id={`reply-input-${comment._id}`}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleReply();
                }
              }}
              placeholder="Write a reply..."
            />
          </div>
          <Button size="sm" onClick={handleReply}>
            Post Reply
          </Button>
        </div>
      )}

      {replies && replies.length > 0 && (
        <div className="mt-3">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setShowReplies(!showReplies)}
            className="flex items-center gap-1 text-muted-foreground hover:text-foreground"
          >
            {showReplies ? (
              <ChevronDown className="w-4 h-4" aria-label="Hide replies" />
            ) : (
              <ChevronRight className="w-4 h-4" aria-label="Show replies" />
            )}
            <span className="text-sm text-white/80">
              {showReplies ? "Hide replies" : "Show replies"}
            </span>
          </Button>
          {showReplies && (
              <div className="mt-3 space-y-3 border rounded-md ">
              {replies
                ?.slice()
                .sort((a, b) => ((b.like_count || 0) - (b.dislike_count || 0)) - ((a.like_count || 0) - (a.dislike_count || 0)))
                .map((r) => (
                  <Comment key={r._id} comment={r} />
                ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
