"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Customer_1 = require("./Customer");
var myCustomer = new Customer_1.Customer("Pooki", "Xia");
// actually call the setter
// myCustomer.firstName = "xx";
// myCustomer.lastName = "yy";
console.log(myCustomer.firstName);
console.log(myCustomer.lastName);
