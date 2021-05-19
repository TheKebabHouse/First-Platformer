"use strict";
const config = {
    width: 1500,
    height: 750,
    gravitySpeed: 0.3,
    tickLength: 10,
    backgroundSlowness: 2,
};
let images = {};
var character = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 1,
    width: 64,
    height: 64,
    platformId: null,
    costumex: 0,
    costumey: 192,
    facingLeft: false,
    isFalling() { return character.vy > 0; },
};
const startingPlatforms = [
    {
        x: 100,
        y: -700,
        width: 100,
        height: 10,
        shrinkSpeed: 0,
        colour: "blue",
    }, {
        x: 1250,
        y: -700,
        width: 300,
        height: 10,
        shrinkSpeed: 0,
        colour: "green",
    }, {
        x: 500,
        y: -700,
        width: 100,
        height: 20,
        shrinkSpeed: 1,
        colour: "aqua",
    }, {
        x: 0,
        y: -300,
        width: 150,
        height: 40,
        shrinkSpeed: 0,
        colour: "yellow",
    }, {
        x: 500,
        y: -350,
        width: 200,
        height: 20,
        shrinkSpeed: 0,
        colour: "blue",
    }, {
        x: 700,
        y: -250,
        width: 400,
        height: 10,
        shrinkSpeed: 1,
        colour: "green",
    }, {
        x: 0,
        y: -100,
        width: 3000,
        height: 100,
        shrinkSpeed: 0,
        colour: "aqua",
    }
];
var platforms = [];
const pressedKeys = {
    up: false,
    down: false,
    left: false,
    right: false,
};
let nextPlatformId = 0;
function pageLoad() {
    /*for (let i = 0; i < 1000; ++i) {
        //Create random platforms
        addPlatform(Math.random() * i * 5, (i / 1) * i * -Math.random());
        //Create staircase
        //addPlatform(Math.sin(i / 10) * 500, -i * 20 + (Math.random() * 30));
        //Create circle
        //addPlatform(Math.sin(i / 10) * 1000, Math.cos(i / 10) * 1000 - 1000);
    }*/
    images.background = document.querySelector("#background");
    images.foreground = document.querySelector("#foreground");
    images.bushes = document.querySelector("#bushes");
    startingPlatforms.forEach(addPlatform);
    setInterval(addRandomPlatform, 500);
    game();
}
function resetCharacter() {
    character.x = 0;
    character.y = -300;
    character.vy = 0;
}
function randomizeColor() {
    return `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 1)`;
}
function randInt(a, b) {
    return Math.floor(Math.random() * (b - a) + a);
}
function addPlatform(base) {
    platforms.push({
        ...base,
        id: nextPlatformId++,
    });
}
function addRandomPlatform() {
    const width = randInt(80, 340);
    addPlatform({
        x: character.x + randInt(-100, 100),
        y: (character.y - 10) + randInt(40, 120),
        width,
        height: randInt(10, 20),
        shrinkSpeed: width / (20 * config.tickLength),
        colour: randomizeColor(),
    });
}
function game() {
    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    //Draw blue background
    ctx.fillStyle = "#009dc4";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    //Draw seamless parallax background
    function drawBackground(image, x) {
        ctx.drawImage(image, x, -character.y - config.height / 2, canvas.width, canvas.height);
    }
    function drawLayer(image, slowness) {
        var screenNum = Math.floor(character.x / (config.width * slowness));
        var backgroundX = Math.floor((-character.x / slowness) + (screenNum * config.width));
        drawBackground(image, backgroundX);
        drawBackground(image, backgroundX + config.width);
        drawBackground(image, backgroundX - config.width);
    }
    drawLayer(images.background, 3);
    drawLayer(images.foreground, 2);
    drawLayer(images.bushes, 1);
    var costume = document.querySelector("#character");
    const costumeNum = character.vy != 0 && character.vx != 0
        ? 1
        : Math.abs((character.facingLeft ? 8 : 0) - (Math.floor(character.x / 20) % 9));
    character.costumex = costumeNum * 64;
    ctx.drawImage(costume, character.costumex, character.facingLeft ? 66 : 194, character.width, character.height - 4, canvas.width / 2, canvas.height / 2, character.width, character.height);
    ctx.fillStyle = "black";
    ctx.fillRect(0, -character.y + config.height / 2, canvas.width, 750);
    for (var i = 0; i < platforms.length; ++i) {
        ctx.fillStyle = platforms[i].colour;
        ctx.fillRect((platforms[i].x - character.x) + config.width / 2, (platforms[i].y - character.y) + config.height / 2, platforms[i].width, platforms[i].height);
    }
    character.y += character.vy;
    if (character.vy < 10) {
        character.vy += config.gravitySpeed;
    }
    if (character.y > 0) {
        resetCharacter();
    }
    if (character.vx != 0) {
        character.vx -= character.vx > 0 ? 0.5 : -0.5;
    }
    character.x += character.vx;
    if (character.y + character.height >= canvas.height) {
        character.vy = 0;
        character.y = canvas.height - character.height;
    }
    //Shrink and sink platforms if below the character
    for (var i = 0; i < platforms.length; ++i) {
        if (platforms[i].y > character.y + character.height - 1) {
            platforms[i].width -= platforms[i].shrinkSpeed;
            platforms[i].x += platforms[i].shrinkSpeed / 2;
            //Remove platform if too thin
            if (platforms[i].width < character.width / 2) {
                platforms.splice(i--, 1);
                continue;
            }
        }
    }
    //Is character falling onto a platform?
    if (character.vy > 0) {
        for (var i = 0; i < platforms.length; ++i) {
            if (isCharacterOnPlatform(character, platforms[i])) {
                character.platformId = platforms[i].id;
                character.vy = 0;
                character.y = platforms[i].y - character.height;
                break;
            }
        }
    }
    //Check if the character is still on their platform
    if (character.platformId != null) {
        const charPlatform = platforms.find(platform => platform.id == character.platformId);
        if (!charPlatform || !isCharacterOnPlatform(character, charPlatform)) {
            character.platformId = null;
            //Make sure character drops when walking off a platform
            if (character.vy == 0) {
                character.vy = config.gravitySpeed;
            }
        }
    }
    document.onkeydown = handleOnkeyDown;
    document.onkeyup = handleOnkeyUp;
    if (pressedKeys.right) {
        character.vx = 5;
        character.facingLeft = false;
    }
    if (pressedKeys.left) {
        character.vx = -5;
        character.facingLeft = true;
    }
    if (pressedKeys.up && character.vy == 0) {
        character.vy = -10;
    }
    //Put character data on the screen
    ctx.fillStyle = "black";
    //JSON.stringify(character, null, 2);
    setTimeout(game, config.tickLength);
}
isCharacterOnPlatform("blah blah", 123);
function isCharacterOnPlatform(char, platform) {
    if (char.y + char.height >= platform.y) {
        if (char.y + char.height <= platform.y + platform.height) {
            if (char.x + char.width / 2 > platform.x) {
                if (char.x + char.width / 2 < platform.x + platform.width) {
                    return true;
                }
            }
        }
    }
    return false;
}
function handleOnkeyDown(e) {
    switch (e.keyCode) {
        case 37: // Key left
            pressedKeys.left = true;
            break;
        case 38: // Key up
            pressedKeys.up = true;
            break;
        case 40: // Key down
            pressedKeys.down = true;
            break;
        case 39: // Key right
            pressedKeys.right = true;
            break;
    }
}
function handleOnkeyUp(e) {
    switch (e.keyCode) {
        case 37: // Key left
            pressedKeys.left = false;
            break;
        case 38: // Key up
            pressedKeys.up = false;
            break;
        case 40: // Key down
            pressedKeys.down = false;
            break;
        case 39: // Key right
            pressedKeys.right = false;
            break;
    }
}
