const users = []

const addUser = ({ id, username, room }) => {

    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    if (!username || !room) {
        return {
            error: 'Username and Field are Required'
        }
    }

    const existingUser = users.find((user) => {
        return user.room === room && user.username === username;
    })

    if (existingUser)
        return {
            error: 'Username already in use'
        }

    // Storing User

    const user = { id, username, room };

    users.push(user);

    return { user };
}

const removeUser = (id) => {

    const index = users.findIndex((user) => { // returns -1 if not found otherwise the index.
        return user.id === id;         // findIndex is better than filter since it stops as soon as the element is found.
    })

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

const getUser = (id) => {
    return users.find(user => {
        return user.id === id;
    })
}

const getRoomUsers = (room) => {

    return users.filter(user => user.room === room)
}

module.exports = {
    addUser,
    getUser,
    getRoomUsers,
    removeUser,
}