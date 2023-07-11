import { Shape } from "./Shape";

export class Circle extends Shape {
    public get radius(): number {
        return this._radius;
    }
    public set radius(value: number) {
        this._radius = value;
    }
    constructor(theX: number, theY: number, private _radius: number) {
        super(theX, theY);
    }

    getInfo(): string {
        return super.getInfo() + `, radius=${this._radius}`;
    }

    calculateArea(): number {
        return Math.pow(this._radius, 2) * Math.PI;
    }
    
}