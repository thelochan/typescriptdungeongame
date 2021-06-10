import Phaser from "phaser";

import { sceneEvents } from "../events/EventCenter";

export default class GameUi extends Phaser.Scene
 {
  private hearts!: Phaser.GameObjects.Group;

  constructor()
   {
    super({ key: "game-ui" });
  }

  create()
  {
    this.add.image(8, 25, "treasure", "coin_anim_f0.png")
    const coinsLabel = this.add.text(12, 20, "0")
    this.add.text(1,55,"Press Space" ,{ fontSize: "50"})

sceneEvents.on("player-coins-changed", (coins: number) => {
  coinsLabel.text = coins.toString()
})

    this.hearts = this.add.group({ classType: Phaser.GameObjects.Image });

    this.hearts.createMultiple({
      key: "ui-heart-full",
      setXY: {
        x: 10,
        y: 10,
        stepX: 16,
      },
      quantity: 5,
    });

    
    sceneEvents.on(
      "player-health-changed",
      this.handlePlayerHealthChange,
      this
    );

   
    this.events.once(Phaser.Scenes.Events.DESTROY, () => {
      sceneEvents.off("player-health-changed",this.handlePlayerHealthChange, this)
        sceneEvents.off("player-coins-changed")
      
    })
  }

  private handlePlayerHealthChange(health: number) {
    this.hearts.children.each((go, idx) => {
      const heart = go as Phaser.GameObjects.Image;
      if (idx < health) {
        heart.setTexture("ui-heart-full");
      } else {
        heart.setTexture("ui-heart-empty");
      }
    });
  }
}
