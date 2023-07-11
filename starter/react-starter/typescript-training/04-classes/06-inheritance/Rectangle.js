"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.Rectangle = void 0;
var Shape_1 = require("./Shape");
var Rectangle = /** @class */ (function (_super) {
    __extends(Rectangle, _super);
    function Rectangle(theX, theY, _width, _length) {
        var _this = _super.call(this, theX, theY) || this;
        _this._width = _width;
        _this._length = _length;
        return _this;
    }
    Rectangle.prototype.getInfo = function () {
        return _super.prototype.getInfo.call(this) + ", width=".concat(this._width, ", length=").concat(this._length);
    };
    Rectangle.prototype.calculateArea = function () {
        return this._length * this._width;
    };
    return Rectangle;
}(Shape_1.Shape));
exports.Rectangle = Rectangle;
