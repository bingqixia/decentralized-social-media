import { Shape } from "./Shape";

export class Rectangle extends Shape {

    constructor(theX: number, theY: number, private _width: number, private _length: number) {
        super(theX, theY);
    }

    getInfo(): string {
        return super.getInfo() + `, width=${this._width}, length=${this._length}`;
    }
    
    calculateArea(): number {
        return this._length*this._width;
    }
}