let reviews: number[] = [5, 5, 4.5, 1, 3];
let total = 0;
for(let i = 0; i < 5; i ++) {
    console.log(reviews[i]);
    total += reviews[i];
}

let average: number = total/reviews.length;
console.log(`the average is ${average}`);

let sportsOne: string[] = ["swimming", "running", "tennis"];

for(let sport of sportsOne) {
    if(sport == "running") {
        console.log(`${sport} >> My Favorite!`);
    } else {
        console.log(sport);
    }
}

let sportsTwo: string[] = ["swimming", "running", "tennis"];
sportsTwo.push("Baseball");
sportsTwo.push("Football");
for(let sport of sportsTwo) {
    if(sport == "running") {
        console.log(`${sport} >> My Favorite!`);
    } else {
        console.log(sport);
    }
}