var character = {
    x: 10,
    y: 10,
    vx: 0,
    vy: 1,
    width: 64,
    height: 64,
    platform: null,
};
var platforms = [
    {
        x: 100,
        y: 700,
        width: 100,
        height: 10,
    }, {
        x: 1250,
        y: 700,
        width: 300,
        height: 10,
    }, {
        x: 500,
        y: 700,
        width: 100,
        height: 20,
    }
];
const gravitySpeed = 0.3;
let tickLength = 10;


function game() {



    //comment
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    var costume = document.querySelector("#character");
    ctx.drawImage(costume, 0, 192, character.width, character.height, character.x, character.y, character.width, character.height);

    ctx.fillStyle = "red"

    for (var i = 0; i < platforms.length; ++i) {
        ctx.fillRect(platforms[i].x, platforms[i].y, platforms[i].width, platforms[i].height);
    }

    character.y += character.vy;


    if (character.vy != 0) {

        character.vy += gravitySpeed;

    }

    if (character.vx != 0) {
        character.vx -= character.vx > 0 ? 0.5 : -0.5;
    }
    character.x += character.vx;

    if (character.y + character.height >= canvas.height) {
        character.vy = 0;
        character.y = canvas.height - character.height;
    }

    if (character.vy > 0) {
        for (var i = 0; i < platforms.length; ++i) {
            if (isObjectOnPlatform(character, platforms[i])) {

                character.platform = i;
                character.vy = 0;
                character.y = platforms[i].y - character.height;
                break;
            }

        }
    }

    //Check if the character is still on their platform
    if (character.platform != null) {
        if (!isObjectOnPlatform(character, platforms[character.platform])) {
            character.platform = null;
            if (character.vy == 0) {
                character.vy = gravitySpeed;
            }
        }
    }
    document.onkeydown = moveCharacter;
    setTimeout(game, tickLength);
}


function isObjectOnPlatform(obj, platform) {
    if (obj.y + obj.height >= platform.y) {
        if (obj.y + obj.height <= platform.y + platform.height) {
            if (obj.x + obj.width / 2 > platform.x) {
                if (obj.x + obj.width / 2 < platform.x + platform.width) {

                    return true;
                }
            }
        }
    }

    return false;
}

function moveCharacter(e) {
    switch (e.keyCode) {
        case 37: // Key left
            character.vx = -5;
            break;
        case 38: // Key up
            if (character.vy == 0) {
                character.vy = -10;
            }
            break;
        case 40: // Key down
            break;
        case 39: // Key right
            character.vx = 5;
            break;
    }
}