const helper = require('./helper');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');

// Submit a post to the server
const handlePost = (e, onPostAdded) => {
    e.preventDefault();

    const content = e.target.querySelector('#postContent').value;

    if (!content) {
        helper.handleNotification('Content is required!');
        return false;
    }

    helper.sendPost(e.target.action, { content }, onPostAdded);
    return false;
};

// Format a post for display
const formatPost = (post, currentUser) => {
    // Format the date
    if (post.createdDate) {
        const date = new Date(post.createdDate);
        const formattedDate = new Intl.DateTimeFormat('en-US', {
            dateStyle: 'long',
            timeStyle: 'short'
        }).format(date);
        post.formattedDate = formattedDate;
    } else post.formattedDate = 'Sponsored';

    // Check if the current user has liked the post
    const userHasLiked = post.likes.includes(currentUser._id);
    post.userHasLiked = userHasLiked;

    return post;
};

// Form for submitting a post
const PostForm = props => {
    return (
        <form id="postForm"
            onSubmit={(e) => handlePost(e, props.triggerReload)}
            name="postForm"
            action="/post"
            method="POST"
            className="postForm"
        >
            <input className="postInput" id="postContent" type="text" name="content" placeholder="Post Content" />
            <input className="makePostSubmit" type="submit" value="Make Post" />
        </form>
    );
};

// List of posts
const PostList = props => {
    const [posts, setPosts] = useState(props.posts);
    const [refreshPosts, setRefreshPosts] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    // Load posts from the server
    useEffect(() => {
        const loadPostsFromServer = async () => {
            const response = await fetch('/getPosts');
            const data = await response.json();
            setCurrentUser(data.user);

            // Insert a sponsored post every 3 posts
            const postsWithAds = [];
            data.posts.forEach((post, index) => {
                postsWithAds.push(post);

                if ((index + 1) % 3 === 0) {
                    postsWithAds.push({
                        content: 'This is a sponsored post',
                        owner: { username: 'Advertiser' },
                        likes: [],
                        createdDate: null,
                    });
                }
            });
            setPosts(postsWithAds);
        };
        loadPostsFromServer();
    }, [props.reloadPosts, refreshPosts]); // Reload posts when the reloadPosts or refreshPosts state changes

    // If there are no posts, display a message
    if (posts.length === 0) {
        return (
            <div className="postList">
                <h3 className="emptyPost">No Posts Yet!</h3>
            </div>
        );
    }

    // Display the posts
    const postNodes = posts.map(post => {
        const formattedPost = formatPost(post, currentUser);

        return <Post post={formattedPost} currentUser={currentUser} setRefreshPosts={setRefreshPosts} refreshPosts={refreshPosts} />
    });

    // Return the list of posts
    return (
        <div className="postList">
            {postNodes}
        </div>
    );
};

// Display an individual post
const Post = props => {
    const { post, currentUser, setRefreshPosts, refreshPosts } = props;

    // Like a post
    const likePost = async (postId) => {
        try {
            await helper.sendPost('/likePost', { postId });
            setRefreshPosts(!refreshPosts);
        } catch (err) {
            console.error(err);
        }
    };

    // Delete a post
    const deletePost = async (id) => {
        await helper.sendDelete('/deletePost', { id }, (res) => {
            if (res.status === 204) {
                helper.handleNotification('Post deleted!', 'success');
                setRefreshPosts(!refreshPosts);
            }
        });
    };

    // Display the post
    return (
        <div key={post.id} className="post">
            <div className="top-row">
                <span className="postName">{post.owner.username}</span>
                <span className="postDate">{post.formattedDate}</span>
                {post.owner._id === currentUser._id ?
                    <button className="deletePost" onClick={() => deletePost(post._id)}>
                        <i id="outline" class="fa-regular fa-trash-can"></i>
                        <i id="solid" class="fa-solid fa-trash-can"></i>
                    </button> : null
                }
            </div>

            <span className="postContent">{post.content}</span>

            <div className="bottom-row">
                <button className="likePost" onClick={() => likePost(post._id)}>
                    {/* Display appropriate like icon depending on if user has liked */}
                    {post.userHasLiked ? (
                        <i class="fa-solid fa-heart"></i>
                    ) : (
                        <>
                            <i id="outline" class="fa-regular fa-heart"></i>
                            <i id="solid" class="fa-solid fa-heart"></i>
                        </>
                    )}
                </button>
                <span className="postLikes">{post.likes.length}</span>
            </div>
        </div>
    );
}

