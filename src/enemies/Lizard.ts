import Phaser from "phaser";

enum Direction {
  UP,
  DOWN,
  LEFT,
  RIGHT,
}

const randomDirection = (exclude: Direction) => {
  const directionsToChooseFrom = [0, 1, 2, 3].filter(
    (choice) => choice !== exclude
  );
  return directionsToChooseFrom[
    Phaser.Math.Between(0, directionsToChooseFrom.length - 1)
  ];
};

export default class Lizard extends Phaser.Physics.Arcade.Sprite {
  private direction = Direction.RIGHT;
  private speed: number = 50;
  private moveEvent: Phaser.Time.TimerEvent;

  constructor(
    scene: Phaser.Scene,
    x: integer,
    y: integer,
    texture: string,
    frame?: string | number
  ) {
    super(scene, x, y, texture, frame);
    this.anims.play("lizard-idle");
    

  
    scene.physics.world.on(
      Phaser.Physics.Arcade.Events.TILE_COLLIDE,
      this.tileCollision,
      this
    );

   
    this.moveEvent = scene.time.addEvent({
      delay: 2000,
      callback: (gameObject) => {
        this.direction = randomDirection(this.direction);
      },
      loop: true,
    });
  }

  destroy(fromScene?: boolean) {
    
    this.moveEvent.destroy();
    super.destroy(fromScene);
  }

  private tileCollision(
    gameObject: Phaser.GameObjects.GameObject,
    tile: Phaser.Tilemaps.Tile
  ) {
    
    if (gameObject !== this) {
      return;
    } else {
      // Change direction
      this.direction = randomDirection(this.direction);
    }
  }

  preUpdate(t: number, dt: number) {
    super.preUpdate(t, dt);

    // Change Direction of the Lizard
    switch (this.direction) {
      case Direction.UP:
        this.setVelocity(0, -this.speed);
        this.anims.play("lizard-run", true);
        break;

      case Direction.DOWN:
        this.setVelocity(0, this.speed);
        this.anims.play("lizard-run", true);
        break;

      case Direction.LEFT:
        this.setVelocity(-this.speed, 0);
        this.anims.play("lizard-run", true);
        break;

      case Direction.RIGHT:
        this.setVelocity(this.speed, 0);
        this.anims.play("lizard-run", true);
        break;

      default:
        break;
    }
  }
}
