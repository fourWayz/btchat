'use client';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { FaThumbsUp, FaComment, FaShare, FaRegCopy } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-toastify';
import CommentSection from './CommentSection';

interface UserProfile {
  username: string;
  profileImage?: string;
  address: string;
}

interface Comment {
  id: number;
  commenter: string;
  content: string;
  timestamp: number;
   likes: number;
  image?: string;
}

interface Post {
  id: number;
  author: string;
  content: string;
  image?: string;
  timestamp: number;
  likes: number;
  comments: Comment[];
}

interface Props {
  post: Post;
  onLike: (postId: number) => void;
  onComment: (postId: number, comment: string) => void;
//   onShare: (postId: number) => Promise<void>;
  isRegistered: boolean;
  getUserByAddress: (address: string) => Promise<UserProfile>;
}

const PostCard: React.FC<Props> = ({
  post,
  onLike,
  onComment,
//   onShare,
  isRegistered,
  getUserByAddress,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [authorProfile, setAuthorProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const profile = await getUserByAddress(post.author);
        setAuthorProfile(profile);
      } catch (err) {
        console.error('Failed to load profile:', err);
      }
    };
    fetchProfile();
  }, [post.author]);

//   const handleShare = async () => {
//     try {
//       setIsSharing(true);
//       await onShare(post.id);
//       toast.success('Post shared successfully!');
//     } catch (err) {
//       console.error('Failed to share:', err);
//       toast.error('Failed to share post');
//     } finally {
//       setIsSharing(false);
//     }
//   };

  const copyAddress = () => {
    navigator.clipboard.writeText(post.author);
    toast.info('Author address copied!');
  };

  return (
    <motion.div
      className="bg-gray-800/50 rounded-xl p-6 mb-6 border border-gray-700/50"
      whileHover={{ scale: 1.01 }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-sm">
            {authorProfile?.profileImage ? (
              <img
                src={authorProfile.profileImage}
                alt="Avatar"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = '/default-avatar.png';
                  e.currentTarget.onerror = null;
                }}
              />
            ) : (
              <span>{authorProfile?.username?.[0]?.toUpperCase() || post.author.slice(2, 3).toUpperCase()}</span>
            )}
          </div>
          <div className="ml-3">
            <p className="text-white font-semibold">{authorProfile?.username || post.author.slice(0, 6) + '...'}</p>
            <p className="text-gray-400 text-xs">
              {formatDistanceToNow(new Date(post.timestamp * 1000))} ago
            </p>
          </div>
        </div>
        <button onClick={copyAddress} className="text-gray-400 hover:text-purple-400 p-1">
          <FaRegCopy size={14} />
        </button>
      </div>

      {/* Content */}
      <p className="text-gray-200 mb-4">{post.content}</p>

      {post.image && (
        <div className="mb-4 rounded-lg overflow-hidden border border-gray-700">
          <img src={post.image} alt="Post" className="w-full h-auto max-h-96 object-cover" />
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center text-gray-400 mb-4">
        <div className="flex items-center space-x-4">
          <button onClick={() => onLike(post.id)} className="flex items-center space-x-1 hover:text-pink-500">
            <FaThumbsUp />
            <span>{post.likes}</span>
          </button>
          <button
            onClick={() => setShowComments((prev) => !prev)}
            className="flex items-center space-x-1 hover:text-blue-400"
          >
            <FaComment />
            <span>{post.comments.length}</span>
          </button>
        </div>
        {/* <button
          onClick={handleShare}
          disabled={isSharing}
          className={`flex items-center space-x-1 ${isSharing ? 'text-gray-500' : 'hover:text-green-400'}`}
        >
          <FaShare />
          <span>{isSharing ? 'Sharing...' : 'Share'}</span>
        </button> */}
      </div>

      {/* Comments */}
      {showComments && (
        <CommentSection
          comments={post.comments}
          postId={post.id}
          onAddComment={onComment}
          isRegistered={isRegistered}
          loading={false}
        />
      )}
    </motion.div>
  );
};

export default PostCard;
