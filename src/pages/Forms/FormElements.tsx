import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import Avatar from "@/components/ui/avatar/Avatar";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils";
import {PaperPlaneIcon } from "@/icons";
import useChatStore, { Reply } from "@/components/store/chatStore";
import { useAuthStore } from "@/components/store/useAuthStore";
import { useParams } from "react-router";
import { ReplyIcon, ThumbsUp } from "lucide-react";

export default function FormElements() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [replyToPostId, setReplyToPostId] = useState<string | null>(null);
  const { posts, createPost, addReply, likePost, likeReply, fetchPosts } =
    useChatStore();
  const { authUser } = useAuthStore();
  const { id } = useParams();
  const communityId = id;
  const [message, setMessage] = useState("");

  const handleCreatePost = () => {
    if (!message.trim()) return;

    if (replyToPostId) {
      // Submit as reply
      const newReply: Omit<Reply,"id"> = {
        userId: authUser?.uid||null,
        userName: authUser?.displayName || "",
        userAvatar: authUser?.photoURL || "",
        content: message,
        timestamp:"",
        likes:0,
      };
      addReply(replyToPostId, newReply, communityId || null);

      setReplyToPostId(null); // Reset reply state
    } else {
      // Submit as new post
if(authUser) if(communityId)
      createPost(
        message,
        authUser?.uid,
        authUser?.displayName||"",
        authUser?.photoURL||"",
        communityId
      );
    }

    setMessage(""); // Clear input
  };
  const [expandedReplies, setExpandedReplies] = useState<string[]>([]);

  const handleLikePost = (postId: string) => {
    likePost(postId, communityId || "");
  };

  const toggleReplies = (postId: string) => {
    if (expandedReplies.includes(postId)) {
      setExpandedReplies((prev) => prev.filter((id) => id !== postId));
    } else {
      setExpandedReplies((prev) => [...prev, postId]);
    }
  };

  const handleLikeReply = (postId: string, replyId: string) => {
    if(communityId)
    likeReply(postId, replyId, communityId);
  };
  useEffect(() => {
    if (posts && posts.length === 0) {
      if (communityId) {
        fetchPosts(communityId);
        console.log("posts fetched", posts);
      }
    }
  }, [communityId]);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [posts]);

  return (
    <>
      <PageMeta
        title="Community Messaging Page"
        description="A page for community text messaging"
      />

      <PageBreadcrumb pageTitle="Community chat" />
      

      
      <div className="flex flex-col flex-1 bg-transparent dark:bg-gray-900 rounded-lg overflow-hidden">
        <div className="flex flex-col flex-1 max-h-[calc(100vh-200px)] min-h-[calc(100vh-200px)]">
          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
            {posts.map((post) => (
              <div
                key={post.id}
                className={cn(
                  "flex w-full",
                  post ? "justify-start" : "justify-start"
                )}
              >
                <div className="flex items-start gap-3 max-w-[80%]">
                  <Avatar
                    src={post.userAvatar}
                    size="medium"
                    
                  />
                  <div className="flex flex-col space-y-1 w-full">
                    <div
                      className={cn(
                        "px-4 py-3 rounded-lg border whitespace-pre-wrap shadow",
                        post.userId === authUser?.uid
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                      )}
                    >
                      <div className="text-xs font-semibold mb-1">
                        {post.userName}
                      </div>
                      <p className="text-sm break-words">{post.content}</p>
                    </div>

                    {/* Timestamp and actions */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 ml-2">
                      <span>{post.timestamp.toString()}</span>
                      <div
                        
                        onClick={() => handleLikePost(post.id)}
                      >
                        <ThumbsUp className="h-4 w-4" />
                      </div>
                      {post.likes}
                      <div
                        
                        onClick={() => toggleReplies(post.id)}
                      >
                        Replies
                      </div>
                      {post.replies.length}
                      <div
                        
                        onClick={() => setReplyToPostId(post.id)}
                      >
                        <ReplyIcon className="h-4 w-4" />
                      </div>
                    </div>

                    {/* 🟩 Replies */}
                    {expandedReplies.includes(post.id) && (
                      <div className="ml-6 mt-2 space-y-2">
                        {post.replies.map((reply) => (
                          <div
                            key={reply.id}
                            className="flex items-start gap-2"
                          >
                            <Avatar
                              src={reply.userAvatar}
                              size="small"
                              
                            />

                            <div className="flex flex-col">
                              {/* Chat bubble */}
                              <div
                                className={cn(
                                  "px-4 py-3 rounded-lg border whitespace-pre-wrap shadow",
                                  reply.userId === authUser?.uid
                                    ? "bg-blue-500 text-white border-blue-500"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                                )}
                              >
                                <div className="text-xs font-semibold mb-1">
                                  {reply.userName}
                                </div>
                                <p className="break-words">{reply.content}</p>
                              </div>

                              {/* Footer below bubble */}
                              <div className="flex items-center text-xs text-gray-500 mt-1 gap-2 ml-2">
                                <span>{reply.timestamp.toString()}</span>
                                <div
                                  
                                  onClick={() =>
                                    handleLikeReply(post.id, reply.id)
                                  }
                                >
                                  <ThumbsUp className="w-4 h-4" />
                                </div>
                                <span>{reply.likes} likes</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className=" p-4 bg-transparent dark:bg-transparent flex-shrink-0 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="flex-1">
                {replyToPostId && (
                  <div className="text-xs text-blue-500 mb-2">
                    Replying to{" "}
                    {posts.find((p) => p.id === replyToPostId)?.userName}
                    <button
                      className="ml-2 text-red-500 text-xs"
                      onClick={() => setReplyToPostId(null)}
                    >
                      Cancel
                    </button>
                  </div>
                )}

                <TextArea
                  placeholder="Write your message..."
                  value={message}
                  onChange={setMessage}
                  rows={1}
                  className="w-full border-b resize-none bg-gray-100 dark:bg-gray-800 border-0   rounded-lg px-4 py-2 text-sm text-gray-900 dark:text-white"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleCreatePost();
                    }
                  }}
                />
              </div>
              <Button
                onClick={handleCreatePost}
                className="p-3 rounded-full bg-blue-500 hover:bg-blue-600 text-white"
                disabled={!message.trim()}
              >
                <PaperPlaneIcon className="h-6 w-6" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
