import Phaser, { HEADLESS } from "phaser";
import { sceneEvents } from "~/events/EventCenter";
import Chest from "../items/Chest";

declare global {
  namespace Phaser.GameObjects {
    interface GameObjectFactory {
      faune(
        x: number,
        y: number,
        texture: string,
        frame?: number | string
      ): Faune;
    }
  }
}

enum HealthState {
  STABLE,
  DAMAGE,
  DEAD,
}

export default class Faune extends Phaser.Physics.Arcade.Sprite {
  private healthState = HealthState.STABLE;
  private damageExposureTime = 0;

  private _health = 5
  private _coins = 0

  private knives?: Phaser.Physics.Arcade.Group
  private activeChest?: Chest

  get health() {
    return this._health;
  }

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    frame?: string | number
  ) {
    super(scene, x, y, texture, frame);
    this.anims.play("faune-idle-down");
  }

  setKnives(knives: Phaser.Physics.Arcade.Group)
  {
    this.knives = knives
  }

  setChest(chest: Chest){
    this.activeChest = chest
  }



  handleDamage(dir: Phaser.Math.Vector2) {
    if (this._health <= 0) {
      return;
    }

    if (this.healthState === HealthState.DAMAGE) {
      return;
    }

    --this._health;

    if (this._health <= 0) {
      this.healthState = HealthState.DEAD;
      this.anims.play("faune-faint");
      this.setVelocity(0,0)
    } else {
      this.setVelocity(dir.x, dir.y);
      this.setTint(0xff0000);
      this.healthState = HealthState.DAMAGE;
      this.damageExposureTime = 0;
    }
  }

  private throwKnife()
  {
    if(!this.knives)
    {
      return
    }
    const parts = this.anims.currentAnim.key.split('-')
    const direction = parts[2]

    const vec = new Phaser.Math.Vector2(0,0)

    switch (direction)
    {
      case 'up':
        vec.y = -1
      break

      case 'down':
        vec.y = 1
        break

default:
        case 'side':
          if(this.scaleX < 0)
          {
            vec.x =  -1
          }

          else{
            vec.x = 1
          }
          break
    }

    const angle = vec.angle()
    const knife = this.knives.get(this.x, this.y, 'knife') as Phaser.Physics.Arcade.Image

    knife.setActive(true)
    knife.setVisible(true)
    knife.setRotation(angle)

    knife.x += vec.x * 16
    knife.y += vec.y * 16

    knife.setVelocity(vec.x * 300, vec.y * 300) 
  }

  preUpdate(t: number, dt: number) {
    super.preUpdate(t, dt)

    switch (this.healthState) {
      case HealthState.STABLE:
        break;
      case HealthState.DAMAGE:
       
        this.damageExposureTime += dt
        
        if (this.damageExposureTime >= 250) {
        
          this.healthState = HealthState.STABLE;
         
          this.setTint(0xffffff);
         
          this.damageExposureTime = 0;
        }
        break;
      default:
        return;
    }
  }

  update(cursors: Phaser.Types.Input.Keyboard.CursorKeys)
   {

    if (
      this.healthState === HealthState.DAMAGE ||
      this.healthState === HealthState.DEAD
    ) {
      return;
    }

    if (!cursors) {
      return;
    }

    if (Phaser.Input.Keyboard.JustDown(cursors.space!))

    if (this.activeChest)
    {
      const coins = this.activeChest.open()
      this._coins += coins
      sceneEvents.emit("player-coins-changed", this._coins)
    }
    else
    {
      this.throwKnife()
      return
    }

    
    const speed = 100

    const leftDown = cursors.left?.isDown
    const rightDown = cursors.right?.isDown
    const upDown = cursors.up?.isDown
    const downDown = cursors.down?.isDown
    
    if (leftDown) {
    
      this.setVelocity(-speed, 0);
      this.anims.play("faune-run-side", true);
      
      this.scaleX = -1;
      
      this.body.offset.x = 24;

    } else if (rightDown) {
     
      this.setVelocity(speed, 0);
      this.anims.play("faune-run-side", true);
      this.scaleX = 1;
      
      this.body.offset.x = 8;

    } else if (upDown) {
      
      this.setVelocity(0, -speed);
      this.anims.play("faune-run-up", true);

    } else if (downDown) {
      
      this.setVelocity(0, speed);
      this.anims.play("faune-run-down", true);

    } else 
    {
      const parts = this.anims.currentAnim.key.split("-");
      parts[1] = "idle";
      this.setVelocity(0, 0);
      this.anims.play(parts.join("-"));
    }
    if(leftDown || rightDown || upDown || downDown)
    {
      this.activeChest = undefined
    }
   }
}

Phaser.GameObjects.GameObjectFactory.register("faune", function (
  this: Phaser.GameObjects.GameObjectFactory,
  x: number,
  y: number,
  texture: string,
  frame?: string | number
) {
  var sprite = new Faune(this.scene, x, y, texture, frame);

  this.displayList.add(sprite);
  this.updateList.add(sprite);

  this.scene.physics.world.enableBody(sprite, 
    Phaser.Physics.Arcade.DYNAMIC_BODY
  );

  sprite.body.setSize(sprite.width * 0.5, sprite.height * 0.8);

  return sprite
});
