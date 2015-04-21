/**
 * @fileOverview
 * @name Enemy.js
 * @author Sandeep Nambiar - 20-04-2015
 * @license MIT
 */

var Enemy = cc.PhysicsSprite.extend({
    ctor : function(toX,toY, space,collisionType){
        this._super("#enemy.png");
        this.space = space;
        var randX = this.randomFloat(0,100);
        var randY = this.randomFloat(0,100);
        this.speed = Rage.Config.enemySpeed;

        var contentSize = this.getContentSize();
        this.body = new cp.Body(1, cp.momentForCircle(1, 0,contentSize.height-50,
                                                      cp.v(0,0)));
        this.space.addBody(this.body);
        this.shape = new cp.CircleShape(this.body, contentSize.height - 50,cp.v(0,0));
        this.shape.setCollisionType(collisionType);
        this.shape.killEnemy = this.killMe.bind(this);
        this.shape.metPlayer = this.salvation.bind(this);
        this.shape.getRotate = this.getRotate.bind(this);
        this.space.addShape(this.shape);
        this.setBody(this.body);
        this.body.p = cc.p(
            randX > 50 ? cc.visibleRect.right.x + 100 : cc.visibleRect.left.x - 100,
            randY > 50 ? cc.visibleRect.top.y + 100 : cc.visibleRect.bottom.y - 100);
        this.isDead = false;
        this.alreadyDead = false;

        this.startMovingTo(toX,toY);

        this.scheduleUpdate();
    },

    getRotate : function(){
        var p = this.rotation;
        return p;
    },

    salvation : function(){
        this.stopAllActions();
        this.setSpriteFrame("hugginEnemy.png");
        this.alreadyDead = true;
    },
    
    update : function(dt){
        if(this.isDead && !this.alreadyDead){
            this.alreadyDead = true;
            this.space.removeShape(this.shape);
            this.space.removeBody(this.body);
            this.stopAllActions();
            this.playDeathAnimation();
        }

        if(!this.alreadyDead){
            if(this.rotation > this.oldRotation + 20){
                this.sign = -1;
            }
            else if(this.rotation < this.oldRotation - 20){
                this.sign  = 1;
            }
            var rotSpeed = 5;
            this.rotation += 60*dt*this.sign;
        }
    },

    playDeathAnimation : function(){
        var spr = new cc.Sprite("#blood.png");
        var angle1 = Math.atan2(cc.visibleRect.center.y - this.deathPos.y,
                                cc.visibleRect.center.x - this.deathPos.x);
        var angle = angle1*180/Math.PI;
        if(angle1<0){
            angle1 = Math.PI*2 - (-angle1);
        }
        if(angle < 0){
            angle = 360 - ( - angle);
        }

        spr.rotation  = this.rotation + angle;

        spr.attr({
            x : this.getContentSize().width/2,//this.x +  10*Math.cos(angle1),
            y : -this.getContentSize().height/6// this.y + 10*Math.sin(angle1)
        });
        this.addChild(spr,-1);
        this.setSpriteFrame("dyingEnemy.png");
        this.runAction(cc.sequence(cc.fadeOut(4).easing(cc.easeExponentialOut()),
                                   cc.callFunc(this.removeFromParent,this)));

        spr.runAction(cc.sequence(cc.fadeOut(4),
                                  cc.callFunc(spr.removeFromParent,spr)));
    },

    killMe : function(pos){
        this.isDead = true;
        this.deathPos = pos;
    },

    startMovingTo : function(toX,toY){
        var angle = Math.atan2(this.y - toY,
                               this.x - toX)*180/Math.PI;

        if(angle < 0){
           angle = 360 - ( - angle);
        }

        this.rotation = -90 - angle;

        this.oldRotation = this.rotation;
        this.sign = 1;

        var time = Math.sqrt((this.x - toX)*(this.x - toX)+
                             (this.y - toY)*(this.y - toY))/this.speed;

        this.runAction(cc.moveTo(time, cc.p(toX,toY)));

    },

    randomFloat : function(min,max){
        return Math.random() * (max - min) + min;
    }
});
