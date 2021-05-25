const Express = require("express")();
const Http = require("http").Server(Express);
const Socketio = require('socket.io')(
    Http,
    {
        cors: {
            origin: "*",
        }
    });
//Viteza sarpelui
const speed = 100;

//Timer tranzitii
var timer = setInterval(() => { }, speed);

//Sarpele
var snakePosition = [{
    x: 180,
    y: 100
},
{
    x: 160,
    y: 100
},
{
    x: 140,
    y: 100
}];

//Pozitia mancarii
var foodPosition = {
    x: Math.floor(Math.random() * 21) * 20,
    y: Math.floor(Math.random() * 21) * 20
}

//Genereaza mancare random
function getNewFoodPosition() {
    foodPosition.x = Math.floor(Math.random() * 21) * 20;
    foodPosition.y = Math.floor(Math.random() * 21) * 20;
}


function goRight() {
    //Muta capul la dreapta
    snakePosition[0].x += 20;
    //Verifica daca nu a iesit de pe tabla
    if (snakePosition[0].x >= 640) {
        lose();
        return;
    }
    Socketio.emit("snakePosition", snakePosition);

    //Mareste sarpe daca a mancat o patratica
    for (var i2 = 0; i2 < snakePosition.length; i2++) {
        if ((foodPosition.x == snakePosition[i2].x) && (foodPosition.y == snakePosition[i2].y)) {
            snakePosition.unshift({ x: snakePosition[0].x + 20, y: snakePosition[0].y })
            Socketio.emit("snakePosition", snakePosition);
            getNewFoodPosition();
            Socketio.emit("foodPosition", foodPosition);
            Socketio.emit("updateScore");
        }
    }
}

function goLeft() {
    //Muta capul la stanga
    snakePosition[0].x -= 20;
    //Verifica daca nu a iesit de pe tabla
    if (snakePosition[0].x < 0) {
        lose();
        return;
    }
    Socketio.emit("snakePosition", snakePosition);
    //Mareste sarpe daca a mancat o patratica
    for (var i2 = 0; i2 < snakePosition.length; i2++) {
        if ((foodPosition.x == snakePosition[i2].x) && (foodPosition.y == snakePosition[i2].y)) {
            snakePosition.unshift({ x: snakePosition[0].x - 20, y: snakePosition[0].y })
            Socketio.emit("snakePosition", snakePosition);
            getNewFoodPosition();
            Socketio.emit("foodPosition", foodPosition);
            Socketio.emit("updateScore");
        }

    }
}

function goUp() {
    //Muta capul in sus
    snakePosition[0].y -= 20;
    //Verifica daca nu a iesit de pe tabla
    if (snakePosition[0].y < 0) {
        lose();
        return;
    }
    Socketio.emit("snakePosition", snakePosition);
    //Mareste sarpe daca a mancat o patratica
    for (var i2 = 0; i2 < snakePosition.length; i2++) {
        if ((foodPosition.x == snakePosition[i2].x) && (foodPosition.y == snakePosition[i2].y)) {
            snakePosition.unshift({ x: snakePosition[0].x, y: snakePosition[0].y - 20 });
            Socketio.emit("snakePosition", snakePosition);
            getNewFoodPosition();
            Socketio.emit("foodPosition", foodPosition);
            Socketio.emit("updateScore");
        }

    }
}

function goDown() {
    //Muta capul in jos
    snakePosition[0].y += 20;
    //Verifica daca nu a iesit de pe tabla
    if (snakePosition[0].y >= 480) {
        lose();
        return;
    }
    Socketio.emit("snakePosition", snakePosition);
    //Mareste sarpe daca a mancat o patratica
    for (var i2 = 0; i2 < snakePosition.length; i2++) {
        if ((foodPosition.x == snakePosition[i2].x) && (foodPosition.y == snakePosition[i2].y)) {
            snakePosition.unshift({ x: snakePosition[0].x, y: snakePosition[0].y + 20 });
            Socketio.emit("snakePosition", snakePosition);
            getNewFoodPosition();
            Socketio.emit("foodPosition", foodPosition);
            Socketio.emit("updateScore");
        }

    }
}

//Daca sarpele a iesit de pe tabla server-ul anunta clientul
function lose() {
    Socketio.emit("lose")
    resetSnake();
    Socketio.emit("snakePosition", snakePosition);
}

//Reseteaza sarpele la pozitiile initiale
function resetSnake() {
    snakePosition = [{
        x: 180,
        y: 100
    },
    {
        x: 160,
        y: 100
    },
    {
        x: 140,
        y: 100
    }];

    clearInterval(timer);
}

//Miscarea automata a sarpelui pe tabla
Socketio.on("connection", socket => {
    socket.emit("snakePosition", snakePosition);
    socket.emit("foodPosition", foodPosition);

    socket.on("goRight", () => {
        clearInterval(timer);
        timer = setInterval(goRight, speed);
    });

    socket.on("goLeft", () => {
        clearInterval(timer);
        timer = setInterval(goLeft, speed);
    });

    socket.on("goUp", () => {
        clearInterval(timer);
        timer = setInterval(goUp, speed);
    });

    socket.on("goDown", () => {
        clearInterval(timer);
        timer = setInterval(goDown, speed);
    });

});

//Comunicarea cu clientul
Http.listen(3000, () => {
    console.log("Listening at port 3000");
});

