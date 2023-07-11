import { Shape } from "./Shape";
import { Circle } from "./Circle";
import { Rectangle } from "./Rectangle";

// can't create instance of abstract class
// let myShape = new Shape(10, 15);
// console.log(myShape.getInfo());

let myCircle = new Circle(5, 10, 20);
let myRectangle = new Rectangle(0, 0, 3, 7);


let theShapes: Shape[] = [];

theShapes.push(myCircle);
theShapes.push(myRectangle);

for(let shape of theShapes) {
    console.log(shape.getInfo());
    console.log(`Area=${shape.calculateArea()}`);
}