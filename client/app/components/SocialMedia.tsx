"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAccount, useConnect, useDisconnect, usePublicClient, useWalletClient, useWriteContract } from "wagmi";
import { readContract, writeContract } from "@wagmi/core";
import { ToastContainer, toast } from "react-toastify";
import { formatEther, parseAbiItem } from "viem";
import BTCHAT_ABI from "../config/BTChat.json";
import { wagmiConfig } from "../config/wagmi";
import axios from "axios";

import ParticleBackground from "@/app/components/ParticleBackground";
import NavBar from "@/app/components/Navbar";
import WalletConnect from "@/app/components/WalletConnect";
import RegisterForm from "@/app/components/RegisterForm";
import CreatePost from "@/app/components/CreatePost";
import PostCard from "@/app/components/PostCard";
import UserProfile from "@/app/components/UserProfile";
import FloatingActionButton from "@/app/components/FloatingActionButton";

const CONTRACT_ADDRESS = "0xYourBTChatContractAddress";

export default function SocialMediaApp() {
    const [content, setContent] = useState('');
    const [username, setUsername] = useState('');
    const [posts, setPosts] = useState<any[]>([]);
    const [registeredUser, setRegisteredUser] = useState<any>(null);
    const [userStats, setUserStats] = useState<any>();
    const [freePosts, setFreePosts] = useState(0);
    const [balance, setBalance] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const { address, isConnected } = useAccount();
    const { data: walletClient } = useWalletClient();
    const { writeContractAsync } = useWriteContract();

    const { connect, connectors } = useConnect()
    const { disconnect } = useDisconnect()

    const fetchUser = async () => {
        if (!address || !walletClient) return;

        try {
            const user = await readContract(wagmiConfig, {
                abi: BTCHAT_ABI,
                address: CONTRACT_ADDRESS,
                functionName: 'getUserByAddress',
                args: [address],
            });
            setRegisteredUser(user);
        } catch (err) {
            console.warn('No user found');
            setRegisteredUser(null);
        }
    };


    const fetchPosts = async () => {
        if (!walletClient || !address) return;

        try {
            const count: bigint = await readContract(wagmiConfig, {
                abi: BTCHAT_ABI,
                address: CONTRACT_ADDRESS,
                functionName: 'getPostsCount',
                args: [],
            });

            const postsFetched = [];

            for (let i = 0; i < Number(count); i++) {
                const post = await readContract(wagmiConfig, {
                    abi: BTCHAT_ABI,
                    address: CONTRACT_ADDRESS,
                    functionName: 'getPost',
                    args: [BigInt(i)],
                });

                const postObj = {
                    id: i,
                    author: post[0],
                    content: post[1],
                    image: post[2],
                    timestamp: Number(post[3]),
                    likes: Number(post[4]),
                    commentsCount: Number(post[5]),
                    originalPostId: Number(post[6]),
                    comments: [] as any[],
                };

                // Fetch comments
                for (let j = 0; j < postObj.commentsCount; j++) {
                    const comment = await readContract(wagmiConfig, {
                        abi: BTCHAT_ABI,
                        address: CONTRACT_ADDRESS,
                        functionName: 'getComment',
                        args: [BigInt(i), BigInt(j)],
                    });

                    postObj.comments.push({
                        commenter: comment[0],
                        content: comment[1],
                        timestamp: Number(comment[2]),
                    });
                }

                postsFetched.push(postObj);
            }

            setPosts(postsFetched);
        } catch (err) {
            console.error("Error fetching posts", err);
        }
    };


    const registerUser = async () => {
        if (!address || !walletClient) return toast.error('Connect your wallet');
        if (!username) return toast.error('Username required');

        try {
            await writeContractAsync({
                abi: BTCHAT_ABI,
                address: CONTRACT_ADDRESS,
                functionName: 'registerUser',
                args: [address, username],
            });
            toast.success('Registered successfully!');
            fetchUser(); // refresh
        } catch (err) {
            console.error(err);
            toast.error('Registration failed');
        }
    };


    const createPost = async (imageUrl: string = '') => {
        if (!walletClient || !address || !content.trim()) return;

        try {
            await writeContractAsync({
                abi: BTCHAT_ABI,
                address: CONTRACT_ADDRESS,
                functionName: 'createPost',
                args: [content, imageUrl],
            });
            toast.success('Post created!');
            setContent('');
            fetchPosts(); // refresh
        } catch (err) {
            toast.error('Post failed');
            console.error(err);
        }
    };

    const likePost = async (postId: number) => {
        if (!walletClient || !address) return;

        try {
            await writeContractAsync({
                abi: BTCHAT_ABI,
                address: CONTRACT_ADDRESS,
                functionName: 'likePost',
                args: [BigInt(postId)],
            });
            toast.success("Post liked!");
            fetchPosts();
        } catch (err) {
            console.error(err);
            toast.error("Error liking post");
        }
    };

    const addComment = async (postId: number, comment: string) => {
        if (!walletClient || !address || !comment.trim()) return;

        try {
            await writeContractAsync({
                abi: BTCHAT_ABI,
                address: CONTRACT_ADDRESS,
                functionName: 'addComment',
                args: [BigInt(postId), comment],
            });
            toast.success("Comment added!");
            fetchPosts();
        } catch (err) {
            console.error(err);
            toast.error("Failed to add comment");
        }
    };

    const uploadToPinata = async (file: File): Promise<string> => {
        const formData = new FormData();
        formData.append("file", file);

        const res = await axios.post(
            "https://api.pinata.cloud/pinning/pinFileToIPFS",
            formData,
            {
                headers: {
                    "Content-Type": "multipart/form-data",
                    pinata_api_key: process.env.NEXT_PUBLIC_PINATA_KEY!,
                    pinata_secret_api_key: process.env.NEXT_PUBLIC_PINATA_SECRET!,
                },
            }
        );

        return `https://gateway.pinata.cloud/ipfs/${res.data.IpfsHash}`;
    };

    const setProfileImage = async (file: File) => {
        if (!walletClient) return;
        try {
            const ipfsUrl = await uploadToPinata(file);
            await writeContractAsync({
                abi: BTCHAT_ABI,
                address: CONTRACT_ADDRESS,
                functionName: 'setProfileImage',
                args: [ipfsUrl],
            });
            toast.success("Profile image updated!");
            fetchUser();
        } catch (err) {
            console.error(err);
            toast.error("Failed to update image");
        }
    };

    const fetchFreePosts = async () => {
        if (!walletClient || !address) return;

        try {
            const count = await readContract(wagmiConfig, {
                abi: BTCHAT_ABI,
                address: CONTRACT_ADDRESS,
                functionName: 'getFreePostsRemaining',
                args: [address],
            });

            setFreePosts(Number(count));
        } catch (err) {
            console.error(err);
        }
    };

    const fetchStats = async () => {
        if (!walletClient || !address) return;

        try {
            const result = await readContract(wagmiConfig, {
                abi: BTCHAT_ABI,
                address: CONTRACT_ADDRESS,
                functionName: 'getUserStats',
                args: [address],
            });

            setUserStats({
                posts: Number(result[0]),
                likes: Number(result[1]),
                comments: Number(result[2]),
            });
        } catch (err) {
            console.error(err);
        }
    };

    const setCoverImage = async (file: File) => {
        if (!walletClient) return;
        try {
            const ipfsUrl = await uploadToPinata(file);
            await writeContractAsync({
                abi: BTCHAT_ABI,
                address: CONTRACT_ADDRESS,
                functionName: 'setCoverPhoto',
                args: [ipfsUrl],
            });
            toast.success("Cover photo updated!");
            fetchUser();
        } catch (err) {
            console.error(err);
            toast.error("Failed to update cover photo");
        }
    };

    const editUserProfile = async (
        username: string,
        profileImage: string,
        bio: string,
        coverPhoto: string,
        interests: string[]
    ) => {
        if (!walletClient) return;
        try {
            await writeContractAsync({
                abi: BTCHAT_ABI,
                address: CONTRACT_ADDRESS,
                functionName: 'editProfile',
                args: [username, profileImage, bio, coverPhoto, interests],
            });
            toast.success("Profile updated!");
            fetchUser();
        } catch (err) {
            console.error(err);
            toast.error("Failed to update profile");
        }
    };




    useEffect(() => {
        if (address && walletClient) {
            fetchUser();
            fetchPosts();
            fetchStats();
            fetchFreePosts();
        }
    }, [address, walletClient]);


    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 overflow-x-hidden">
            <ParticleBackground />
            <ToastContainer position="top-right" autoClose={3000} />

            <NavBar>
                <button
                    onClick={() =>
                        address
                            ? disconnect()
                            : connect({ connector: connectors[0] })
                    }
                    className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                    {address ? "Disconnect" : "Connect Wallet"}
                </button>
            </NavBar>

            <main className="pt-24 pb-12 px-4 max-w-4xl mx-auto">
                {!registeredUser && (
                    <motion.div
                        key="register-form"
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className="mb-8"
                    >
                        <RegisterForm
                            username={username}
                            setUsername={setUsername}
                            registerUser={registerUser}
                            isLoading={isLoading}
                            isWalletConnected={!!address}
                        />
                    </motion.div>
                )}

                {registeredUser && (
                    <>
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="mb-8"
                        >
                            <UserProfile
                                user={{
                                    username: registeredUser.username,
                                    address: registeredUser.userAddress,
                                    profileImage: registeredUser.profileImage,
                                    bio: registeredUser.bio,
                                    coverPhoto: registeredUser.coverPhoto,
                                    interests: registeredUser.interests,
                                    balance: "0",
                                    userStats: userStats,
                                }}
                                onSetProfileImage={setProfileImage}
                                onSetCoverPhoto={setCoverImage}
                                onUpdateProfile={editUserProfile}
                            />
                        </motion.div>

                        <motion.div
                            key="create-post"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                        >
                            <CreatePost
                                content={content}
                                setContent={setContent}
                                createPost={createPost}
                                freePosts={freePosts}
                                fetchPosts={fetchPosts}
                            />
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.4 }}
                            className="mt-8"
                        >
                            <h2 className="text-3xl font-bold text-white mb-6">Latest Posts</h2>
                            <div className="space-y-6">
                                {posts.map((post) => (
                                    <PostCard
                                        key={post.id}
                                        post={post}
                                        onLike={likePost}
                                        onComment={addComment}
                                        isRegistered={!!registeredUser}
                                        signer={walletClient}
                                        getUserByAddress={() => fetchUser()}
                                        loading={isLoading}
                                    />
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </main>

            {registeredUser && <FloatingActionButton onClick={() => setContent("")} />}
        </div>
    );

}
