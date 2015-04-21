/**
 * @fileOverview
 * @name MainMenu.js
 * @author Sandeep Nambiar - 20-04-2015
 * @license MIT
 */


var MainMenuLayer = cc.Layer.extend({
    ctor:function () {
        this._super();
        cc.audioEngine.stopMusic();
        cc.spriteFrameCache.addSpriteFrames(res.sheet1plist);

        var titleText = new cc.LabelTTF("RAGE!",Rage.Config.font,Rage.Config.fontSize);
        titleText.x = cc.visibleRect.center.x;

        titleText.y = cc.visibleRect.center.y + 120;

        this.addChild(titleText,20);

        var p = new cc.Sprite("#player.png");
        p.attr({
            x : cc.visibleRect.center.x,
            y : cc.visibleRect.center.y
        });
        this.addChild(p,21);

        p.runAction(cc.sequence(cc.rotateBy(0.5,10),cc.rotateBy(0.5,-10)).repeatForever());

        this.firstItem = new cc.MenuItemFont("Jack had a gun.",this.item2,this);
        this.firstItem.fontName = Rage.Config.font;
        this.firstItem.fontSize = 50;

        this.secondItem = new cc.MenuItemFont("And he was going to use it!",this.item3,this);
        this.secondItem.fontName = Rage.Config.font;
        this.secondItem.fontSize = 60;

        this.thirdItem = new cc.MenuItemFont("Begin!",this.switchToPlay,this);
        this.thirdItem.fontName = Rage.Config.font;
        this.thirdItem.fontSize = 60;

        var menu = new cc.Menu(this.firstItem, this.secondItem, this.thirdItem);
        menu.x = cc.visibleRect.center.x;
        menu.y = cc.visibleRect.center.y - 150;

        this.addChild(menu,22);

        this.secondItem.setVisible(false);
        this.secondItem.setEnabled(false);
        this.thirdItem.setVisible(false);
        this.thirdItem.setEnabled(false);
        // var item4 = new cc.MenuItemFont(""

        var inst = new cc.LabelTTF("Click the text above to continue!",
                                   Rage.Config.font, 20);
        inst.attr({
            x : cc.visibleRect.center.x,
            y : cc.visibleRect.bottom.y + 80
        });

        this.addChild(inst,25);
        //this.switchToPlay();
    },

    item2 : function(){
        this.firstItem.setVisible(false);
        this.firstItem.setEnabled(false);
        this.secondItem.setEnabled(true);
        this.secondItem.setVisible(true);
    },

    item3 : function(){
        this.secondItem.setVisible(false);
        this.secondItem.setEnabled(false);
        this.thirdItem.setEnabled(true);
        this.thirdItem.setVisible(true);
    },

    switchToPlay : function(){
        cc.director.runScene(new GameScene());
    }
});

var MainMenuScene = cc.Scene.extend({
    onEnter:function () {
        this._super();
        var layer = new MainMenuLayer();
        this.addChild(layer);
    }
});

