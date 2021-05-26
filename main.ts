
//To recompile, enter `tsc --watch` into the terminal
//Open the terminal with Ctrl+J

const config = {
    width: 1500,
    height: 750,
    gravitySpeed: 0.3,
    tickLength: 1000 / 60,
    backgroundSlowness: 2,
};

type ImagesContainer = {
    background: HTMLImageElement,
    foreground: HTMLImageElement,
    bushes: HTMLImageElement,
}
let images: ImagesContainer;

var canvas: HTMLCanvasElement;
var ctx: CanvasRenderingContext2D;

type Character = {
    x: number;
    y: number;
    vx: number;
    vy: number;
    width: number;
    height: number;
    isFacingLeft: boolean;
    platformId: number | null;
    maxHealth: 100;
    health: number;
    costumex: number;
    costumey: number;
    isFalling: () => boolean;
};

type PlatformBase = {
    x: number;
    y: number;
    width: number;
    height: number;
    shrinkSpeed: number;
    colour?: string | CanvasGradient;
    isHarmful?: boolean;
};
type Platform = PlatformBase & {
    id: number;
    colour: string | CanvasGradient;
}


var player: Character = {
    x: 0,
    y: 0,
    vx: 0,
    vy: 1,
    width: 64,
    height: 64,
    platformId: null,
    maxHealth: 100,
    health: 100,
    costumex: 0,
    costumey: 192,
    isFacingLeft: false,
    isFalling() { return player.vy > 0 },
};

const startingPlatforms: PlatformBase[] = [
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
    },{
        x: 0,
        y: -300,
        width: 150,
        height: 40,
        shrinkSpeed: 0,
        colour: "yellow",
    },{
        x: 500,
        y: -350,
        width: 200,
        height: 20,
        shrinkSpeed: 0,
        colour: "blue",
    },{
        x:700,
        y: -250,
        width: 400,
        height: 10,
        shrinkSpeed: 1,
        colour: "green",
    },{
        x: 0,
        y: -100,
        width: 3000,
        height: 100,
        shrinkSpeed: 0,
        colour: "aqua",
    }
];

var platforms: Platform[] = [];

const pressedKeys= {
    up: false,
    down: false,
    left: false,
    right: false,
};
let nextPlatformId = 0;
let harmFlashTimeout = 0;
let harmTotal = 0;

function pageLoad() {
    /*for (let i = 0; i < 1000; ++i) {
        //Create random platforms
        addPlatform(Math.random() * i * 5, (i / 1) * i * -Math.random());
        //Create staircase
        //addPlatform(Math.sin(i / 10) * 500, -i * 20 + (Math.random() * 30));
        //Create circle
        //addPlatform(Math.sin(i / 10) * 1000, Math.cos(i / 10) * 1000 - 1000);
    }*/
    images = {
        background: document.querySelector("#background") as HTMLImageElement,
        foreground: document.querySelector("#foreground") as HTMLImageElement,
        bushes: document.querySelector("#bushes") as HTMLImageElement
    };
    canvas = document.getElementById("canvas") as HTMLCanvasElement;
    ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    startingPlatforms.forEach(addPlatform);
    setInterval(addRandomPlatform, 500);
    game();
}

function resetPlayer() {
    player.x = 0;
    player.y = -300;
    player.vy = 0;
    player.health = player.maxHealth;
}

function randomiseColour() {
    return `rgba(${Math.random()*255}, ${Math.random()*255}, ${Math.random()*255}, 1)`;
}

function randInt(a: number, b: number) {
    return Math.floor(Math.random() * (b - a) + a);
}


function addPlatform(base: PlatformBase) {
    platforms.push({
        ...base,
        id: nextPlatformId++,
        colour: base.colour ?? randomiseColour(),
    });
}

function addRandomPlatform() {
    const width = randInt(80, 340);
    const isHarmful = !randInt(0, 2);
   // const harmfulGradient = ctx.createLinearGradient(0, 0, 0, 100);
    //harmfulGradient.addColorStop(0, "red");
    //harmfulGradient.addColorStop(1, "black");
    
    addPlatform({
        x: player.x + randInt(-100, 100),
        y: (player.y - 10) + randInt(40,120),
        width,
        isHarmful,
        height: randInt(10, 20),
        shrinkSpeed: width / (20 * config.tickLength),
        colour: isHarmful ? "#f00" : randomiseColour(),
    });
}


