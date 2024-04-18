const helper = require('./helper');
const React = require('react');
const { useState, useEffect } = React;
const { createRoot } = require('react-dom/client');


const handlePost = (e, onPostAdded) => {
    e.preventDefault();

    const content = e.target.querySelector('#postContent').value;

    if (!content) {
        helper.handleError('Content is required!');
        return false;
    }

    helper.sendPost(e.target.action, { content }, onPostAdded);
    return false;
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
            <input id="postContent" type="text" name="content" placeholder="Post Content" />
            <input className="makePostSubmit" type="submit" value="Make Post" />
        </form>
    );
};

const PostList = props => {
    const [posts, setPosts] = useState(props.posts);
    const [postDeleted, setPostDeleted] = useState(false);

    useEffect(() => {
        const loadPostsFromServer = async () => {
            const response = await fetch('/getPosts');
            const data = await response.json();
            console.log(data.posts);
            setPosts(data.posts);
        };
        loadPostsFromServer();
    }, [props.reloadPosts, postDeleted]);

    const deletePost = async (id) => {
        const response = await fetch('/deletePost', {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id }),
        });

        if (response.status === 204) {
            helper.handleError('Post deleted!');
            setPostDeleted(!postDeleted);
        }
    };

    if (posts.length === 0) {
        return (
            <div className="postList">
                <h3 className="emptyPost">No Posts Yet!</h3>
            </div>
        );
    }

    const postNodes = posts.map(post => {
        return (
            <div key={post.id} className="post">
                <h3 className="postName">Posted By {post.owner.username}</h3>
                <h3 className="postContent">{post.content}</h3>
                {/* Only show delete button on profile page */}
                {/* <button className="deletePost" onClick={() => deletePost(post._id)}>Delete</button> */}
            </div>
        );
    });

    return (
        <div className="postList">
            {postNodes}
        </div>
    );
};

const Sidebar = () => {
    return (
        <div className="sidebar">
            <a href="/home">Home</a>
            <a>Profile</a>
            <a href="/logout">Logout</a>
        </div>
    );
}

const App = () => {
    const [reloadPosts, setReloadPosts] = useState(false);

    return (
        <div>
            <Sidebar />
            <div className="main-area">
                <div id="makePost">
                    <PostForm triggerReload={() => setReloadPosts(!reloadPosts)} />
                </div>
                <div id="posts">
                    <PostList posts={[]} reloadPosts={reloadPosts} />
                </div>
            </div>
        </div>
    );
};

const init = () => {
    const root = createRoot(document.getElementById('app'));
    root.render(<App />);
};

window.onload = init;
