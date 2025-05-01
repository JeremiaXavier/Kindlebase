import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import DefaultInputs from "../../components/form/form-elements/DefaultInputs";
import PageMeta from "../../components/common/PageMeta";
import Label from "@/components/form/Label";
import TextArea from "@/components/form/input/TextArea";
import Button from "@/components/ui/button/Button";
import Avatar from "@/components/ui/avatar/Avatar";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/utils";
import { MailIcon, PaperPlaneIcon, PencilIcon, UserCircleIcon } from "@/icons";
import InviteFriendModal from "@/components/models/InviteModel";
type Reply = {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  likes: number;
};

type Post = {
  id: string;
  userName: string;
  userAvatar: string;
  content: string;
  timestamp: string;
  isCurrentUser: boolean;
  likes: number;
  replies: Reply[];
};

export default function FormElements() {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [replyToPostId, setReplyToPostId] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [posts, setPosts] = useState<Post[]>([
    {
      id: "1",
      userName: "User One",
      userAvatar: "https://via.placeholder.com/40",
      content: "Just joined the community! Excited to be here.",
      timestamp: "2024-07-24 10:00 AM",
      isCurrentUser: false,
      likes: 0,
      replies: [],
    },
  ]);
  const handleCreatePost = () => {
    if (!message.trim()) return;

    if (replyToPostId) {
      // Submit as reply
      const newReply: Reply = {
        id: crypto.randomUUID(),
        userId: "CurrentUser",
        userName: "Current User",
        userAvatar: "https://via.placeholder.com/40",
        content: message,
        timestamp: new Date().toLocaleString(),
        likes: 0,
      };

      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === replyToPostId
            ? { ...post, replies: [...post.replies, newReply] }
            : post
        )
      );
      setReplyToPostId(null); // Reset reply state
    } else {
      // Submit as new post
      const newPost: Post = {
        id: crypto.randomUUID(),
        userName: "Current User",
        userAvatar: "https://via.placeholder.com/40",
        content: message,
        timestamp: new Date().toLocaleString(),
        isCurrentUser: true,
        likes: 0,
        replies: [],
      };
      setPosts((prevPosts) => [...prevPosts, newPost]);
    }

    setMessage(""); // Clear input
  };
  const [expandedReplies, setExpandedReplies] = useState<string[]>([]);
  const [replyContents, setReplyContents] = useState<{
    [postId: string]: string;
  }>({});
  const handleLikePost = (postId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) =>
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      )
    );
  };

  const toggleReplies = (postId: string) => {
    if (expandedReplies.includes(postId)) {
      setExpandedReplies((prev) => prev.filter((id) => id !== postId));
    } else {
      setExpandedReplies((prev) => [...prev, postId]);
    }
  };

  const handleReply = (postId: string) => {
    const replyContent = replyContents[postId];
    if (!replyContent || !replyContent.trim()) return;

    const newReply: Reply = {
      id: crypto.randomUUID(),
      userId: "CurrentUser", // Replace with actual user ID
      userName: "Current User", // Replace with actual user name
      userAvatar: "https://via.placeholder.com/40", // Replace
      content: replyContent,
      timestamp: new Date().toLocaleString(),
      likes: 0,
    };

    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          return { ...post, replies: [...post.replies, newReply] };
        }
        return post;
      })
    );
    setReplyContents((prev) => ({ ...prev, [postId]: "" }));
    if (!expandedReplies.includes(postId)) {
      setExpandedReplies((prev) => [...prev, postId]);
    }
  };

  const handleLikeReply = (postId: string, replyId: string) => {
    setPosts((prevPosts) =>
      prevPosts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            replies: post.replies.map((reply) =>
              reply.id === replyId
                ? { ...reply, likes: reply.likes + 1 }
                : reply
            ),
          };
        }
        return post;
      })
    );
  };
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [posts]);
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  return (
    <>
      <PageMeta
        title="Community Messaging Page"
        description="A page for community text messaging"
      />

      <PageBreadcrumb pageTitle="Community Forum" />
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsInviteOpen(true)}
        className="hover:bg-blue-100 dark:hover:bg-gray-800 fixed right-1 top-1/2 p-4 bg-blue-500"
      >
        <UserCircleIcon className="h-5 w-5 text-gray-900" />
      </Button>

      <InviteFriendModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onSend={(email) => {
          // Handle sending invite here (e.g., API call)
          alert("invitation send");
          console.log("Sending invite to:", email);
        }}
      />
      <div className="flex flex-col flex-1 bg-transparent dark:bg-gray-900 rounded-lg overflow-hidden">
        <div className="flex flex-col flex-1 max-h-[calc(100vh-200px)] min-h-[calc(100vh-200px)]">
          {/* Message List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
            {posts.map((post) => (
              <div
                key={post.id}
                className={cn(
                  "flex w-full",
                  post.isCurrentUser ? "justify-start" : "justify-start"
                )}
              >
                <div className="flex items-start gap-3 max-w-[80%]">
                  <Avatar
                    src="/images/user/user-01.jpg"
                    size="small"
                    className="mt-1"
                  />
                  <div className="flex flex-col space-y-1 w-full">
                    <div
                      className={cn(
                        "px-4 py-3 rounded-lg border whitespace-pre-wrap shadow",
                        post.isCurrentUser
                          ? "bg-blue-500 text-white border-blue-500"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600"
                      )}
                    >
                      <div className="text-xs font-semibold mb-1">
                        {post.isCurrentUser ? "you" : post.userName}
                      </div>
                      <p className="text-sm break-words">{post.content}</p>
                    </div>

                    {/* Timestamp and actions */}
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 ml-2">
                      <span>{post.timestamp}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleLikePost(post.id)}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleReplies(post.id)}
                      >
                        <MailIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setReplyToPostId(post.id)}
                      >
                        <MailIcon className="h-4 w-4" />
                      </Button>
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
                              className="mt-1"
                            />
                            <div className="bg-gray-100 dark:bg-gray-700 text-sm rounded-lg px-4 py-2 shadow border dark:border-gray-600 w-fit max-w-[90%]">
                              <div className="text-xs font-semibold mb-1">
                                {reply.userName}
                              </div>
                              <p className="break-words">{reply.content}</p>
                              <div className="flex items-center text-xs text-gray-500 mt-1 gap-2">
                                <span>{reply.timestamp}</span>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() =>
                                    handleLikeReply(post.id, reply.id)
                                  }
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </Button>
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
/* <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <DefaultInputs />
          <SelectInputs />
          <TextAreaInput />
          <InputStates />
        </div>
        <div className="space-y-6">
          <InputGroup />
          <FileInputExample />
          <CheckboxComponents />
          <RadioButtons />
          <ToggleSwitch />
          <DropzoneComponent />
        </div>
      </div> */
