const users = []

// addUser, removeUser, getUser, getUsersInRoom

const addUser = ({ id, username, room }) => {
    // Clean the data
    username = username.trim().toLowerCase()
    room = room.trim().toLowerCase()

    // Validate the data
    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    })

    // Validate username
    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    // Store user
    const user = { id, username, room }
    users.push(user)
    return { user }
}

const removeUser = (id) => {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

addUser({
    id: 22,
    username: 'Andrew  ',
    room: '  South Philly'
})

addUser({
    id: 42,
    username: 'Mike  ',
    room: '  South Philly'
})

addUser({
    id: 32,
    username: 'Andrew  ',
    room: 'Center city'
})

const getUser = (id) =>{
   return users.find((user)=> user.id === id)   
}

const getUsersInRoom = (room) => {
    room = room.trim().toLowerCase()
    return users.filter((user) => user.room === room)
}

// console.log(users)

// const removedUser = removeUser(22)
// const user = getUser(32)
// console.log(removedUser)
// console.log(users)
// console.log("Getuser",user)
// console.log(getUsersInRoom('south philly'))

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
}