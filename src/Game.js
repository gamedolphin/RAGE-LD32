/**
 * @fileOverview
 * @name Game.js
 * @author Sandeep Nambiar - 20-04-2015
 * @license MIT
 */

var GameLayer = cc.Layer.extend({
    space : null,

    ctor : function(){
        this._super();
        this._time = 0;

        this.mX = 0;
        this.mY = 0;

        this.bulletsLeft = 10;
    },

    onEnter : function(){
        this._super();

        this.initPhysics();

        this.spawnPlayer();

        // this.initInput();

        this.scheduleUpdate();

        this.spawnEnemies();

        this.playMusic();

        this.initText();
    },

    initText : function(){
        this.textList = [
            "He didn't like these guys.",
            "Non-vioence? Humbug!",
            "He was starting to enjoy this!",
            "So much blood...",
            "Why don't they fight?",
            "Why wouldn't they give up?!",
            "The hug calmed his nerves...",
            "He could change...",
            "Ahimsa, the ultimate weapon\n had won."
        ];
        this.textBox = new cc.LabelTTF(this.textList[0],Rage.Config.font,30);
        this.textBox.attr({
            x : cc.visibleRect.center.x,
            y : cc.visibleRect.top.y - 100
        });

        this.addChild(this.textBox,40);
        this.currentText = 0;
    },

    updateText : function(){
        if(this.currentText<3){
            this.textBox.setString(this.textList[this.currentText++]);
        }
    },

    playMusic : function(){
        cc.audioEngine.playMusic(res.music,true);
    },

    playGunShot : function(){
        if(this.bulletsLeft>0){
            cc.audioEngine.playEffect(res.shoot);
        }
        else{
            cc.audioEngine.playEffect(res.bulletsOver);
        }
    },

    update : function(dt){
        this._time += dt;
        this.space.step(dt);
    },

    initPhysics : function(){
        this.space = new cp.Space();
        this.space.gravity = cp.v(0,0);

        // var debugNode = new cc.PhysicsDebugNode(this.space);
        // debugNode.visible = true;
        // this.addChild(debugNode);

        this.space.addCollisionHandler(1,2,
                                       this.bulletCollideWithEnemy.bind(this),
                                       null,
                                       null,
                                       null);

        this.space.addCollisionHandler(1,3,
                                       this.enemyCollideWithPlayer.bind(this),
                                       null,
                                       null,
                                       null);
    },

    collidedWithEnemy : false,

    enemyCollideWithPlayer : function(arbiter,space){
        
        this.unschedule(this.spawnOneEnemy);
        var shapes = arbiter.getShapes();
        var rot = 0;
        if(shapes[0].collision_type==1){
            rot = shapes[0].getRotate();
            shapes[0].metPlayer();
        }
        else{
            rot = shapes[1].getRotate();
            shapes[1].metPlayer();
        }

        this.player.setSpriteFrame("peace.png");
        cc.eventManager.removeListeners(this);
        this.bulletsLeft = -1;

        this.player.rotation = rot;

        cc.audioEngine.stopMusic();
        cc.audioEngine.playMusic(res.musicHappy,true);

        if(this.collidedWithEnemy)
            return;
        this.collidedWithEnemy = true;
        this.textBox.setString(this.textList[6]);
        this.scheduleOnce(this.updateNextText,3);
    },

    updateNextText : function(){
        this.textBox.setString(this.textList[7]);
        this.scheduleOnce(this.updateNextNextText,3);
    },

    updateNextNextText : function(){
        this.textBox.setString(this.textList[8]);

        var playAgain = new cc.MenuItemFont("Again?", this.restartGame);
        playAgain.fontName = Rage.Config.font;
        playAgain.fontSize = 40;

        var menu = new cc.Menu(playAgain);
        menu.x = cc.visibleRect.center.x;
        menu.y = cc.visibleRect.bottom.y + 100;

        this.addChild(menu,100);
    },

    restartGame : function(){
        cc.director.runScene(new MainMenuScene());
    },

    bulletCollideWithEnemy : function(arbiter,space){
        var shapes = arbiter.getShapes();
        space.addPostStepCallback(function(){
            if(shapes[0].collision_type==2){
                shapes[1].killEnemy(shapes[0].getPosition());
                shapes[0].deleteBullet();
            }
            else{
                shapes[0].killEnemy(shapes[1].getPosition());
                shapes[1].deleteBullet();
            }
        });
        if(this.currentText == 3){
            this.textBox.setString(this.textList[3]);
            this.currentText = 4;
        }
        if(this.currentText == 4){
            this.textBox.setString(this.textList[4]);
        }
    },

    spawnEnemies : function(){
        this.spawnOneEnemy();
        this.schedule(this.spawnOneEnemy,4);
    },

    spawnOneEnemy : function(){
        var enemy = new Enemy(this.player.x, this.player.y, this.space,1);

        this.addChild(enemy,20);
    },

    spawnPlayer : function(){
        this.player = new cc.PhysicsSprite("#player.png");
        var contentSize = this.player.getContentSize();
        this.body = new cp.Body(1, cp.momentForCircle(1,0,
                                                   contentSize.height - 70,
                                                      cp.v(0,0)));
        this.space.addBody(this.body);
        //6. create the shape for the body
        this.shape = new cp.CircleShape(this.body, contentSize.height - 70,
                                        cp.v(0,0));
        this.shape.setCollisionType(3);
        //7. add shape to space
        this.space.addShape(this.shape);
        //8. set body to the physic sprite
        this.player.setBody(this.body);

        this.player.attr({
            x : cc.visibleRect.center.x,
            y : cc.visibleRect.center.y,
            scale : 0
        });

        this.body.p = cc.p(this.player.x, this.player.y);
        this.addChild(this.player,10);

        this.player.runAction(cc.sequence(cc.scaleTo(0.5,0.75).easing(cc.easeBounceOut()),
                                          cc.callFunc(this.initInput,this)));
    },

    initInput : function(){
        cc.eventManager.addListener({
            event: cc.EventListener.MOUSE,
            onMouseMove: this.mouseMove.bind(this),
            onMouseUp: this.mouseUp.bind(this),
            onMouseDown : this.mouseDown.bind(this)
        },this);

        this.nextTime = 0;
        this.rate = Rage.Config.firingRate;
        this.angle = 0;
    },

    mouseMove : function(event){
        this.mX = event.getLocationX();
        this.mY = event.getLocationY();
        this.angle = Math.atan2(this.mY - this.player.y,
                               this.mX - this.player.x)*180/Math.PI;

        if(this.angle < 0){
            this.angle = 360 - ( - this.angle);
        }

        this.player.rotation = -90 - this.angle;
    },

    mouseUp : function(event){
        this.stopFiring();
    },

    mouseDown : function(event){
        this.startFiring();
    },

    stopFiring : function(){
        this.unschedule(this.fire);
    },

    startFiring : function(){
        this.fire();
        this.schedule(this.fire,this.rate);
    },

    currentShot : 0,
    shownWhatText : false,
    fire : function(dt){
        this.playGunShot();
        this.currentShot += 1;
        if(this.currentShot%2===0){
            this.updateText();
        }
        if(this.bulletsLeft<1){
            if(this.shownWhatText === false){
                this.shownWhatText = true;
                this.textBox.setString(this.textList[5]);
            }
            return;
        }
        this.bulletsLeft -= 1;
        // cc.log("FIRING!");
        var angleInRad = this.angle*Math.PI/180;
        var cos = Math.cos(angleInRad);
        var sin = Math.sin(angleInRad);

        var bullet = new Bullet(this.player.x + Rage.Config.offsetX*sin ,
                                this.player.y - Rage.Config.offsetY*cos,
                                this.mX, this.mY,this.space,2);

        this.addChild(bullet, 5);

        this.player.stopAllActions();

        this.player.runAction(cc.sequence(cc.moveTo(0.1,cc.p(this.player.x - 10*cos,
                                                             this.player.y - 10*sin)),
                                          cc.moveTo(0.5, cc.visibleRect.center)));

    },

    onExit : function(){
        this.space.removeCollisionHandler( 1, 2 );
        this.unscheduleUpdate();

        this._super();
    }
});

var GameScene = cc.Scene.extend({
    onEnter : function(){
        this._super();
        var layer = new GameLayer();
        this.addChild(layer);
    }
});
