// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BTChat is ReentrancyGuard, Ownable {
    struct User {
        string username;
        address userAddress;
        address sender;
        bool isRegistered;
        string profileImage;
        string bio;
        string coverPhoto;
        string[] interests;
    }

    struct Post {
        address author;
        string content;
        string image;
        uint256 timestamp;
        uint256 likes;
        uint256 commentsCount;
        uint256 originalPostId;
        mapping(address => bool) likedBy;
    }

    struct Comment {
        address commenter;
        string content;
        uint256 timestamp;
    }

    string[] public interests;
    mapping(address => User) public users;
    mapping(address => address) public walletToCreator;
    mapping(address => uint256) public freePostsRemaining;
    mapping(uint256 => mapping(uint256 => Comment)) public postComments;
    mapping(uint256 => uint256) public postCommentsCount;
    mapping(address => string[]) public userInterests;

    mapping(address => uint256) public userPostCount;
    mapping(address => uint256) public userLikeCount;
    mapping(address => uint256) public userCommentCount;

    Post[] public posts;

    event UserRegistered(address indexed userAddress, string username);
    event ProfileImageUpdated(address indexed userAddress, string image);
    event PostCreated(address indexed author, string content, string image, uint256 timestamp);
    event PostShared(address indexed sharer, uint256 originalPostId, uint256 newPostId);
    event PostLiked(address indexed liker, uint256 indexed postId);
    event CommentAdded(address indexed commenter, uint256 indexed postId, string content, uint256 timestamp);

    modifier onlyRegisteredUser() {
        require(users[_getUserAddress()].isRegistered, "User is not registered");
        _;
    }

    constructor() Ownable(msg.sender) {
        transferOwnership(msg.sender);
    }

    function registerUser(address creator, string memory _username) external {
        require(!users[creator].isRegistered, "User is already registered");
        require(bytes(_username).length > 0, "Username should not be empty");

        users[creator] = User({
            username: _username,
            userAddress: creator,
            sender: msg.sender,
            isRegistered: true,
            profileImage: "",
            bio: "",
            coverPhoto: "",
            interests: new string[](0)
        });

        walletToCreator[msg.sender] = creator;
        freePostsRemaining[msg.sender] = FREE_POST_ALLOWANCE;

        emit UserRegistered(creator, _username);
    }

    function setProfileImage(string memory _image) external onlyRegisteredUser {
        address user = _getUserAddress();
        users[user].profileImage = _image;
        emit ProfileImageUpdated(user, _image);
    }

    function setBio(string memory _bio) external onlyRegisteredUser {
        address user = _getUserAddress();
        users[user].bio = _bio;
    }

    function setCoverPhoto(string memory _cover) external onlyRegisteredUser {
        address user = _getUserAddress();
        users[user].coverPhoto = _cover;
    }

    function createPost(string memory _content, string memory _image) external onlyRegisteredUser {
        address user = _getUserAddress();

        require(bytes(_content).length > 0, "Content should not be empty");

        if (freePostsRemaining[msg.sender] > 0) {
            freePostsRemaining[msg.sender]--;
        }

        Post storage newPost = posts.push();
        newPost.author = user;
        newPost.content = _content;
        newPost.image = _image;
        newPost.timestamp = block.timestamp;
        newPost.originalPostId = 0;
        userPostCount[user]++;

        emit PostCreated(user, _content, _image, block.timestamp);
    }

    function sharePost(uint256 _postId) external onlyRegisteredUser {
        require(_postId < posts.length, "Original post does not exist");
        address user = _getUserAddress();

        Post storage sharedPost = posts.push();
        sharedPost.author = user;
        sharedPost.content = posts[_postId].content;
        sharedPost.image = posts[_postId].image;
        sharedPost.timestamp = block.timestamp;
        sharedPost.originalPostId = _postId;

        emit PostShared(user, _postId, posts.length - 1);
    }

    function likePost(uint256 _postId) external onlyRegisteredUser nonReentrant {
        require(_postId < posts.length, "Post does not exist");
        address user = _getUserAddress();

        Post storage post = posts[_postId];
        require(!post.likedBy[user], "User has already liked this post");

        post.likes++;
        userLikeCount[user]++;
        post.likedBy[user] = true;

        emit PostLiked(user, _postId);
    }

    function addComment(uint256 _postId, string memory _content) external onlyRegisteredUser nonReentrant {
        require(_postId < posts.length, "Post does not exist");
        require(bytes(_content).length > 0, "Comment should not be empty");
        address user = _getUserAddress();

        uint256 commentId = postCommentsCount[_postId];
        postComments[_postId][commentId] = Comment({
            commenter: user,
            content: _content,
            timestamp: block.timestamp
        });

        postCommentsCount[_postId]++;
        posts[_postId].commentsCount++;
        userCommentCount[user]++;

        emit CommentAdded(user, _postId, _content, block.timestamp);
    }

    function getUserByAddress(address _userAddress) external view returns (User memory) {
        require(users[_userAddress].isRegistered, "User not found");
        return users[_userAddress];
    }

    function getPostsCount() external view returns (uint256) {
        return posts.length;
    }

    function getPost(uint256 _postId)
        external
        view
        returns (
            address author,
            string memory content,
            string memory image,
            uint256 timestamp,
            uint256 likes,
            uint256 commentsCount,
            uint256 originalPostId
        )
    {
        require(_postId < posts.length, "Post does not exist");
        Post storage post = posts[_postId];
        return (
            post.author,
            post.content,
            post.image,
            post.timestamp,
            post.likes,
            post.commentsCount,
            post.originalPostId
        );
    }

    function getComment(uint256 _postId, uint256 _commentId)
        external
        view
        returns (address commenter, string memory content, uint256 timestamp)
    {
        require(_postId < posts.length, "Post does not exist");
        require(_commentId < postCommentsCount[_postId], "Comment does not exist");

        Comment memory comment = postComments[_postId][_commentId];
        return (comment.commenter, comment.content, comment.timestamp);
    }

    function getFreePostsRemaining(address _user) external view returns (uint256) {
        return freePostsRemaining[_user];
    }

    function getUserStats(address user) external view returns (uint256 totalPosts, uint256 totalLikes, uint256 totalComments) {
        return (
            userPostCount[user],
            userLikeCount[user],
            userCommentCount[user]
        );
    }

    function editProfile(
        string memory _newUsername,
        string memory _newProfileImage,
        string memory _newBio,
        string memory _newCoverImage,
        string[] memory _newInterests
    ) external onlyRegisteredUser {
        address creator = walletToCreator[msg.sender];
        require(bytes(_newUsername).length > 0, "Username cannot be empty");

        User storage user = users[creator];
        user.username = _newUsername;
        user.profileImage = _newProfileImage;
        user.bio = _newBio;
        user.coverPhoto = _newCoverImage;
        user.interests = _newInterests;

        emit ProfileImageUpdated(creator, _newProfileImage);
    }

    function setUserInterests(string[] memory _interests) external onlyRegisteredUser {
        address user = _getUserAddress();

        delete userInterests[user];

        for (uint256 i = 0; i < _interests.length; i++) {
            userInterests[user].push(_interests[i]);
        }
    }

    function getUserInterests(address _user) external view returns (string[] memory) {
        return userInterests[_user];
    }

    function _getUserAddress() internal view returns (address) {
        address creator = walletToCreator[msg.sender];
        return creator != address(0) ? creator : msg.sender;
    }

    uint256 constant FREE_POST_ALLOWANCE = 10;
}
