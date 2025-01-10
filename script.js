let snowflakes = [];
let hour_branches = [];
let maxTrunkHeight = 900;

function setup() {
  createCanvas(400, 1200);
  background(199, 240, 255);
}

function draw() {
  // reset if midngiht
  if (hour() === 0 && minute() === 0) {
    hour_branches = [];
  }
  // set sky
  let night_color = color(20, 20, 50);
  let day_color = color(199, 240, 255);

  // sunrise
  if (hour() == 6 && minute() > 30){
    let transition = map(minute(), 30, 59, 0, 1);
    background(lerpColor(night_color, day_color, transition));
  }
  // sunset
  else if (hour() == 16 && minute() > 30){
    let transition = map(minute(), 30, 59, 0, 1);
    background(lerpColor(day_color, night_color, transition));
  }
  // night
  else if (hour() >=17 || hour() < 7){
    background(night_color);
  }
  // day
  else{
    background(day_color);
  }
  
  // draw trunk
  let trunkOffset = height - 100;
  let trunkHeight = map(hour() + minute() / 60, 0, 24, 0, maxTrunkHeight);
  
  // draw snow
  fill(255);
  noStroke();
  rect(0, height - 30, width, 60);

  // draw the trunk
  stroke(100, 50, 0);
  strokeWeight(20);
  line(width / 2, height-25, width / 2, trunkOffset);
  line(width / 2, trunkOffset, width / 2, trunkOffset - trunkHeight);

  // update branches
  growBranches(trunkOffset, maxTrunkHeight);

  // draw branches
  for (let branch of hour_branches) {
    branch.show();
  }
  
  // snow flakes
  createSnowflakes();
  updateSnowflakes();
  drawSnowflakes();
}

function createSnowflakes() {
  if (random() < 0.1) { // random chance to generate snow flakes
    let size = random(2, 5); // size
    let snowflake = new Snowflake(random(width), 0, size);
    snowflakes.push(snowflake);
  }
}

function updateSnowflakes() {
  // snow flake position
  for (let i = snowflakes.length - 1; i >= 0; i--) {
    snowflakes[i].fall();
    // delete snowflakes off screen
    if (snowflakes[i].y > height) {
      snowflakes.splice(i, 1);
    }
  }
}

function drawSnowflakes() {
  noStroke();
  for (let snowflake of snowflakes) {
    snowflake.show();
  }
}

class Snowflake {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.speed = random(1, 3); // falling speed
    this.opacity = random(150, 255);
  }

  // move the snowflake down
  fall() {
    this.y += this.speed;
  }

  // show snowflake
  show() {
    fill(255, this.opacity);
    ellipse(this.x, this.y, this.size);
  }
}

function growBranches(trunkOffset, trunkHeight) {
  let hr = hour();
  let branchSpacing = maxTrunkHeight / 24; // evenly space branches

  // add all branches
  for (let i = hour_branches.length; i <= hr; i++) {
    let yPos = trunkOffset - (i * branchSpacing);
    let side = (i % 2 === 0) ? 1 : -1; // alternate sides on trunk

    hour_branches.push(new Branch(width / 2, yPos, side, i));
  }
}

class Branch {
  constructor(x, y, side, hr) {
    this.x = x;
    this.y = y;
    this.side = side; // 1 for right, -1 for left
    this.hr = hr;
    this.length = 0;
    this.maxLength = 100;
    this.subBranches = [];
  }

  // grow the branch as the minutes pass
  show() {
    stroke(100, 50, 0);
    strokeWeight(5);

    if (hour() > this.hr) {
      // past hours are fully grown
      this.length = this.maxLength;
    } else if (hour() === this.hr) {
      // grow current hour
      this.length = min(map(minute(), 0, 59, 0, this.maxLength) + 30, this.maxLength);
    }

    // draw branch
    line(this.x, this.y, this.x + this.side * this.length, this.y - this.length / 2);

    // the sub branches show every 15 min interval in the hour
    this.growSubBranches();

    // draw sub branches
    for (let subBranch of this.subBranches) {
      subBranch.show();
    }
  }

  // grow sub branches as minutes pass
  growSubBranches() {
    let subBranchSpacing = this.maxLength / 4; // evenly space sub branches

    // past hours are fully grown
    if (this.hr < hour()) {
      for (let i = 0; i < 4; i++) {
        let subBranchPosition = subBranchSpacing * i + 20;

        let side = ((i + 1) % 2 === 0) ? 1 : -1; // alternate sides every 15 minutes
        if (this.side === 1) {
          side = -side;
        }
        this.subBranches.push(new SubBranch(this.x + this.side * subBranchPosition, this.y - subBranchPosition / 2, side, this.hr, i));
      }
    } else {
      // grow current hour sub branches based on minute
      let timeSlot = floor(minute() / 15); // get the minute interval (0-15, 16-30, 31-45, 46-59)

      // fully grow past intervals
      for (let i = 0; i <= timeSlot; i++) {
        if (this.subBranches.length <= i) {
          let subBranchPosition = subBranchSpacing * i + 20;

          let side = ((i + 1) % 2 === 0) ? 1 : -1; // alternate sides every 15 minutes
          if (this.side === 1) {
            side = -side;
          }

          // Create a new sub-branch at the appropriate position
          this.subBranches.push(new SubBranch(this.x + this.side * subBranchPosition, this.y - subBranchPosition / 2, side, this.hr, i));
        }
      }
    }
  }
}

class SubBranch {
  constructor(x, y, side, hr, interval) {
    this.x = x;
    this.y = y;
    this.side = side;
    this.hr = hr;
    this.interval = interval; // index for (0-15, 16-30, 31-45, 46-59)
    this.length = 0;
    this.maxLength = 30;
  }

  // grow sub branch 
  show() {
    stroke(100, 50, 0);
    strokeWeight(3);

    // if hour has past, sub branch if fully grown
    if (this.hr < hour()) {
      this.length = this.maxLength;
    } else {
      // else sub branch grows with the minute
      if (this.interval === floor(minute() / 15)) {
        let timeInSlot = minute() - (this.interval * 15); 
        this.length = map(timeInSlot, 0, 14, 0, this.maxLength);
      } else {
        this.length = this.maxLength; // fully grown also for past intervals
      }
    }

    // sub branch position
    let subBranchEndX = this.x;
    let subBranchEndY = this.y;

    // alternate interval directions as well
    if (this.interval === 0 || this.interval === 2) {
        // horizontal
      subBranchEndX = this.x + cos(PI / 4) * this.length * this.side;
      subBranchEndY = this.y + sin(PI / 4) * this.length;
    } else {
      // vertical
      subBranchEndX = this.x;
      subBranchEndY = this.y - this.length;
    }

    // draw sub branch
    line(this.x, this.y, subBranchEndX, subBranchEndY);
  }
}

