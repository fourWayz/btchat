const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BTChat", function () {
  let BTChat;
  let contract;
  let owner, user1, user2;

  beforeEach(async function () {
    [owner, user1, user2] = await ethers.getSigners();

    const BTChatFactory = await ethers.getContractFactory("BTChat");
    contract = await BTChatFactory.deploy();
    await contract.waitForDeployment();
  });

  describe("User Registration", function () {
    it("should register a new user", async function () {
      await contract.connect(user1).registerUser(user1.address, "Alice");
      const user = await contract.getUserByAddress(user1.address);

      expect(user.username).to.equal("Alice");
      expect(user.userAddress).to.equal(user1.address);
      expect(user.isRegistered).to.be.true;
    });

    it("should fail if user is already registered", async function () {
      await contract.connect(user1).registerUser(user1.address, "Alice");
      await expect(
        contract.connect(user1).registerUser(user1.address, "Alice")
      ).to.be.revertedWith("User is already registered");
    });
  });

  describe("Post Creation", function () {
    beforeEach(async function () {
      await contract.connect(user1).registerUser(user1.address, "Alice");
    });

    it("should allow a user to create a post with content", async function () {
      await contract.connect(user1).createPost("Hello World", "");

      const count = await contract.getPostsCount();
      expect(count).to.equal(1);

      const post = await contract.getPost(0);
      expect(post.content).to.equal("Hello World");
      expect(post.author).to.equal(user1.address);
    });

    it("should fail if post content is empty", async function () {
      await expect(
        contract.connect(user1).createPost("", "")
      ).to.be.revertedWith("Content should not be empty");
    });
  });

  describe("Likes and Comments", function () {
    beforeEach(async function () {
      await contract.connect(user1).registerUser(user1.address, "Alice");
      await contract.connect(user2).registerUser(user2.address, "Bob");
      await contract.connect(user1).createPost("Test Post", "");
    });

    it("should allow a user to like a post", async function () {
      await contract.connect(user2).likePost(0);
      const post = await contract.getPost(0);
      expect(post.likes).to.equal(1);
    });

    it("should prevent liking a post more than once", async function () {
      await contract.connect(user2).likePost(0);
      await expect(contract.connect(user2).likePost(0)).to.be.revertedWith(
        "User has already liked this post"
      );
    });

    it("should allow adding a comment", async function () {
      await contract.connect(user2).addComment(0, "Nice post");
      const comment = await contract.getComment(0, 0);
      expect(comment.content).to.equal("Nice post");
      expect(comment.commenter).to.equal(user2.address);
    });
  });
});
