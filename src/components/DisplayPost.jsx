import { useGetAllGalleryItemsQuery, useDeleteGalleryItemMutation } from "@/lib/api";
import { Trash2, Heart, MessageCircle, X } from "lucide-react";
import { motion } from "framer-motion";
import { useUser } from "@clerk/clerk-react";
import React, { useState, useEffect } from "react";

export default function DisplayPost() {
  const { user } = useUser();
  if (!user) return <p className="text-white text-center mt-10">Loading user...</p>;

  const {
    data: rawData,
    isLoading: isLoadingGalleries,
    refetch,
  } = useGetAllGalleryItemsQuery();

  const galleries = Array.isArray(rawData) ? rawData : rawData?.items ?? rawData ?? [];

  const [deleteGallery, { isLoading: isDeleting }] = useDeleteGalleryItemMutation();

  const handleDeleteGallery = async (galleryId) => {
    if (!window.confirm("Are you sure you want to delete this gallery item?")) return;
    try {
      const result = await deleteGallery(galleryId).unwrap();
      console.log("Delete success:", result);
      await refetch();
    } catch (err) {
      console.error("Delete failed:", err);
      window.alert("Failed to delete item. Check console for details.");
    }
  };

  // Likes + Comments state (local)
  const [likesMap, setLikesMap] = useState({});
  const [commentsMap, setCommentsMap] = useState({});
  const [commentsOpen, setCommentsOpen] = useState({});
  const LS_LIKES_KEY = "gallery_post_likes_v1";
  const LS_COMMENTS_KEY = "gallery_post_comments_v1";

  useEffect(() => {
    try {
      const rawLikes = JSON.parse(localStorage.getItem(LS_LIKES_KEY) || "{}");
      const rawComments = JSON.parse(localStorage.getItem(LS_COMMENTS_KEY) || "{}");
      setLikesMap(rawLikes);
      setCommentsMap(rawComments);
    } catch (e) {
      console.warn("Could not load local likes/comments", e);
    }
  }, []);

  useEffect(() => {
    if (!galleries || galleries.length === 0) return;
    setLikesMap((prev) => {
      const next = { ...prev };
      galleries.forEach((g) => {
        if (!next[g._id]) next[g._id] = { count: g.likesCount ?? 0, liked: false };
      });
      localStorage.setItem(LS_LIKES_KEY, JSON.stringify(next));
      return next;
    });
    setCommentsMap((prev) => {
      const next = { ...prev };
      galleries.forEach((g) => {
        if (!next[g._id]) next[g._id] = [];
      });
      localStorage.setItem(LS_COMMENTS_KEY, JSON.stringify(next));
      return next;
    });
  }, [galleries]);

  const handleDeleteComment = (postId, commentId) => {
    setCommentsMap((prev) => {
      const updatedComments = (prev[postId] || []).filter((c) => c.id !== commentId);
      const next = { ...prev, [postId]: updatedComments };
      localStorage.setItem(LS_COMMENTS_KEY, JSON.stringify(next));
      return next;
    });
  };

  const toggleLike = (id) => {
    setLikesMap((prev) => {
      const prevEntry = prev[id] ?? { count: 0, liked: false };
      const liked = !prevEntry.liked;
      const count = Math.max(0, prevEntry.count + (liked ? 1 : -1));
      const next = { ...prev, [id]: { liked, count } };
      localStorage.setItem(LS_LIKES_KEY, JSON.stringify(next));
      return next;
    });
  };

  const addComment = (id, text) => {
    if (!text || !text.trim()) return;
    const comment = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      text: text.trim(),
      authorName: user.fullName || user.username || "You",
      authorImage: user.imageUrl,
      createdAt: new Date().toISOString(),
    };
    setCommentsMap((prev) => {
      const next = { ...prev, [id]: [...(prev[id] || []), comment] };
      localStorage.setItem(LS_COMMENTS_KEY, JSON.stringify(next));
      return next;
    });
    setCommentsOpen((prev) => ({ ...prev, [id]: true }));
  };

  const toggleCommentsPanel = (id) => {
    setCommentsOpen((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-black flex justify-center items-start py-10">
      <div className="w-full text-white grid grid-cols-1 gap-8 p-4 max-w-4xl mx-auto">
        <motion.div
          className="p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          {isLoadingGalleries ? (
            <p className="text-center text-gray-300">Loading...</p>
          ) : galleries.length === 0 ? (
            <p className="text-center text-gray-300">No gallery items yet.</p>
          ) : (
            galleries.map((item) => {
              const likeData = likesMap[item._id] ?? { count: 0, liked: false };
              const itemComments = commentsMap[item._id] ?? [];
              const commentsVisible = !!commentsOpen[item._id];

              return (
                <div
                  key={item._id}
                  className="bg-gray-900 rounded-xl shadow-lg overflow-hidden transform hover:scale-[1.02] transition duration-300 mb-6 border border-gray-800"
                >
                  <div className="flex items-center space-x-4 p-4">
                    <img
                      src={item.createdBy?.imageUrl || "https://via.placeholder.com/150"}
                      alt={item.createdBy?.name || "User"}
                      className="w-12 h-12 rounded-full border border-gray-700"
                    />
                    <div>
                      <p className="font-semibold text-white">{item.createdBy?.name || "Unknown"}</p>
                      <p className="text-sm text-gray-400">{item.createdBy?.email || ""}</p>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-gray-400 text-sm mb-2">
                      {new Date(item.createdAt).toLocaleString("en-GB")}
                    </p>
                    <p className="text-gray-100 text-xl mb-4">{item.description}</p>
                  </div>

                  <div className="relative">
                    <img src={item.images?.[0]} alt="Gallery item" className="w-full max-h-[500px] object-cover" />
                    <div className="absolute top-4 right-4 flex space-x-2">
                      <button
                        onClick={() => handleDeleteGallery(item._id)}
                        disabled={isDeleting}
                        className="p-2 bg-gray-800/80 rounded-full hover:bg-red-600 transition"
                      >
                        <Trash2 className="w-5 h-5 text-white" />
                      </button>
                    </div>
                  </div>

                  <div className="px-4 py-3 flex items-center justify-between border-t border-gray-800">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => toggleLike(item._id)}
                        className={`flex items-center space-x-2 px-3 py-1 rounded-md transition ${
                          likeData.liked ? "bg-red-600 text-white" : "bg-gray-800/60 text-gray-200"
                        }`}
                      >
                        <Heart className="w-4 h-4" />
                        <span className="text-sm">{likeData.count}</span>
                      </button>

                      <button
                        onClick={() => toggleCommentsPanel(item._id)}
                        className="flex items-center space-x-2 px-3 py-1 rounded-md bg-gray-800/60 text-gray-200"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span className="text-sm">{itemComments.length}</span>
                      </button>
                    </div>
                    <div className="text-sm text-gray-400">Posted by {item.createdBy?.name || "Unknown"}</div>
                  </div>

                  {commentsVisible && (
                    <div className="px-4 pb-4 border-t border-gray-800 bg-gray-900/40">
                      <div className="space-y-3 max-h-48 overflow-y-auto py-2 pr-2">
                        {itemComments.length === 0 ? (
                          <p className="text-gray-400 text-sm">No comments yet — be the first!</p>
                        ) : (
                          itemComments.map((c) => (
                            <div key={c.id} className="flex items-start justify-between space-x-3">
                              <div className="flex items-start space-x-3">
                                <img
                                  src={c.authorImage || "https://via.placeholder.com/40"}
                                  alt={c.authorName}
                                  className="w-8 h-8 rounded-full border border-gray-700"
                                />
                                <div>
                                  <div className="text-sm font-medium text-gray-100">{c.authorName}</div>
                                  <div className="text-sm text-gray-300">{c.text}</div>
                                  <div className="text-xs text-gray-500 mt-0.5">
                                    {new Date(c.createdAt).toLocaleString()}
                                  </div>
                                </div>
                              </div>

                              {c.authorName === (user.fullName || user.username) && (
                                <button
                                  onClick={() => handleDeleteComment(item._id, c.id)}
                                  className="text-gray-400 hover:text-red-500 transition"
                                  title="Delete comment"
                                >
                                  <X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))
                        )}
                      </div>

                      <CommentInput onSubmit={(text) => addComment(item._id, text)} />
                    </div>
                  )}
                </div>
              );
            })
          )}
        </motion.div>
      </div>
    </div>
  );
}

function CommentInput({ onSubmit }) {
  const [value, setValue] = useState("");
  const disabled = value.trim().length === 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (disabled) return;
    onSubmit(value);
    setValue("");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 flex items-center space-x-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Write a comment..."
        className="flex-1 bg-gray-800/60 text-gray-100 placeholder-gray-400 rounded-md px-3 py-2 outline-none"
      />
      <button
        type="submit"
        disabled={disabled}
        className={`px-3 py-2 rounded-md ${
          disabled ? "bg-gray-700/60 text-gray-400" : "bg-blue-600 text-white"
        }`}
      >
        Comment
      </button>
    </form>
  );
}
