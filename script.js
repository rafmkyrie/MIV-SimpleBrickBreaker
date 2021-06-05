// Récupération du contexte

var canvas = document.getElementById('idcanvas')
var ctx = canvas.getContext('2d');

const DX = 1.5 * canvas.width / 1000;
const DY = 1.5 * canvas.width / 1000;

ctx.textAlign = "center"; 
var fontsize = 0;
var lives = 3;
var gameOverBool = false;
var showPlayAgain = false;
var gameStarted = false;

var score = 0;
var highscore = 0;
var level = 0;

//      Partie Raquette          ######################################################################
var raquette = {
    x: 0,
    y: 0,
    w: 0,
    h: 0,
    speed: 30,
    imgs: [],
    frame: 0,
    getImage: function () {
        this.frame++;
        if(this.frame==this.imgs.length) this.frame=0;
        return this.imgs[this.frame];
    }
}

// Chargement des images de la raquette

raquette.imgs[0] = document.getElementById("raquette1");
raquette.imgs[1] = document.getElementById("raquette2");
raquette.imgs[2] = document.getElementById("raquette3");

raquette.w = 200 * canvas.width / 1000;
raquette.h = raquette.w * raquette.imgs[0].height / raquette.imgs[0].width * 0.7;
raquette.x = canvas.width/2 - raquette.w/2;
raquette.y = Math.floor(canvas.height - 1.5*raquette.h);

var raquetteImage = raquette.getImage();
setInterval(updateRaquetteImage, 100)
function updateRaquetteImage(){
    raquetteImage = raquette.getImage()
}


// ########################################################################################################



//      Partie Balle             ######################################################################

var balle = {
    img: document.getElementById("balle"),
    size: 24 * canvas.width / 1000,
    radius: 0,
    x: 0,
    y: 0,
    rx: 0,
    ry: 0,
    dx: DX,
    dy: DY,
    move: function(){
        /* Fonction qui effectue le déplacement de la balle */

        if(this.dx != 0 || this.dy != 0){
            this.rx = this.x + this.radius;
            this.ry = this.y + this.radius;

            // mur droit / gauche
            if(this.x + this.dx > canvas.width - this.size){
                this.dx = -DX;
            }

            if(this.x + this.dx < 0){
                this.dx = DX;
            }

            // mur du haut
            if(this.y + this.dy < 0) {  
                this.dy = DY;
            }

            // collision avec la raquette
            if(this.y + this.dy + this.size > raquette.y && this.y + this.dy + this.size < raquette.y + raquette.h *1/5 &&
                this.x + this.dx > raquette.x && this.x + this.dx < raquette.x + raquette.w) {  
                this.dy = -DY;
            }
            else{
                // collision avec les bords de la raquette
                if(this.y + this.dy + this.size > raquette.y  && this.dy + this.size < raquette.y + raquette.h *1/2 &&
                    this.x + this.dx + this.size > raquette.x && this.x + this.dx < raquette.x + raquette.w/2){  
                        // bord gauche
                        this.dy = -DY;
                        this.dx = -DX;
                }
                else{
                    if(this.y + this.dy + this.size > raquette.y  && this.dy + this.size < raquette.y + raquette.h *1/2 &&
                        this.x + this.dx < raquette.x + raquette.w && this.x + this.dx > raquette.x + raquette.w/2  ){
                            // bord droit
                            this.dy = -DY;
                            this.dx = DX;
                    }
                }
            }

            // mur du bas
            if(this.y + this.dy > canvas.height - this.size){
                // perdu
                lives -= 1;
                gameStarted = false;

                resetPosition();

                if(lives == 0){
                    gameOverBool = true;
                    clearInterval(drawInterval);
                    gameOverInterval = setInterval(gameOver, delay);
                    drawPlayAgainInterval = setInterval(drawPlayAgain, delay*500);
                }
            }
            
            this.x += this.dx;
            this.y += this.dy;
        }
    }
} 

balle.radius = balle.size/2;
balle.x = raquette.x + raquette.w/2 - balle.size/2;
balle.y = raquette.y - balle.size;
balle.dx = 0;
balle.dy = 0;

// Intialisation des Briques

var bricks = []
initializeBricks(level);






// ##################################################################################################

// Game Functions   #################################################################################

