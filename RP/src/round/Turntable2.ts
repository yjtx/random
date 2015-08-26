/**
 * Created by huanghaiying on 15/1/31.
 */
class Turntable2 extends egret.DisplayObjectContainer{
    private static Num:number = 18;

    private static Init_Speed:number = 10;

    private static Avg_Speed:number = 2;

    private static End_Speed:number = 50;

    private static Acc_Speed:number = 1 / 2;
    private static Dec_Speed:number = 4;


    private _decStartNum:number;
    private _currNum:number;
    constructor() {
        super();

        Turntable2.Num = 12;
        Turntable2.Avg_Speed = 3;
        Turntable2.Dec_Speed = 8;
        Turntable2.End_Speed = Turntable2.Avg_Speed + Turntable2.Dec_Speed * 7;


        this._currNum = 0;
    }

    private _ring:egret.Shape;
    private _hand:egret.Shape;

    private _avgRo:number;

    private initResult():void {
        var decNum:number = (Turntable2.End_Speed - Turntable2.Avg_Speed) / Turntable2.Dec_Speed;
        var resultNum:number = utils.randomInt(1, Turntable2.Num);
        this._decStartNum = utils.getRemainder(resultNum - decNum, Turntable2.Num) - 1;

        console.log("result = " + resultNum);
    }

    public init():void {

        var r:number = 200;
        this._ring = new egret.Shape();
        this._ring.graphics.beginFill(0xff0000, 1);
        this._ring.graphics.drawCircle(0, 0, r);
        this._ring.graphics.endFill();

        this._ring.graphics.lineStyle(2, 0xffff00, 1);

        this._avgRo = 360 / Turntable2.Num;
        for (var i:number = 0; i < Turntable2.Num; i++) {
            this._ring.graphics.moveTo(0, 0);

            this._ring.graphics.lineTo(Math.cos((this._avgRo * i - 90 + this._avgRo / 2)/ 180 * Math.PI) * r,
                    Math.sin((this._avgRo * i - 90 + this._avgRo / 2)/ 180 * Math.PI) * r);

        }
        this._ring.graphics.endFill();


        this._hand = new egret.Shape();
        this._hand.graphics.beginFill(0x00ff00, 1);
        this._hand.graphics.moveTo(0, 0);

        this._hand.graphics.lineTo(Math.cos((-90 - this._avgRo / 2)/ 180 * Math.PI) * r,
            Math.sin((-90 - this._avgRo / 2)/ 180 * Math.PI) * r);
        this._hand.graphics.lineTo(Math.cos((-90 + this._avgRo / 2)/ 180 * Math.PI) * r,
            Math.sin((-90 + this._avgRo / 2)/ 180 * Math.PI) * r);
        this._hand.graphics.lineTo(0, 0);

        this._hand.graphics.endFill();

        this.addChild(this._ring);
        this.addChild(this._hand);

        this._ring.x = this.stage.stageWidth / 2;
        this._ring.y = this.stage.stageHeight / 2;

        this._hand.x = this._ring.x;
        this._hand.y = this._ring.y;


        for (var i:number = 0; i < Turntable2.Num; i++) {
            var t:egret.TextField = new egret.TextField();
            this.addChild(t);

            t.x = this._ring.x + Math.cos((this._avgRo * i - 90)/ 180 * Math.PI) * r;
            t.y = this._ring.y + Math.sin((this._avgRo * i - 90)/ 180 * Math.PI) * r;

            t.text = (i + 1) + "";
            t.anchorX = t.anchorY = 0.5;
        }
    }


    public start():void {
        egret.Ticker.getInstance().register(this.onTickerHandler, this);

        this._accNum = Turntable2.Acc_Speed;
        this._currentSpeedNum = Turntable2.Init_Speed;

        this._type = 0;
        this._count = 0;

        this.initResult();
    }

    private _type:number;

    private _accNum:number;
    private _currentSpeedNum:number;


    private _count:number;

    private onTickerHandler(advTime:number):void {
        this._count++;

        switch (this._type) {
            case 0:
                this.accelerate();
                break;
            case 1:
                this.uniform();
                break;
            case 2:
                this.decelerate();
                break;
        }
    }

    private turnRoation():void {
        this._currNum++;
        this._count = 0;
        this._hand.rotation += this._avgRo;
    }

    private accelerate():void {//加速
        if (this._count >= this._currentSpeedNum) {
            this.turnRoation();

            this._currentSpeedNum -= this._accNum;
        }

        if (this._currentSpeedNum <= Turntable2.Avg_Speed) {
            this._accNum = 0;
            this._type = 1;
            this._currentSpeedNum = Turntable2.Avg_Speed;

            this._avgCount = Turntable2.Num * 3;

            this._avgCount += this._decStartNum - utils.getRemainder(this._currNum, Turntable2.Num);
        }

    }

    private _avgCount:number;
    private uniform():void {//匀速
        if (this._count >= this._currentSpeedNum) {
            this.turnRoation();

            this._avgCount--;
        }

        if (this._avgCount <= 0) {
            this._type = 2;
            this._accNum = Turntable2.Dec_Speed;
        }

    }

    private decelerate():void {//减速
        if (this._count >= this._currentSpeedNum) {
            this.turnRoation();

            this._currentSpeedNum += this._accNum;
        }

        if (this._currentSpeedNum >= Turntable2.End_Speed) {
            this._type = 3;
            this._accNum = Turntable2.Acc_Speed;

            this._currentSpeedNum = Turntable2.Init_Speed;


            this.result();
        }
    }

    public result():void {
        egret.Ticker.getInstance().unregister(this.onTickerHandler, this);

        this.dispatchEvent(new egret.Event("result"));
    }
}