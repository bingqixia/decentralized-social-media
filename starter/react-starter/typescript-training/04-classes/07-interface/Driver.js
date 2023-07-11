"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CricketCoach_1 = require("./CricketCoach");
var GolfCoach_1 = require("./GolfCoach");
var myCricketCoach = new CricketCoach_1.CricketCoach();
console.log(myCricketCoach.getDailyWorkout());
var myGolfCoach = new GolfCoach_1.GolfCoach();
console.log(myGolfCoach.getDailyWorkout());
var myCoaches = [];
myCoaches.push(myCricketCoach);
myCoaches.push(myGolfCoach);
for (var _i = 0, myCoaches_1 = myCoaches; _i < myCoaches_1.length; _i++) {
    var coach = myCoaches_1[_i];
    console.log(coach.getDailyWorkout());
}