var delay=1; // ms
var drawInterval = setInterval(draw, delay);
var gameOverInterval = setInterval(gameOver, delay);
var drawPlayAgainInterval = setInterval(drawPlayAgain, delay*500);
clearInterval(gameOverInterval);
clearInterval(drawPlayAgainInterval);

var background = document.getElementById("background");



function draw() {
    /* Fonction d'affichage principale */

    ctx.clearRect(0,0,canvas.width,canvas.height); //; Effacer le canvas
    ctx.drawImage(background, 0, 0, canvas.width, canvas.height); // Background

    ctx.fillStyle = "white";
    fontsize = 32 * canvas.width / 1000;
    ctx.font = "italic "+fontsize+"px Segoe";
    ctx.fillText('Lives : ' + lives, canvas.width*1/5, canvas.height * 1/15); // Afficher le nb de vies restantes
    ctx.fillText('Score : ' + score, canvas.width*4/5, canvas.height * 1/15); // Afficher le score
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    fontsize = 16 * canvas.width / 1000;
    ctx.font = "italic "+fontsize+"px Segoe";
    ctx.fillText('High Score : ' + highscore, canvas.width*4/5, canvas.height * 1/10); // Afficher le score

    
    ctx.drawImage(raquetteImage, raquette.x, raquette.y, raquette.w, raquette.h); // Raquette
    ctx.drawImage(balle.img, balle.x, balle.y, balle.size, balle.size); // Balle

    drawBricks();
    checkBricksCollision();
    balle.move();
}



function initializeBricks(level){
    /* Fonction qui initialise les briques du jeu selon le niveau */

    var map = [[0,0,0,0,0], 
               [0,0,1,0,0], 
               [0,1,0,1,0], 
               [0,0,1,0,0], 
               [0,0,0,0,0]];

    if(level == 1){
        map = [[0,0,1,0,0], 
               [0,1,0,1,0], 
               [1,0,1,0,1], 
               [0,1,0,1,0], 
               [0,0,1,0,0]];
    }

    if(level == 2){
        map = [[1,1,1,1,1], 
               [1,1,0,1,1], 
               [1,0,1,0,1], 
               [1,1,0,1,1], 
               [1,1,1,1,1]];
    }

    for(var r = 0; r<map.length; r++){
        for(var c = 0; c< map[0].length; c++){
            if(map[r][c] != 0){
                var brick = {
                    img1: document.getElementById("brique1"),
                    img2: document.getElementById("brique2"),
                    x: 0,
                    y: 0,
                    w: 0,
                    h: 0,
                    hit: false,
                    hitControl: false
                }
                brick.w = canvas.width/12;
                brick.h = brick.w * brick.img1.height / brick.img1.width;
                brick.x = canvas.width * 3/10 + c*(brick.w);
                brick.y = canvas.height * 2/10 + r*(brick.h);
                bricks.push(brick);
            }
        }
    }
}

function drawBricks(){
    /* Fonction qui affiche les briques du jeu */
    for(var i=0; i<bricks.length; i++){
        var brick = bricks[i];
        if(brick.hit)
            ctx.drawImage(brick.img2, brick.x, brick.y, brick.w, brick.h);
         else
            ctx.drawImage(brick.img1, brick.x, brick.y, brick.w, brick.h);
    }
}

function gameOver(){
    /* Fonction qui affiche l'écran de la fin du jeu */

    var go_img = document.getElementById("gameover");
    ctx.clearRect(0,0,canvas.width,canvas.height); //; Effacer le canvas
    ctx.drawImage(go_img, 0, 0, canvas.width, canvas.height);

    ctx.fillStyle = "white";
    fontsize = 16 * canvas.width / 1000;
    ctx.font = "italic "+ fontsize + "px Lucida Sans";
    if(score>highscore){
        ctx.fillText('New High Score : ' + score + " !", canvas.width/2, canvas.height * 2/3); 
    }else{
        ctx.fillText('Score : ' + score, canvas.width/2, canvas.height * 2/3); 
        ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
        fontsize = 12 * canvas.width / 1000;
        ctx.font = "italic "+fontsize+"px Lucida Sans";
        ctx.fillText('High Score : ' + highscore, canvas.width/2, canvas.height * 2/3 + 25); 
    }

    if(showPlayAgain){
        ctx.fillStyle = "rgba(200, 200, 200, 0.6)";
        fontsize = 16 * canvas.width / 1000;
        ctx.font = "italic "+fontsize+"px Lucida Sans";
        ctx.fillText("Press Enter to play again.", canvas.width/2, canvas.height * 4/5); 
    }
}

