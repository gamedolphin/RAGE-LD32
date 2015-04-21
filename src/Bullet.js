/**
 * @fileOverview
 * @name Bullet.js
 * @author Sandeep Nambiar - 20-04-2015
 * @license MIT
 */

var Bullet = cc.PhysicsSprite.extend({
    ctor : function(x,y,toX,toY,space, collisionType){
        this._super("#bullet.png");
        this.space = space;

        var contentSize = this.getContentSize();
        this.body = new cp.Body(1, cp.momentForCircle(1, 0,
                                                      contentSize.width,cp.v(0,0)));
        this.space.addBody(this.body);
        this.body.p = cc.p(x,y);
        this.shape = new cp.CircleShape(this.body, contentSize.width, cp.v(0,0));
        this.shape.deleteBullet = this.deleteBullet.bind(this);
        this.shape.getPosition = this.getPosition.bind(this);
        this.shape.setCollisionType(collisionType);
        this.space.addShape(this.shape);
        this.setBody(this.body);
        this.attr({
            x : x,
            y : y
        });

        this.correction = Math.atan2(Math.sqrt(Rage.Config.offsetX*Rage.Config.offsetX + Rage.Config.offsetY*Rage.Config.offsetY),1000);

        this.speed = Rage.Config.bulletSpeed;
        this.startMoving(toX,toY);
        this.deleteThis = false;
        this.scheduleUpdate();
    },

    update : function(dt){
        if(this.deleteThis){
            this.space.removeShape(this.shape);
            this.space.removeBody(this.body);
            this.removeFromParent();
        }
    },

    getPosition : function(){
        return new cc.p(this.x,this.y);
    },

    deleteBullet : function(){
        // this.stopAllActions();
        this.deleteThis = true;
    },


    startMoving : function(toX,toY){
        var angle = Math.atan2(toY - this.y,
                               toX - this.x) - this.correction;
        if(angle < 0){
            angle = 2*Math.PI - (-angle);
        }

        var cos = Math.cos(angle);
        var sin = Math.sin(angle);

        var moveToPos = cc.p(this.x + 1000*cos + Rage.Config.offsetX*sin,
                             this.y + 1000*sin - Rage.Config.offsetY*cos);

        var time = Math.sqrt((this.x - moveToPos.x)*(this.x - moveToPos.x)+
                             (this.y - moveToPos.y)*(this.y - moveToPos.y))/this.speed;

        this.runAction(cc.sequence(cc.moveTo(time,moveToPos),cc.callFunc(this.killSprite,this)));

        // cc.log("creating and moving to " +angle );
    },

    killSprite : function(){
        this.removeFromParent(true);
    }
});
