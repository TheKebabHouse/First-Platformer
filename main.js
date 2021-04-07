const gameDimensions = {
    width: 1500,
    height: 750,
}
var character = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 1,
    width: 64,
    height: 64,
    platform: null,
    costumex: 0,
    costumey: 192,

};
var platforms = [
    {
        x: 100,
        y: 700,
        width: 100,
        height: 10,
        colour: "blue",
        
    }, {
        x: 1250,
        y: 700,
        width: 300,
        height: 10,
        colour: "green",
    }, {
        x: 500,
        y: 700,
        width: 100,
        height: 20,
        colour: "aqua",
        
    },{
        x: 500,
        y: 500,
        width: 150,
        height: 40,
        colour: "yellow",
    },{
        x: 500,
        y: 350,
        width: 200,
        height: 20,
        colour: "blue",
    },{
        x:700,
        y: 250,
        width: 400,
        height: 10,
        colour: "green",
    },{
        x: 0,
        y: gameDimensions.height - 100,
        width: 3000,
        height: 100,
        colour: "black",
    }
];
const gravitySpeed = 0.3;
let tickLength = 10;
const backgroundSlowness = 2;
const pressedKeys= {
    up: false,
    down: false,
    left: false,
    right: false,
};


function game() {

    var canvas = document.getElementById("canvas");
    var ctx = canvas.getContext("2d");
    //Draw blue background
    ctx.fillStyle = "#009dc4";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //Draw seamless parallax background
    var background = document.querySelector("#background");
    var screenNum = parseInt(character.x / (gameDimensions.width * backgroundSlowness));
    var backgroundX = parseInt((-character.x / backgroundSlowness) + (screenNum * gameDimensions.width));
    ctx.drawImage(background, backgroundX, -character.y + gameDimensions.height*1.5 -  canvas.height, canvas.width, canvas.height);
    ctx.drawImage(background, backgroundX + gameDimensions.width, -character.y + gameDimensions.height*1.5 -  canvas.height, canvas.width, canvas.height);
    ctx.drawImage(background, backgroundX - gameDimensions.width, -character.y + gameDimensions.height*1.5 -  canvas.height, canvas.width, canvas.height);
    
    var costume = document.querySelector("#character");
    character.costumex = (Math.floor (Math.abs(character.x)/20 ) % 9)*64
    ctx.drawImage(costume, character.costumex, character.costumey, character.width, character.height - 4, canvas.width/2, canvas.height/2, character.width, character.height);
     
    ctx.fillStyle = "black";
    ctx.fillRect(0, -character.y + gameDimensions.height*1.5, canvas.width, 750);

    for (var i = 0; i < platforms.length; ++i) {
        ctx.fillStyle = platforms[i].colour;
        ctx.fillRect((platforms[i].x - character.x) + gameDimensions.width/2, (platforms[i].y - character.y) + gameDimensions.height/2, platforms[i].width, platforms[i].height);
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

    document.onkeydown = handleOnkeyDown;
    document.onkeyup = handleOnkeyUp;
    if (pressedKeys.right) {
        character.vx = 5;
        character.costumey = 194;
    }
    
    if (pressedKeys.left) {
        character.vx = -5;
        character.costumey = 66;
    }
    
    if (pressedKeys.up && character.vy == 0) {
        character.vy = -10;
    }
    
    //Put character data on the screen
    //document.querySelector("pre").innerHTML = JSON.stringify(character, null, 2);

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