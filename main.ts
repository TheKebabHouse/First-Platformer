
//To recompile, enter `tsc --watch` into the terminal
//Open the terminal with Ctrl+J

const config = {
    width: 1500,
    height: 750,
    gravitySpeed: 0.3,
    tickLength: 1000 / 120,
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
    harm: (damage: number) => void;
    isFalling: () => boolean;
};

type PlatformBase = {
    x: number;
    y: number;
    width: number;
    height: number;
    shrinkSpeed?: number;
    wobble?: {
        px: number;
        x: number;
    };
    colour?: string | CanvasGradient;
    isHarmful?: boolean;
};
type Platform = PlatformBase & {
    id: number;
    colour: string | CanvasGradient;
}


const player: Character = {
    x: 0,
    y: -300,
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
    harm(damage: number) {
        player.health -= damage;
        harm.total += damage;
        harm.flashUntil = Date.now() + 250;
    },
    isFalling() { return player.vy > 0 },
};

const startingPlatforms: PlatformBase[] = [
    {
        x: 100,
        y: -700,
        width: 100,
        height: 10,
        colour: "blue",
    }, {
        x: 1250,
        y: -700,
        width: 300,
        height: 10,
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
        colour: "yellow",
    },{
        x: 500,
        y: -350,
        width: 200,
        height: 20,
        colour: "blue",
    },{
        x:700,
        y: -250,
        width: 400,
        height: 10,
        shrinkSpeed: 1,
        colour: "green",
    }, {
        x: -3100,
        y: 0,
        width: 3000,
        height: 100,
        colour: "#820",
        wobble: {px: 100, x: -3100},
    }, {
        x: 0,
        y: 0,
        width: 300,
        height: 100,
        colour: "#820",
        wobble: {px: 150, x: 0},
    }, {
        x: 400,
        y: 0,
        width: 3000,
        height: 100,
        colour: "#820",
        wobble: {px: 200, x: 400},
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
let harm = {
    flashUntil: 0,
    total: 0,
    isNow: () => {
        if (harm.flashUntil < Date.now()) {
            harm.total = 0;
        }
        return (harm.flashUntil > Date.now() && harm.total > 1) || player.health < 20;
    },
};

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
    setInterval(addRandomPlatform, 1000);
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
    const isHarmful = !randInt(0, 20);
    
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

    //Draw void
    const voidHeight = 2000;
    const voidY = -player.y + config.height / 2;
    const voidGradient = ctx.createLinearGradient(0, voidY, 0, voidY + voidHeight);
    voidGradient.addColorStop(0, "rgba(0, 0, 0, 0)");
    voidGradient.addColorStop(.5, "black");
    voidGradient.addColorStop(1, "black");
    ctx.fillStyle = voidGradient;
    ctx.fillRect(0, 0, config.width, config.height);

    //Draw platforms
    for (var i = 0; i < platforms.length; ++i) {
        ctx.fillStyle = platforms[i].colour;
        ctx.fillRect((platforms[i].x - player.x) + config.width/2, (platforms[i].y - player.y) + config.height/2, platforms[i].width, platforms[i].height);
    }

    //Draw red screen and harm total
    if (harm.isNow()) {
        ctx.fillStyle = "rgba(255, 0, 0, .2)";
        ctx.fillRect(0, 0, config.width, config.height);
        ctx.fillStyle = "white";
        ctx.font = "30px Chiller"
        ctx.fillText(`-${Math.ceil(harm.total)}`, config.width/2, config.height/2);
    }

    //Draw player health
    ctx.fillStyle = "white";
    ctx.fillRect(90, 70, 70, 40);
    ctx.fillStyle = harm.isNow()  ? "red" : "black";
    ctx.font = harm.isNow() ? "30px Chiller" : "30px Arial";
    ctx.fillText(player.health.toFixed(0), 100, 100);
}


function game() {
    draw();

    if (player.health < player.maxHealth) {
        player.health += 0.01;
    }
    if (player.y - player.height >= 0) {
        player.harm(player.y / 1000);
    }
    if (player.health <= 0) {
        resetPlayer();
    }
    
    player.y += player.vy;

    if (player.vy < 20) {
        player.vy += config.gravitySpeed;
    }

    if (player.vx != 0) {
        player.vx -= player.vx > 0 ? 0.5 : -0.5;
    }
    player.x += player.vx;

    //Shrink and sink platforms if below the character
    //  and wobble platforms
    for (var i = 0; i < platforms.length; ++i) {
        if (platforms[i].y > player.y + player.height - 1) {
            //Shrink platform
            platforms[i].width -= platforms[i].shrinkSpeed ?? 0;
            platforms[i].x += platforms[i].shrinkSpeed ?? 0 / 2;
            //Remove platform if too thin
            if (platforms[i].width < player.width / 2) {
                platforms.splice(i--, 1);
                continue;
            }
        }
        const {wobble} = platforms[i];
        if (wobble) {
            const wobbleTo = wobble.x + (Math.sin(Date.now() / 1000) * wobble.px);
            const xDiff = wobbleTo - platforms[i].x;
            platforms[i].x += xDiff;
            if (player.platformId == platforms[i].id) {
                player.x += xDiff;
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
                    player.harm(player.vy - 10);
                }
                //Damage player if platform is harmful
                if (platforms[i].isHarmful) {
                    player.harm((config.tickLength / (1000 * 5)) * player.maxHealth);
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