// Profile page
const Profile = props => {
    const [posts, setPosts] = useState(props.posts);
    const [currentUser, setCurrentUser] = useState(null);
    const [refreshPosts, setRefreshPosts] = useState(false);

    // Load posts from the server
    useEffect(() => {
        const loadPostsFromServer = async () => {
            const response = await fetch('/getUserPosts');
            const data = await response.json();
            setCurrentUser(data.user);
            setPosts(data.posts);
        };
        loadPostsFromServer();
    }, [refreshPosts]);

    // If there are no posts, display a message
    if (posts.length === 0) {
        return (
            <div className="postList">
                <h3 className="emptyPost">No Posts Yet!</h3>
            </div>
        );
    }

    // Display the posts
    const postNodes = posts.map(post => {
        const formattedPost = formatPost(post, currentUser);

        return <Post post={formattedPost} currentUser={currentUser} setRefreshPosts={setRefreshPosts} refreshPosts={refreshPosts} />
    });

    // Return the list of posts with the user's profile
    return (
        <div className="profile">
            <h1>{currentUser.username}'s Profile</h1>
            <div className="postList">
                {postNodes}
            </div>
        </div>
    );
};

// Settings page
const Settings = props => {
    // Change the user's password
    const handleChangePassword = (e) => {
        e.preventDefault();

        const oldPass = e.target.querySelector('input[name=oldPass]').value;
        const newPass = e.target.querySelector('input[name=newPass]').value;
        const newPass2 = e.target.querySelector('input[name=newPass2]').value;

        // Form validation
        if (!oldPass || !newPass || !newPass2) {
            helper.handleNotification('All fields are required!');
            return false;
        }

        // Check if new passwords match
        if (newPass !== newPass2) {
            helper.handleNotification('New passwords do not match!');
            return false;
        }

        // Send the request to the server
        helper.sendPut(e.target.action, { oldPass, newPass }, (res) => {
            if (res.status === 204) {
                helper.handleNotification('Password changed!', 'success');
            } else if (res.status === 400) {
                helper.handleNotification('An error occurred!');
            }
        });
        return false;
    };

    return (
        <div className="settings">
            <h1>Settings</h1>
            <h2>Change password</h2>
            <form id="changePasswordForm" className="changePasswordForm" action="/changePassword" method="POST" onSubmit={handleChangePassword}>
                <input type="password" name="oldPass" placeholder="Old Password" />
                <input type="password" name="newPass" placeholder="New Password" />
                <input type="password" name="newPass2" placeholder="Retype New Password" />
                <input type="submit" value="Change Password" />
            </form>
        </div>
    );
};

// Sidebar
const Sidebar = props => {
    // Handle clicking on a link
    const handleClick = (e) => {
        e.preventDefault();
        props.setCurrentPage(e.target.textContent.toLowerCase());
    };

    // Display the sidebar
    return (
        <div className="sidebar">
            <a onClick={handleClick}>Home</a>
            <a onClick={handleClick}>Profile</a>
            <a onClick={handleClick}>Settings</a>
            <a href="/logout">Logout</a>
        </div>
    );
}

// Main app
const App = () => {
    const [reloadPosts, setReloadPosts] = useState(false);
    const [currentPage, setCurrentPage] = useState('home');

    // Display the app
    return (
        <div>
            <Sidebar setCurrentPage={setCurrentPage} />
            <div className="main-area">
                {/* Display the appropriate page depending on sidebar */}
                {currentPage === 'home' ?
                    <>
                        <div id="makePost">
                            <PostForm triggerReload={() => setReloadPosts(!reloadPosts)} />
                        </div>
                        <div id="posts">
                            <PostList posts={[]} reloadPosts={reloadPosts} />
                        </div>
                    </>
                    :
                    currentPage === 'profile' ?
                        <Profile posts={[]} />
                        :
                        <Settings />
                }
            </div>
        </div>
    );
};

// Initialize the app
const init = () => {
    const root = createRoot(document.getElementById('app'));
    root.render(<App />);
};

window.onload = init;
