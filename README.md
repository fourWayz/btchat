# 🗨️ BTChat — Decentralized Social Platform on Citrea

BTChat is a decentralized social media dApp built on the **Citrea chain**, allowing users to create posts, comment, like, and interact — all backed by smart contracts for full transparency and immutability. It includes profile customization, image uploads, and user stats.

---

## 🚀 Features

- ✅ **Smart Contract Powered Social Feed** — Posts, comments, and likes are stored on-chain.
- 👤 **User Profiles** — Set usernames, bios, profile images, cover photos, and interests.
- 🖼️ **Post & Comment Images** — Share visual content with posts and replies.
- ❤️ **Likes & Replies** — Interact with content using likes and threaded replies.
- 📊 **User Stats** — Track total posts, likes, and comments.
- 🔒 **Wallet-Based Identity** — Connect wallet to register and interact.
- 🌈 **Modern UI** — Built with Tailwind CSS, Framer Motion animations, and RainbowKit for wallet integration.

---

## 🛠️ Tech Stack

| Layer       | Tech Stack                                    |
|-------------|-----------------------------------------------|
| Frontend    | React, Next.js, TypeScript, Tailwind CSS      |
| Animation   | Framer Motion                                 |
| Auth & Wallet | RainbowKit + Wagmi (Citrea EVM chain)        |
| Smart Contract | Solidity + Hardhat                         |
| On-Chain Access | Wagmi + Viem + ethers v6                  |
| Image Upload | Local previews (optional IPFS in future)     |

---

## 📁 Folder Structure

```

/app
├── components/
│   ├── PostCard.tsx
│   ├── CommentSection.tsx
│   ├── RegisterForm.tsx
│   ├── CreatePost.tsx
│   └── UserProfile.tsx
├── config/
│   └── BTChat.json          # ABI
├── utils/
│   └── constants.ts         # Contract address, chain ID
└── page.tsx / layout.tsx

````

---

## 📦 Installation

### 1. Clone the Repository
```bash
git clone https://github.com/fourWayz/btchat.git
cd btchat
````

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

> You can also hardcode this in your `constants.ts` or config if preferred.

---

## 🔨 Running Locally

```bash
npm run dev
# or
yarn dev
```

Open `http://localhost:3000` to view the app.

---

## 🧠 Smart Contract Overview

The `BTChat` smart contract includes:

* `registerUser(username, profileImage)`
* `createPost(content, image)`
* `addComment(postId, content, image)`
* `likePost(postId)`
* `getPostsCount()`, `getPost(index)`
* `getComment(postId, commentIndex)`
* `getUserStats(address)` — returns post, like, comment counts
* `getUserByAddress(address)` — returns profile data

Deployed on **Citrea testnet**.

---

## 💡 Usage

* Connect your wallet
* Register your profile (username + profile image)
* Create posts with or without images
* View all posts in the feed
* Like and comment (with optional images)
* See your public profile and stats

---

## 🔒 Security Notes

* All user interactions (posts, comments, likes) are on-chain.
* No private data is stored off-chain.
* Make sure to connect to Citrea-compatible wallet (e.g., Metamask with Citrea config).

---


## 🧩 Future Roadmap

* [ ] Profile NFTs
* [ ] IPFS integration for image storage
* [ ] Mention/tag other users
* [ ] Notifications for replies/likes
* [ ] DAO or moderation tools
* [ ] ZK-based anonymous posting

---

## 🤝 Contributing

Pull requests welcome! If you'd like to contribute:
