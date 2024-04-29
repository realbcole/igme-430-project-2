const helper = require('./helper.js');
const React = require('react');
const { createRoot } = require('react-dom/client');

// Handle sending login data
const handleLogin = e => {
    e.preventDefault();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;

    // Form validation
    if (!username || !pass) {
        helper.handleNotification('Username or password is empty!');
        return false;
    }

    helper.sendPost(e.target.action, { username, pass });
    return false;
};

// Handle sending signup data
const handleSignup = e => {
    e.preventDefault();

    const username = e.target.querySelector('#user').value;
    const pass = e.target.querySelector('#pass').value;
    const pass2 = e.target.querySelector('#pass2').value;

    // Form validation
    if (!username || !pass || !pass2) {
        helper.handleNotification('All fields are required!');
        return false;
    }

    // Check if passwords match
    if (pass !== pass2) {
        helper.handleNotification('Passwords do not match!');
        return false;
    }

    helper.sendPost(e.target.action, { username, pass, pass2 });
    return false;
};

// Show the signup window
const showSignup = e => {
    e.preventDefault();

    const content = document.getElementById('content');
    const root = createRoot(content);

    root.render(<SignupWindow />);
}

// Show the login window
const showLogin = e => {
    e.preventDefault();

    const content = document.getElementById('content');
    const root = createRoot(content);

    root.render(<LoginWindow />);
}

// Login window component
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

// Signup window component
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

// Initialize the login window
const init = () => {
    const root = createRoot(document.getElementById('content'));
    root.render(<LoginWindow />);
};

window.onload = init;