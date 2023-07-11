export abstract class Shape {
    public get y(): number {
        return this._y;
    }
    public set y(value: number) {
        this._y = value;
    }
    public get x(): number {
        return this._x;
    }
    public set x(value: number) {
        this._x = value;
    }
    constructor(private _x: number, private _y: number) {

    }

    getInfo(): string {
        return `x=${this.x}, y=${this._y}`;
    }

    abstract calculateArea(): number;
    
}