function drawPlayAgain(){
    /* Fonction qui aide à effectuer l'animation de l'écran Game Over */
    showPlayAgain = !showPlayAgain;
}

function playAgain(){
    /* Fonction qui relance le jeu après une fin de partie */

    gameOverBool = false;
    lives = 3;
    score = 0;
    level = 0;
    clearInterval(gameOverInterval);
    clearInterval(drawPlayAgainInterval);
    bricks = [];
    resetPosition();
    initializeBricks(level);
    drawInterval = setInterval(draw, delay);
}

function resetPosition(){
    /* Fonction qui remet les objets du jeu à la position de départ */

    gameStarted = false;
    balle.dx = 0;
    balle.dy = 0;
    raquette.x = canvas.width/2 - raquette.w/2;
    raquette.y = Math.floor(canvas.height - 1.5*raquette.h);
    balle.x = raquette.x + raquette.w/2 - balle.size/2;
    balle.y = raquette.y - balle.size;
}





//    COLLISIONS FUNCTIONS   ############################################################""

function checkBricksCollision(){
    /* Fonction qui contrôle les collisions sur les briques */

    for(var i=0; i<bricks.length; i++){
        var brick = bricks[i];
        if(!gameStarted)
            brick.hitControl = true;
        if(checkCollision(balle, brick)){
            collisionBrickBalle(brick, balle);
        }
        else{
            brick.hitControl = false;
        }
    }
}

function checkCollision(balle, brick){
    /* Fonction qui détecte s'il y a une collision entre la balle et une brique */

    var x = clamp(brick.x, brick.x + brick.w, balle.rx);
    var y = clamp(brick.y, brick.y + brick.h, balle.ry);
    var dx = balle.rx - x;
    var dy = balle.ry - y;
    var d = Math.sqrt(dx * dx + dy * dy);
    return(d < balle.radius);
}

function collisionBrickBalle(brick, balle){
    /* Fonction qui traite les collisions entre la balle et une brique */

    if(gameStarted){
        var x = clamp(brick.x, brick.x + brick.w, balle.rx);
        var y = clamp(brick.y, brick.y + brick.h, balle.ry);

        if(x == brick.x)
            balle.dx = -DX;
        else if(x == brick.x + brick.w)
                balle.dx = DX;

        if(y == brick.y)
            balle.dy = -DY;
        else if(y == brick.y + brick.h)
                balle.dy = DY;
    }

    if(brick.hit && !brick.hitControl){
        score += 100;
        const index = bricks.indexOf(brick);
        if (index > -1) {
            bricks.splice(index, 1);
        }
        if(bricks.length == 0){
            score += 500;
            level ++;
            resetPosition();
            initializeBricks(level);
        }
    }else{
        if(!brick.hitControl && gameStarted){
            score += 50;   // first hit
            brick.hit = true;
            brick.hitControl = true;
        }
    }
}

function clamp(min, max, value){
    /* Fonction Clamp qui permet de calculer le point d'un rectangle le plus proche d'un cercle, 
        utile pour détecter les collisions balle-brique */

    if(value < min){
        return min;
    }else if(value > max){
        return max;
    }else{
        return value;
    }
}





//   EVENT LISTENERS        ##############################

addEventListener("keydown", function(e) {
    /* Ecouteur d'événements des touches du clavier */
            switch(e.keyCode) {
                    case 37: // go left
                        if(raquette.x - raquette.speed >= 0){
                            raquette.x -= raquette.speed;
                            if(!gameStarted){
                                balle.x = raquette.x + raquette.w/2 - balle.size/2; 
                            }
                        }
                        break;

                    case 39: // go right
                        if(raquette.x + raquette.w + raquette.speed <= canvas.width){
                            raquette.x += raquette.speed;
                            if(!gameStarted){
                                balle.x = raquette.x + raquette.w/2 - balle.size/2;
                            } 
                        }
                        break;
                    
                    case 13: // Enter
                        if(gameOverBool){
                            if(score>highscore)
                                highscore = score;
                            playAgain();
                        }
                        break;
                        
                    case 32: // Space
                        if(!gameStarted){
                            gameStarted=true;
                            balle.dx = DX;
                            balle.dy = -DY;
                        }
                        break;


                }
        })  

