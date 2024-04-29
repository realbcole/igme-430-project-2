const toastr = require("toastr");

/* Takes in a message. Sets the notification message up in html, and
   displays it to the user.
*/
const handleNotification = (message, type = "error") => {
    toastr.options = {
        "positionClass": "toast-bottom-right", // Position of toastr notification
        "preventDuplicates": true, // Prevent duplicate notifications
    };

    if (type === 'success') {
        toastr.success(message);
        return;
    } else if (type === 'error') {
        toastr.error(message);
        return;
    }
};

/* Sends post requests to the server using fetch. Will look for various
   entries in the response JSON object, and will handle them appropriately.
*/
const sendPost = async (url, data, handler) => {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    const result = await response.json();

    if (result.redirect) {
        window.location = result.redirect;
    }

    if (result.error) {
        handleNotification(result.error);
    }

    if (handler) {
        handler(result);
    }
};

/* Sends put requests to the server using fetch. Will look for various entries
    in the response JSON object, and will handle them appropriately.
*/
const sendPut = async (url, data, handler) => {
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (handler) {
        handler(response);
    }
};

/* Sends delete requests to the server using fetch. Will look for various entries
    in the response JSON object, and will handle them appropriately.
*/
const sendDelete = async (url, data, handler) => {
    const response = await fetch(url, {
        method: 'DELETE',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });

    if (handler) {
        handler(response);
    }
};

module.exports = {
    handleNotification,
    sendPost,
    sendPut,
    sendDelete,
};
