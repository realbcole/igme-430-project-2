const helper = require('./helper');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');


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

const formatPost = (post, currentUser) => {
    const date = new Date(post.createdDate);
    const formattedDate = new Intl.DateTimeFormat('en-US', {
        dateStyle: 'long',
        timeStyle: 'short'
    }).format(date);
    post.formattedDate = formattedDate;

    const userHasLiked = post.likes.includes(currentUser._id);
    post.userHasLiked = userHasLiked;

    return post;
};

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

const PostList = props => {
    const [posts, setPosts] = useState(props.posts);
    const [refreshPosts, setRefreshPosts] = useState(false);
    const [currentUser, setCurrentUser] = useState(null);

    useEffect(() => {
        const loadPostsFromServer = async () => {
            const response = await fetch('/getPosts');
            const data = await response.json();
            console.log(data);
            setCurrentUser(data.user);
            setPosts(data.posts);
        };
        loadPostsFromServer();
    }, [props.reloadPosts, refreshPosts]);

    if (posts.length === 0) {
        return (
            <div className="postList">
                <h3 className="emptyPost">No Posts Yet!</h3>
            </div>
        );
    }

    const postNodes = posts.map(post => {
        const formattedPost = formatPost(post, currentUser);

        return <Post post={formattedPost} currentUser={currentUser} setRefreshPosts={setRefreshPosts} refreshPosts={refreshPosts} />
    });

    return (
        <div className="postList">
            {postNodes}
        </div>
    );
};

const Post = props => {
    const { post, currentUser, setRefreshPosts, refreshPosts } = props;

    const likePost = async (postId) => {
        try {
            await helper.sendPost('/likePost', { postId });
            setRefreshPosts(!refreshPosts);
        } catch (err) {
            console.error(err);
        }
    };

    const deletePost = async (id) => {
        await helper.sendDelete('/deletePost', { id }, (res) => {
            if (res.status === 204) {
                helper.handleNotification('Post deleted!', 'success');
                setRefreshPosts(!refreshPosts);
            }
        });
    };

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

const Profile = props => {
    const [posts, setPosts] = useState(props.posts);
    const [currentUser, setCurrentUser] = useState(null);
    const [refreshPosts, setRefreshPosts] = useState(false);

    useEffect(() => {
        const loadPostsFromServer = async () => {
            const response = await fetch('/getUserPosts');
            const data = await response.json();
            setCurrentUser(data.user);
            setPosts(data.posts);
        };
        loadPostsFromServer();
    }, [refreshPosts]);

    if (posts.length === 0) {
        return (
            <div className="postList">
                <h3 className="emptyPost">No Posts Yet!</h3>
            </div>
        );
    }

    const postNodes = posts.map(post => {
        const formattedPost = formatPost(post, currentUser);

        return <Post post={formattedPost} currentUser={currentUser} setRefreshPosts={setRefreshPosts} refreshPosts={refreshPosts} />
    });

    return (
        <div>
            <h1>{currentUser.username}'s Profile</h1>
            <div className="postList">
                {postNodes}
            </div>
        </div>
    );
};

const Sidebar = props => {
    const handleClick = (e) => {
        e.preventDefault();
        props.setCurrentPage(e.target.textContent.toLowerCase());
    };

    return (
        <div className="sidebar">
            <a onClick={handleClick}>Home</a>
            <a onClick={handleClick}>Profile</a>
            <a href="/logout">Logout</a>
        </div>
    );
}

const App = () => {
    const [reloadPosts, setReloadPosts] = useState(false);
    const [currentPage, setCurrentPage] = useState('home');

    return (
        <div>
            <Sidebar setCurrentPage={setCurrentPage} />
            <div className="main-area">
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
                    <Profile posts={[]} />
                }

            </div>
        </div>
    );
};

const init = () => {
    const root = createRoot(document.getElementById('app'));
    root.render(<App />);
};

window.onload = init;
