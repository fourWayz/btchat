'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { FaReply, FaThumbsUp, FaImage } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';

interface Comment {
  commenter: string;
  content: string;
  image?: string;
  timestamp: number;
  likes: number;
}

interface Props {
  comments: Comment[];
  postId: number;
  onAddComment: (postId: number, comment: string, image?: string) => void;
  isRegistered: boolean;
  loading: boolean;
}

const CommentSection: React.FC<Props> = ({
  comments,
  postId,
  onAddComment,
  isRegistered,
  loading,
}) => {
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<number | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [replyImagePreview, setReplyImagePreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (
    e: React.ChangeEvent<HTMLInputElement>,
    isReply = false
  ) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        isReply
          ? setReplyImagePreview(reader.result as string)
          : setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddComment = async (isReply = false, index?: number) => {
    if (!newComment.trim() && !(isReply ? replyImagePreview : imagePreview)) return;

    const content = isReply
      ? `@${comments[index!].commenter.slice(0, 6)} ${newComment}`
      : newComment;

    setIsSubmitting(true);
    onAddComment(postId, content, isReply ? replyImagePreview || undefined : imagePreview || undefined);
    setNewComment('');
    setIsSubmitting(false);

    if (isReply) {
      setReplyingTo(null);
      setReplyImagePreview(null);
    } else {
      setImagePreview(null);
    }
  };

  return (
    <div className="mt-6 border-t border-gray-700/30 pt-4">
      <h4 className="text-lg font-semibold text-gray-300 mb-4">
        {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
      </h4>

      <div className="space-y-4">
        <AnimatePresence>
          {comments.map((comment, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="pl-4 border-l-2 border-purple-500/20"
            >
              <div className="flex items-start">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-8 h-8 rounded-full flex items-center justify-center text-white text-xs">
                  {comment.commenter.slice(2, 4)}
                </div>
                <div className="ml-3 flex-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-200">
                      {comment.commenter.slice(0, 8)}...{comment.commenter.slice(-4)}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatDistanceToNow(new Date(comment.timestamp * 1000))} ago
                    </span>
                  </div>
                  <p className="text-gray-300 mt-1">{comment.content}</p>
                  {comment.image && (
                    <div className="mt-2 max-w-xs overflow-hidden border border-gray-600 rounded-md">
                      <img
                        src={comment.image}
                        alt="Comment media"
                        className="w-full max-h-40 object-cover"
                        loading="lazy"
                      />
                    </div>
                  )}
                  <div className="flex items-center space-x-4 mt-2">
                    <button className="flex items-center text-xs text-gray-400 hover:text-purple-400">
                      <FaThumbsUp className="mr-1" /> {comment.likes}
                    </button>
                    {isRegistered && (
                      <button
                        onClick={() => setReplyingTo(replyingTo === index ? null : index)}
                        className="flex items-center text-xs text-gray-400 hover:text-blue-400"
                      >
                        <FaReply className="mr-1" /> Reply
                      </button>
                    )}
                  </div>

                  {replyingTo === index && (
                    <div className="mt-3 space-y-2">
                      <div className="flex">
                        <input
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Write a reply..."
                          className="flex-1 bg-gray-700/50 border border-gray-600 rounded-l-lg px-3 py-2 text-white text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                        />
                        <label className="bg-gray-600 hover:bg-gray-500 px-3 py-2 text-gray-300 text-sm cursor-pointer flex items-center">
                          <FaImage />
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleImageUpload(e, true)}
                          />
                        </label>
                        <button
                          onClick={() => handleAddComment(true, index)}
                          className="bg-purple-500 text-white px-3 py-2 rounded-r-lg text-sm hover:bg-purple-600"
                        >
                          Reply
                        </button>
                      </div>
                      {replyImagePreview && (
                        <div className="relative max-w-xs">
                          <img
                            src={replyImagePreview}
                            className="rounded-md border border-gray-600 max-h-32"
                            alt="Reply preview"
                          />
                          <button
                            onClick={() => setReplyImagePreview(null)}
                            className="absolute top-1 right-1 bg-gray-800/80 rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-gray-700"
                          >
                            ×
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isRegistered && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 space-y-2"
          >
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-10 h-10 rounded-full flex-shrink-0" />
              <div className="flex-1 flex">
                <input
                  type="text"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 bg-gray-700/50 border border-gray-600 rounded-l-lg px-4 py-2 text-white focus:outline-none focus:ring-1 focus:ring-purple-500"
                />
                <label className="bg-gray-600 hover:bg-gray-500 px-4 py-2 text-gray-300 cursor-pointer flex items-center">
                  <FaImage />
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => handleImageUpload(e)}
                  />
                </label>
                <button
                  onClick={() => handleAddComment()}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-r-lg hover:opacity-90"
                >
                  {isSubmitting ? 'Commenting...' : 'Comment'}
                </button>
              </div>
            </div>

            {imagePreview && (
              <div className="relative max-w-xs ml-12">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="rounded-md border border-gray-600 max-h-32"
                />
                <button
                  onClick={() => setImagePreview(null)}
                  className="absolute top-1 right-1 bg-gray-800/80 rounded-full w-5 h-5 flex items-center justify-center text-xs hover:bg-gray-700"
                >
                  ×
                </button>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default CommentSection;
