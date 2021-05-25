<template>
  <div class="snake">
    <h1>Snake Game</h1>
    <h2>Score: {{ score }}</h2>
    <canvas
      ref="game"
      class="board"
      width="640"
      height="480"
      style="border: 1px solid black"
    >
    </canvas>
  </div>
</template>

<script>
import io from "socket.io-client";
export default {
  name: "SnakeGame",
  //pozitia curenta sarpe
  snakePosition: [],
  //pozitia curenta mancare
  foodPosition: {},
  //pozitia trecuta sarpe
  pastSnakePosition: [],
  //pozitia trecuta mancare
  pastFoodPosition: {},
  //direction poate fi: 'r','l','u','d'
  direction: "r",
  data() {
    return {
      socket: {},
      context: {},
      score: 0,
    };
  },

  //Conexiunea
  created() {
    this.socket = io("http://localhost:3000");
  },

  mounted() {
    this.context = this.$refs.game.getContext("2d");
    //Desenarea sarpelui
    this.socket.on("snakePosition", (data) => {
      this.snakePosition = data;
      this.paintSnake();
    });

    //Desenarea mancarii
    this.socket.on("foodPosition", (data) => {
      this.foodPosition = data;
      this.paintFood(this.foodPosition);
      this.pastFoodPosition = data;
    });

    //Sfarsit joc: Afiseaza un mesaj si scorul + reincarca pagina
    this.socket.on("lose", () => {
      alert("You lose! Your final score is: " + this.score);
      window.location = location;
    });

    //Updateaza scor
    this.socket.on("updateScore", () => {
      this.score += 10;
    });

    //Event listener pt tasta apasata
    window.addEventListener("keydown", (e) => {
      
      switch (e.key) {
        case "ArrowUp":
          console.log(e.key);
          //Daca sarpele se deplaseaza in jos, nu pot da comanda sus
          if (this.direction != "d") {
            this.goUp();
            this.direction = "u";
          }break;

        case "ArrowDown":
          console.log(e.key);
          //Daca sarpele se deplaseaza in sus, nu pot da comanda de jos
          if (this.direction != "u") {
            this.goDowm();
            this.direction = "d";
          }
          console.log(this.pastSnakePosition[0].x, this.pastSnakePosition[0].y);
          break;

        case "ArrowLeft":
          console.log(e.key);
          //Daca sarpele se deplaseaza spre dreapta, nu pot da comanda de stanga
          if (this.direction != "r") {
            this.goLeft();
            this.direction = "l";
          }
          console.log(this.pastSnakePosition[0].x, this.pastSnakePosition[0].y);
          break;

        case "ArrowRight":
          console.log(e.key);
          //Daca sarpele se deplaseaza spre stanga nu pot da comanda de dreapta
          if (this.direction != "l") {
            this.goRight();
            this.direction = "r";
          }
          console.log(this.pastSnakePosition[0].x, this.pastSnakePosition[0].y);
          break;
      }
    });
  },

  methods: {
    //Metoda de desenare sarpe
    paintSnake() {
      //Daca pozitiile trecute nu sunt nule, le sterg
      if (this.pastSnakePosition != null) {
        for (var i = 0; i < this.pastSnakePosition.length; i++) {
          this.context.clearRect(
            this.pastSnakePosition[i].x,
            this.pastSnakePosition[i].y,
            20,
            20
          );
          if (i < this.snakePosition.length - 1) {
            this.snakePosition[i + 1] = this.pastSnakePosition[i];
          }
        }
      }
      //Desenez pozitiile actuale ale sarpelui
      this.context.fillStyle = "black;";
      for (var j = 0; j < this.snakePosition.length; j++) {
        this.context.fillRect(
          this.snakePosition[j].x,
          this.snakePosition[j].y,
          20,
          20
        );
      }
      this.verify();
      this.pastSnakePosition = this.snakePosition;
    },

    //Metoda de desenat mancarea
    paintFood(position) {
      //Daca pozitia trecuta a mancarii nu este null, o sterg
      if (this.pastFoodPosition != null) {
        this.context.clearRect(
          this.pastFoodPosition.x,
          this.pastFoodPosition.y,
          20,
          20
        );
      }
      //Desenez pozitia actuala a mancarii
      this.context.fillStyle = "red";
      this.context.fillRect(position.x, position.y, 20, 20);
      this.context.fillStyle = "black";
    },

    //In functie de tasta apasata se apeleaza una din metodele
    //de mai jos care emit un mesaj corespunzator catre server
    goRight() {
      this.context.fillStyle = "black";
      this.socket.emit("goRight");
    },

    goLeft() {
      this.context.fillStyle = "black";
      this.socket.emit("goLeft");
    },

    goUp() {
      this.context.fillStyle = "black";
      this.socket.emit("goUp");
    },

    goDowm() {
      this.context.fillStyle = "black";
      this.socket.emit("goDown");
    },

    //Metoda verifica daca sarpele nu s-a muscat pe el
    //Daca s-a muscat afiseaza un mesaj si scorul
    verify(){
      for (var i2 = 1; i2 < this.snakePosition.length; i2++) {
        if ( (this.snakePosition[0].x == this.snakePosition[i2].x) && (this.snakePosition[0].y == this.snakePosition[i2].y)) {
          alert("You lose! Your final score is: " + this.score);
          window.location = location;
        }
      }
    }
  },
};
</script>

<style scoped>
/* Centrarea elementelor */
.snake {
  margin: 0;
  padding: 0;
  text-align: center;
}

.board {
  margin-top: 100px;
}
</style>
