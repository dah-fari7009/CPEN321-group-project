const userStore = jest.createMockFromModule('../userStore');

const addPresToUser = (userID, presID) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            console.log("mock userStore: addPresToUser: userID = " + userID + ", presID = " + presID);
            if (userID === null) {
                reject("Unspecified user");
            } else if (userID === "Idontexist") {
                reject("User not found");
            } else {
                resolve("Presentation added to user!");
            }
        }, 1000);
    });
}

const userExistsWithID = (userID) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (userID === "Idontexist" || userID === null) {
                reject("User " + userID + " does not exist");
            } else {
                resolve(true);
            }
        }, 1000);
    });
}


const removePresFromUser = (userID, presID) => {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            if (userID === "1" && presID === "900df00d900df00d900df00d") {
                resolve();
            }
        }, 1000);
    });
}

userStore.addPresToUser = addPresToUser;
userStore.userExistsWithID = userExistsWithID;
userStore.removePresFromUser = removePresFromUser;

module.exports = userStore;
