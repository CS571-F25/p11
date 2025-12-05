import { useEffect, useState } from "react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";

export function Comment({ comment }: any) {
  const react = useMutation(api.comments.reactToComment);
  const getOrCreateUser = useMutation(api.userProfiles.getOrCreateCurrentUser);

  const [userId, setUserId] = useState<any>(null);

  // Fetch or create the current user's profile when component mounts
  useEffect(() => {
    getOrCreateUser()
      .then((profile) => setUserId(profile))
      .catch(() => setUserId(null));
  }, [getOrCreateUser]);

  return (
    <div key={comment._id} className="p-4 border rounded-lg">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-sm font-semibold">{comment.username}</span>
        <span className="text-xs text-muted-foreground">
          {new Date(comment.created_at).toLocaleDateString()}
        </span>
      </div>

      <div className="text-sm text-muted-foreground mb-3 break-words whitespace-normal">{comment.value}</div>

      <div className="flex items-center gap-3">
        <Button
          size="sm"
          variant="outline"
          className="flex items-center gap-1"
          disabled={!userId}
          onClick={() =>
            userId &&
            react({
              commentId: comment._id,
              userId,
              reaction: "like",
            })
          }
        >
          <ThumbsUp className="w-4 h-4" />
          {comment.like_count}
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="flex items-center gap-1"
          disabled={!userId}
          onClick={() =>
            userId &&
            react({
              commentId: comment._id,
              userId,
              reaction: "dislike",
            })
          }
        >
          <ThumbsDown className="w-4 h-4" />
          {comment.dislike_count}
        </Button>
      </div>
    </div>
  );
}
