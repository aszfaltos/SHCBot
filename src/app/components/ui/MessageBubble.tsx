import type { Message } from "@/lib/types";
import { ThumbsDown, ThumbsUp } from "lucide-react";
import React, { useState, useEffect } from "react";
import clsx from "clsx";

const MessageBubble = ({ message }: { message: Message }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [userReactions, setUserReactions] = useState<{
    like: boolean;
    dislike: boolean;
    reactionIds: {[key: string]: string};
  }>({
    like: false,
    dislike: false,
    reactionIds: {}
  });
  const [reactionCounts, setReactionCounts] = useState({
    like: 0,
    dislike: 0
  });

  // Fetch existing reactions count when component mounts
  useEffect(() => {
    if (message.role === "assistant" && message.id) {
      fetchReactionCounts();
    }
  }, [message.id]);

  // Fetch current reaction counts for this message
  const fetchReactionCounts = async () => {
    try {
      const response = await fetch(`/api/message?messageId=${message.id}`);
      if (response.ok) {
        const data = await response.json();
        setReactionCounts({
          like: data.like || 0,
          dislike: data.dislike || 0
        });
        
        // Check if user has already reacted
        if (data.userReactions && data.userReactions.length > 0) {
          const hasLike = data.userReactions.some((r: any) => r.type === "like");
          const hasDislike = data.userReactions.some((r: any) => r.type === "dislike");
          
          // Store reaction IDs for potential deletion
          const reactionIds: {[key: string]: string} = {};
          data.userReactions.forEach((reaction: any) => {
            if (reaction.type && reaction.reactionId) {
              reactionIds[reaction.type] = reaction.reactionId;
            }
          });
          
          setUserReactions({
            like: hasLike,
            dislike: hasDislike,
            reactionIds
          });
          
          console.log("User reactions loaded:", { hasLike, hasDislike, reactionIds });
        } else {
          // Reset user reactions if none found
          setUserReactions({
            like: false,
            dislike: false,
            reactionIds: {}
          });
        }
      }
    } catch (error) {
      console.error("Error fetching reaction counts:", error);
    }
  };

  const handleReaction = async (reaction: "like" | "dislike") => {
    const isCurrentlyActive = userReactions[reaction];
    
    // Optimistically update UI
    setUserReactions(prev => ({
      ...prev,
      [reaction]: !isCurrentlyActive,
      // If turning on this reaction, turn off the other one
      ...((!isCurrentlyActive && reaction === "like") ? { dislike: false } : {}),
      ...((!isCurrentlyActive && reaction === "dislike") ? { like: false } : {})
    }));
    
    // Update reaction counts
    const newCounts = { ...reactionCounts };
    
    if (isCurrentlyActive) {
      // Removing reaction
      newCounts[reaction] = Math.max(0, newCounts[reaction] - 1);
    } else {
      // Adding reaction
      newCounts[reaction]++;
      
      // If we're adding one type and the other is active, decrement the other
      const oppositeReaction = reaction === "like" ? "dislike" : "like";
      if (userReactions[oppositeReaction]) {
        newCounts[oppositeReaction] = Math.max(0, newCounts[oppositeReaction] - 1);
      }
    }
    
    setReactionCounts(newCounts);
    
    try {
      if (isCurrentlyActive) {
        
        // Remove reaction
        const reactionId = userReactions.reactionIds[reaction];
        // Only attempt to delete if we have a valid reactionId
        
        if (reactionId) {

          const response = await fetch(`/api/message?messageId=${message.id}`, {
            method: "DELETE"
          });

          if (!response.ok) {
            // Revert optimistic update
            await fetchReactionCounts();
          }
        } 
        else {
          // If reactionId is missing, use messageId as fallback
          console.warn("ReactionId missing, trying to delete by messageId instead");
          const response = await fetch(`/api/message?messageId=${message.id}`, {
            method: "DELETE"
          });
          
          if (!response.ok) {
            console.error("Error removing reaction by messageId");
            // Revert optimistic update
            await fetchReactionCounts();
          }
        }
      } else {
        // Add reaction (first remove opposite reaction if it exists)
        const oppositeReaction = reaction === "like" ? "dislike" : "like";
        if (userReactions[oppositeReaction]) {
          const oppositeReactionId = userReactions.reactionIds[oppositeReaction];
          
          if (oppositeReactionId) {
            await fetch(`/api/message?messageId=${message.id}`, {
              method: "DELETE"
            });
          } else {
            // Fallback to messageId
            await fetch(`/api/message?messageId=${message.id}`, {
              method: "DELETE"
            });
          }
        }
        
        // Add the new reaction
        const response = await fetch("/api/message", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messageId: message.id,
            reaction: reaction
          }),
        });
        
        // if (response.ok) {
        //   // Store the new reaction ID
        //   const data = await response.json();
        //   if (data.reactionId) {
        //     setUserReactions(prev => ({
        //       ...prev,
        //       reactionIds: {
        //         ...prev.reactionIds,
        //         [reaction]: data.reactionId
        //       }
        //     }));
        //   }
        // } else {
           
        //   console.error("Error adding reaction");
        //   await fetchReactionCounts();
        // }
      }
    } catch (error) {
     
      console.error("Network error during reaction update:", error);
      await fetchReactionCounts();
    }
  };

  return (
    <div className="relative flex flex-col items-start">
      <div
        className={clsx(
          "px-3 py-1 rounded-[20px] border-2 transition duration-200 ease-in-out z-20",
          message.role === "user"
            ? "bg-gradient-to-t from-violet-700 to-purple-700 text-white self-end rounded-br-none max-w-[80%]"
            : "text-gray-800 dark:text-gray-300 self-start rounded-bl-none max-w-[80%]",
          message.role === "assistant" && isHovered
            ? "border-gray-300 dark:border-gray-700 bg-gray-200 dark:bg-gray-800"
            : "border-transparent bg-gray-300 dark:bg-gray-700"
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <p>{message.content}</p>
      </div>

      {/* Like/Dislike Buttons */}
      {message.role !== "user" && (
        <div
          className={clsx(
            "pt-1 transition-all duration-200",
            isHovered
              ? "opacity-100 max-h-20"
              : "opacity-0 max-h-0 overflow-hidden"
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div
            className={clsx(
              "flex gap-3 bg-gray-200 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-700 rounded-[20px] rounded-tl-none pl-3 pr-3 py-2"
            )}
          >
            <button
              className={clsx(
                "flex items-center justify-center rounded-full transition group",
                userReactions.like
                  ? "text-green-500 hover:text-green-400"
                  : "text-gray-400 hover:text-gray-500"
              )}
              title="Like"
              onClick={() => handleReaction("like")}
            >
              <ThumbsUp className="h-5 w-5" />
              {reactionCounts.like > 0 && (
                <span className={clsx(
                  "ml-1 text-xs",
                  userReactions.like ? "text-green-500" : "text-gray-500"
                )}>
                  {/* {reactionCounts.like} */}
                </span>
              )}
            </button>
            <button
              className={clsx(
                "flex items-center justify-center rounded-full transition group",
                userReactions.dislike
                  ? "text-red-500 hover:text-red-400"
                  : "text-gray-400 hover:text-gray-500"
              )}
              title="Dislike"
              onClick={() => handleReaction("dislike")}
            >
              <ThumbsDown className="h-5 w-5" />
              {reactionCounts.dislike > 0 && (
                <span className={clsx(
                  "ml-1 text-xs",
                  userReactions.dislike ? "text-red-500" : "text-gray-500" 
                )}>
                  {/* {reactionCounts.dislike} */}
                </span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessageBubble;

