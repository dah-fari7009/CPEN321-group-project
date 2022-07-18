const presManager = require("../../presManager/presManager");

test('tries to get a presentation that doesnt exist', () => {
    return presManager.getPresTitle(1, 2).then((data) => {
        expect(data).toBe([]); 
    });
});