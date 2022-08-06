async function getToken(authCode) {
    await timeout(100);
    if (authCode === "good auth") {
        return "test token " + authCode;
    } else {
        return null;
    }
}    

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = getToken;