function draw() {
    //Draw blue background
    ctx.fillStyle = "#009dc4";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    //Draw seamless parallax background
    function drawBackground(image: HTMLImageElement, x: number) {
        ctx.drawImage(image, x, -player.y - config.height/2, canvas.width, canvas.height);
    }
    function drawLayer(image: HTMLImageElement, slowness: number) {
        var screenNum = Math.floor(player.x / (config.width * slowness));
        var backgroundX = Math.floor((-player.x / slowness) + (screenNum * config.width));
        drawBackground(image, backgroundX);
        drawBackground(image, backgroundX + config.width);
        drawBackground(image, backgroundX - config.width);
    }
    drawLayer(images.background, 3);
    drawLayer(images.foreground, 2);
    drawLayer(images.bushes, 1);
    
    var costume = document.querySelector("#character") as CanvasImageSource;
    const costumeNum =
        player.vy != 0 && player.vx != 0
            ? 1
            : Math.abs((player.isFacingLeft ? 8 : 0) - (Math.floor(player.x / 20) % 9));
    player.costumex = costumeNum * 64;
    ctx.drawImage(
        costume,
        player.costumex,
        player.isFacingLeft ? 66 : 194,
        player.width,
        player.height - 4,
        config.width/2,
        config.height/2,
        player.width,
        player.height);

    ctx.fillStyle = "black";
    ctx.fillRect(0, -player.y + config.height / 2, canvas.width, 750);

    for (var i = 0; i < platforms.length; ++i) {
        ctx.fillStyle = platforms[i].colour;
        ctx.fillRect((platforms[i].x - player.x) + config.width/2, (platforms[i].y - player.y) + config.height/2, platforms[i].width, platforms[i].height);
    }

    ctx.fillStyle = "white";
    ctx.fillRect(90, 70, 70, 40);
    ctx.fillStyle = "black";
    ctx.font = "30px Arial";
    ctx.fillText(player.health.toFixed(0), 100, 100);

    const showFlash = harmFlashTimeout > 0 || player.health < 20;
    if (showFlash) {
        harmFlashTimeout--;
        ctx.fillStyle = "rgba(255, 0, 0, .2)";
        ctx.fillRect(0, 0, config.width, config.height);
    }

    if (harmFlashTimeout < 0) {
        harmTotal = 0;
    }

    if (harmTotal > 0) {
        ctx.fillStyle = "white";
        ctx.fillText(`-${Math.ceil(harmTotal)}`, config.width/2, config.height/2);
    }
}


function harmPlayer(damage: number) {
    player.health -= damage;
    harmTotal += damage;
    harmFlashTimeout = (1000 * .25) / config.tickLength;
}


function game() {
    draw();

    if (player.health < player.maxHealth) {
        player.health += 0.04;
    }
    if (player.health <= 0) {
        resetPlayer();
    }
    
    player.y += player.vy;

    if (player.vy < 20) {
        player.vy += config.gravitySpeed;
    }

    if (player.y > 0) {
        resetPlayer();
    }

    if (player.vx != 0) {
        player.vx -= player.vx > 0 ? 0.5 : -0.5;
    }
    player.x += player.vx;

    //???
    if (player.y + player.height >= canvas.height) {
        player.vy = 0;
        player.y = canvas.height - player.height;
    }

    //Shrink and sink platforms if below the character
    for (var i = 0; i < platforms.length; ++i) {
        if (platforms[i].y > player.y + player.height - 1) {
            //Shrink platform
            platforms[i].width -= platforms[i].shrinkSpeed;
            platforms[i].x += platforms[i].shrinkSpeed / 2;
            //Remove platform if too thin
            if (platforms[i].width < player.width / 2) {
                platforms.splice(i--, 1);
                continue;
            }
        }
    }

    //Is character falling onto a platform?
    if (player.isFalling()) {
        for (var i = 0; i < platforms.length; ++i) {
            if (isCharacterOnPlatform(player, platforms[i])) {
                player.platformId = platforms[i].id;
                //Fall damage
                if (player.vy > 10) {
                    harmPlayer(player.vy - 10);
                }
                //Damage player if platform is harmful
                if (platforms[i].isHarmful) {
                    harmPlayer((config.tickLength / (1000 * 5)) * player.maxHealth);
                }
                player.vy = 0;
                player.y = platforms[i].y - player.height;
                break;
            }
        }
    }

    //Check if the character is still on their platform
    if (player.platformId != null) {
        const charPlatform = platforms.find(platform => platform.id == player.platformId);
        if (!charPlatform || !isCharacterOnPlatform(player, charPlatform)) {
            player.platformId = null;
            //Make sure character drops when walking off a platform
            if (player.vy == 0) {
                player.vy = config.gravitySpeed;
            }
        }
    }

    document.onkeydown = handleOnkeyDown;
    document.onkeyup = handleOnkeyUp;

    if (pressedKeys.right) {
        player.vx = 5;
        player.isFacingLeft = false;
    }
    
    if (pressedKeys.left) {
        player.vx = -5;
        player.isFacingLeft = true;
    }
    
    if (pressedKeys.up && player.vy == 0) {
        player.vy = -10;
    }
     
    //Put character data on the screen
    ctx.fillStyle = "black";
 
    //JSON.stringify(character, null, 2);

    setTimeout(game, config.tickLength);
}

function isCharacterOnPlatform(char: Character, platform: Platform) {
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

function handleOnkeyDown(e: KeyboardEvent) {
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

function handleOnkeyUp(e: KeyboardEvent) {
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