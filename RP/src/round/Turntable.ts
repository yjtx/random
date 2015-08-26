/**
 * Created by huanghaiying on 15/1/31.
 */
class Turntable extends egret.DisplayObjectContainer{

    private static Num:number = 18;

    private static RUNNING_COUNT:number = 20;

    private static PERCENT_COUNT:number = 0;
    private static ADV_SPEED:number = 0;

    private static Acc_Speed:number = 0.4;
    private static Dec_Speed:number = 0.1;
    /**
     *
     */
    constructor() {
        super();

        Turntable.PERCENT_COUNT = Math.round(Turntable.RUNNING_COUNT / Turntable.Num);
        Turntable.ADV_SPEED = 360 / (Turntable.Num * Turntable.PERCENT_COUNT);
    }


    private _ring:egret.Shape;
    private _hand:egret.Shape;
    private _resultHand:egret.Shape;
    public init():void {
        var r:number = 200;
        this._ring = new egret.Shape();
        this._ring.graphics.beginFill(0xff0000, 1);
        this._ring.graphics.drawCircle(0, 0, r);
        this._ring.graphics.endFill();

        this._ring.graphics.lineStyle(2, 0xffff00, 1);

        var avgRo = 360 / Turntable.Num;
        for (var i:number = 0; i < Turntable.Num; i++) {
            this._ring.graphics.moveTo(0, 0);

            this._ring.graphics.lineTo(Math.cos((avgRo * i - 90 + avgRo / 2)/ 180 * Math.PI) * r,
                Math.sin((avgRo * i - 90 + avgRo / 2)/ 180 * Math.PI) * r);

        }
        this._ring.graphics.endFill();

        this._hand = new egret.Shape();
        this._hand.graphics.lineStyle(2, 0x00ff00, 1);
        this._hand.graphics.moveTo(0, 0);
        this._hand.graphics.lineTo(0, -180);
        this._hand.graphics.endFill();

        this._resultHand = new egret.Shape();
        this._resultHand.graphics.lineStyle(2, 0xffffff, 1);
        this._resultHand.graphics.moveTo(0, 0);
        this._resultHand.graphics.lineTo(0, -180);
        this._resultHand.graphics.endFill();

        this.addChild(this._ring);
        this.addChild(this._hand);
        this.addChild(this._resultHand);

        this._ring.x = this.stage.stageWidth / 2;
        this._ring.y = this.stage.stageHeight / 2;

        this._hand.x = this._ring.x;
        this._hand.y = this._ring.y;

        this._resultHand.x = this._ring.x;
        this._resultHand.y = this._ring.y;

        for (var i:number = 0; i < Turntable.Num; i++) {
            var t:egret.TextField = new egret.TextField();
            this.addChild(t);

            t.x = this._ring.x + Math.cos((avgRo * i - 90)/ 180 * Math.PI) * r;
            t.y = this._ring.y + Math.sin((avgRo * i - 90)/ 180 * Math.PI) * r;

            t.text = (i + 1) + "";
            t.anchorX = t.anchorY = 0.5;
        }
    }

    private _endRotation:number;//最终停在的角度
    private setResult():void {
        //随机结果
        var result:number = utils.randomInt(1, Turntable.Num);

        var ravRotation = 360 / Turntable.Num;

        var rapRotation = utils.randomInt(-ravRotation / 2 + 1, ravRotation / 2 - 1);
        //最终停在的角度位置
        this._endRotation = ravRotation * (result - 1) + rapRotation;

        this._resultHand.rotation = this._endRotation;
        console.log("result = " + result + "  rotation =" + this._endRotation);
    }

    public start():void {
        this.setResult();

        this.initAcc();
        egret.Ticker.getInstance().register(this.onTickerHandler, this);
    }

    private _type:number;
    private _speed:number;

