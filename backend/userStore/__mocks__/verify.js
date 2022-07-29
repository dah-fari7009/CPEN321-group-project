async function verify(token) {
    await timeout(100);
    if (token === "good token") {
        return true;
    } else {
        return false
    }
}

function timeout(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

module.exports = {
    verify
}