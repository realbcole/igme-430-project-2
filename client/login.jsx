const helper = require('./helper.js');
const React = require('react');
const { createRoot } = require('react-dom/client');

const handleLogin = e => {
    e.preventDefault();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;

    if (!username || !pass) {
        helper.handleNotification('Username or password is empty!');
        return false;
    }

    helper.sendPost(e.target.action, { username, pass });
    return false;
};

const handleSignup = e => {
    e.preventDefault();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;
    const pass2 = e.target.querySelector('#pass2').value;

    if (!username || !pass || !pass2) {
        helper.handleNotification('All fields are required!');
        return false;
    }

    if (pass !== pass2) {
        helper.handleNotification('Passwords do not match!');
        return false;
    }

    helper.sendPost(e.target.action, { username, pass, pass2 });
    return false;
};

const showSignup = e => {
    e.preventDefault();

    const content = document.getElementById('content');
    const root = createRoot(content);

    root.render(<SignupWindow />);
}

const showLogin = e => {
    e.preventDefault();

    const content = document.getElementById('content');
    const root = createRoot(content);

    root.render(<LoginWindow />);
}

const LoginWindow = props => {
    return (
        <div className="box">
            <h1>Login</h1>
            <form id="loginForm" name="loginForm" onSubmit={handleLogin} action="/login" method="POST" className="mainForm">
                <input id="user" type="text" name="username" placeholder="username" />
                <input id="pass" type="password" name="pass" placeholder="password" />
                <input className="formSubmit" type="submit" value="Sign in" />
                <span>Don't have an account? <button onClick={showSignup}>Sign up</button></span>
            </form>
        </div>
    );
};

const SignupWindow = props => {
    return (
        <div className="box">
            <h1>Sign up</h1>
            <form id="signupForm"
                name="signupForm"
                onSubmit={handleSignup}
                action="/signup"
                method="POST"
                className="mainForm"
            >
                <input id="user" type="text" name="username" placeholder="username" />
                <input id="pass" type="password" name="pass" placeholder="password" />
                <input id="pass2" type="password" name="pass2" placeholder="retype password" />
                <input className="formSubmit" type="submit" value="Sign Up" />
                <span>Already have an account? <button onClick={showLogin}>Log in</button></span>
            </form>
        </div>
    );
};

const init = () => {
    const root = createRoot(document.getElementById('content'));

    root.render(<LoginWindow />);
};

window.onload = init;