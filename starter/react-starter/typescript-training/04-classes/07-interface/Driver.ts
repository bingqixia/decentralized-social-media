import { Coach } from "./Coach";
import { CricketCoach } from "./CricketCoach";
import { GolfCoach } from "./GolfCoach";

let myCricketCoach = new CricketCoach();
console.log(myCricketCoach.getDailyWorkout());

let myGolfCoach = new GolfCoach();
console.log(myGolfCoach.getDailyWorkout());

let myCoaches: Coach[] = [];
myCoaches.push(myCricketCoach);
myCoaches.push(myGolfCoach);

for(let coach of myCoaches) {
    console.log(coach.getDailyWorkout());
}