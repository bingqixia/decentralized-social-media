"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Circle_1 = require("./Circle");
var Rectangle_1 = require("./Rectangle");
// can't create instance of abstract class
// let myShape = new Shape(10, 15);
// console.log(myShape.getInfo());
var myCircle = new Circle_1.Circle(5, 10, 20);
console.log(myCircle.getInfo());
var myRectangle = new Rectangle_1.Rectangle(0, 0, 3, 7);
console.log(myRectangle.getInfo());
var theShapes = [];
theShapes.push(myCircle);
theShapes.push(myRectangle);
for (var _i = 0, theShapes_1 = theShapes; _i < theShapes_1.length; _i++) {
    var shape = theShapes_1[_i];
    console.log(shape.getInfo());
    console.log("Area=".concat(shape.calculateArea()));
}
