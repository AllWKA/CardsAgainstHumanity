import { Component, OnInit } from "@angular/core";
import axios from "axios";
import { ActivatedRoute } from "@angular/router";
import { AlertController } from "@ionic/angular";
import { Socket } from "ngx-socket-io";

import { BackEndServiceService } from "../services/back-end-service.service";

import blacks from "../../assets/cards/blacks";
import whites from "../../assets/cards/whites";

@Component({
  selector: "app-play-room",
  templateUrl: "./play-room.page.html",
  styleUrls: ["./play-room.page.scss"]
})
export class PlayRoomPage implements OnInit {
  constructor(
    private socket: Socket,
    private route: ActivatedRoute,
    public alertController: AlertController,
    private back: BackEndServiceService
  ) {}

  ip: string = "https://yousaywhayserver.herokuapp.com/api/v1/";
  local: string = "http://localhost:3000/api/v1";
  roomURI: string = this.ip + "/rooms";
  playerURI: string = this.ip + "/players";

  roomID: string = "";
  playerID: string = "";

  player: Object = {
    nick: "none",
    pts: 0
  };

  round: number = 0;
  ready: boolean = false;

  allWhites: Array<Object> = whites;
  allBlacks: Array<Object> = blacks;

  whites: Array<Object> = [];
  black: Object = this.allBlacks[5];

  whitesDone: Array<number> = [];
  blacksDone: Array<number> = [];

  topPlayers: Array<Object> = [];

  messages: Array<String> = [];

  ngOnInit() {
    this.presentAlert();
    this.getWhites();
    this.getPlayer();
    this.getTop();
    this.sockets();
  }
  sockets() {
    this.socket.connect();
    this.socket.on("player-ready", () => {
      console.log("player ready");
    });
    this.socket.on(this.roomID + "/newBlack", () => {
      this.updateRoom();
    });
    this.socket.on(this.roomID + "/playerReady", () => {});
    this.socket.on(this.roomID + "/playerWhite", white => {
      this.messages.unshift(
        this.black["content"] + white.white.content + "\n" + white.player.nick
      );
    });
  }
  async updateRoom() {
    const room = await this.back.getRoom(this.roomID);
    const newBlack = await this.back.getBlack(room["data"]["black"]);
    this.black = newBlack.data;
  }
  sendWhite(white) {
    const myWhite = {
      white: white,
      player: this.player,
      room: this.roomID
    };
    this.socket.emit("white", myWhite);
    this.socket.emit("player-ready", {
      roomID: this.roomID,
      playerID: this.playerID
    });
    this.getWhites();
  }
  getPlayer() {
    return this.route.queryParams.subscribe(async (params: Object) => {
      this.roomID = params["room"];
      this.playerID = params["player"];
      const player = await axios.get(this.playerURI + "/" + params["player"]);
      this.player = player.data;
    });
  }
  async getWhites() {
    this.whites = [];
    for (let i = 0; i < 5; i++) {
      var a: number = await this.getRNGWhite();
      this.whites[i] = this.allWhites[a];
    }
  }
  getRNGWhite(): Promise<number> {
    return new Promise((resolve, reject) => {
      const max: number = this.allWhites.length;
      var result: number = Math.round(Math.random() * max);
      while (this.whitesDone.includes(result)) {
        result = Math.round(Math.random() * max);
      }
      this.whitesDone.push(result);
      resolve(result);
    });
  }
  async getTop() {
    this.topPlayers = await axios.get(this.roomURI + "/top/" + this.roomID);
    this.topPlayers = this.topPlayers["data"];
  }
  async presentAlert() {
    const alert = await this.alertController.create({
      header: "Ready?",
      message: "The other players are wating...",
      buttons: [
        {
          text: "Ready",
          handler: async () => {
            return this.socket.emit("player-ready", {
              roomID: this.roomID,
              playerID: this.playerID
            });
          }
        }
      ]
    });
    await alert.present();
  }
}