    private onTickerHandler(advTime:number):void {
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

    private _accEndRotation:number;
    private initAcc():void {
        this._type = 0;
        this._speed = 0;

        var temp:number = Math.floor(this._hand.rotation + 0.5 * Turntable.ADV_SPEED * Math.round(Turntable.ADV_SPEED / Turntable.Acc_Speed));
        var count:number = Math.floor(temp / 360);
        temp = utils.getRemainder(temp, 360);
        var accEndNum = Math.ceil(temp / (360 / Turntable.Num));
        this._accEndRotation = count * 360 + accEndNum * (360 / Turntable.Num);

        var result = this._accEndRotation - this._hand.rotation;

        Turntable.Acc_Speed = 0.5 * (Turntable.ADV_SPEED * Turntable.ADV_SPEED) / result;
    }

    private accelerate():void {//加速
        if (this._speed + Turntable.Acc_Speed >= Turntable.ADV_SPEED) {
            this._type = 1;
            this._speed = Turntable.ADV_SPEED;

            this._hand.rotation = this._accEndRotation;

            this.initUniform();
        }
        else {
            this._speed += Turntable.Acc_Speed;

            this._hand.rotation += this._speed;
        }
    }

    private _uniformPerCount:number;
    private _uniformCount:number;
    private _uniformEndCount:number;
    private initUniform():void {
        this.initDec();

        this._hand.rotation = utils.getRemainder(this._hand.rotation, 360);
        var temp = this._hand.rotation;
        this._uniformCount = Math.round(temp / (360 / Turntable.Num));

        this._uniformPerCount = 0;

        var uniformRingCount = utils.randomInt(1, 1);
        this._uniformEndCount = uniformRingCount * Turntable.Num + this._uniformCount;

    }

    private uniform():void {//匀速
        this._uniformPerCount++;
        if (this._uniformPerCount >= Turntable.PERCENT_COUNT) {
            this._uniformCount++;
            this._hand.rotation = this._uniformCount * (360 / Turntable.Num);

            this._uniformPerCount = 0;

            if (this._uniformCount >= this._uniformEndCount) {
                if (utils.getRemainder(this._uniformCount, Turntable.Num) == utils.getRemainder(this._decStartNum, Turntable.Num)) {
                    this._type = 2;

                    this._hand.rotation = utils.getRemainder(this._hand.rotation, 360);
                }
            }
        }
        else {
            this._hand.rotation += Turntable.ADV_SPEED;
        }
    }


    private _decStartNum:number;
    private _decDistance:number;
    private initDec():void {
        var decStartRotition = this._endRotation - 0.5 * Turntable.ADV_SPEED * (Turntable.ADV_SPEED / Turntable.Dec_Speed) + 8 * 360;
        var decC = Math.floor(decStartRotition / 360);
        decStartRotition = utils.getRemainder(decStartRotition, 360);
        this._decStartNum = Math.round(decStartRotition / (360 / Turntable.Num));

        decStartRotition = this._decStartNum * (360 / Turntable.Num) + decC * 360;

        this._decDistance = this._endRotation - decStartRotition + 8 * 360;
        Turntable.Dec_Speed = 0.5 * Turntable.ADV_SPEED * Turntable.ADV_SPEED / this._decDistance;

        this._decCount = 0;
    }

    private _decCount:number;
    private decelerate():void {//减速
        this._decCount++;

        this._hand.rotation = this._endRotation - this._decDistance + Turntable.ADV_SPEED * this._decCount - 0.5 * Turntable.Dec_Speed * this._decCount * this._decCount;

        this._speed -= Turntable.Dec_Speed;

        if (this._speed <= 0) {
            this._hand.rotation = utils.getRemainder(this._hand.rotation, 360);
            this._hand.rotation = this._endRotation;

            this.result();
        }
        else {
            //this._hand.rotation += this._speed;
        }

    }

    public result():void {
        egret.Ticker.getInstance().unregister(this.onTickerHandler, this);

        this.dispatchEvent(new egret.Event("result"));
    }
}