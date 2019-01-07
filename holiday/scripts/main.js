var ARTSY = false;
var SKYLINE = false;
var INACTIVE_LIMIT = 500;
var INACTIVE_TIME = 60;
var ADD_PARTICLES = true;
var MAX_HEIGHT = 800;
var MOBILE = false;
var DEBUG = false;
var START_TIME_LIMIT = 3 * 60;

var mainWidth = 500;
var mainHeight = window.innerHeight > MAX_HEIGHT ? MAX_HEIGHT : window.innerHeight;
var mobileWidth = window.innerWidth > 375 ? 357 : window.innerWidth;
var mobileHeight = window.innerHeight > MAX_HEIGHT ? MAX_HEIGHT : window.innerHeight;
var mainOffsetX = 0;
var mainOffsetY = 50;
var skylineOffset = 0;
var brushWidth = 50;
var skips = 2;
var pixelWidth = 5;

var wind = 0;
var moved = false;

var logo, skyline, mobile, skylineMobile, reindeer;

var completed = false;
var started = false;
var rendered = false;

var deer;
var particles = [];
var falling = [];
var inactive = [];
var skylineParticles = [];

function generateSkyline() {
  for (var i = 0; i < skyline.width; i++) {
    for (var j = 0; j < skyline.height; j++) {
      var color = skyline.get(i, j);
      if (color[0] !== 255
        && (color[1] !== 255)
        && color[2] !== 255) {
        skylineParticles.push(new SkylineParticle(i, j, skyline.height));
      }
    }
  }
}

function generateLetter() {
  var rand = random(0,1)
  if (rand < 0.5) {
    return '0'
  } else {
    return '1'
  }
}

function addSnowParticle() {
  var particle = new Particle(Math.floor(random(-width/8, width*1.125)), 1, getFontSize(skips));
  particle.touched = true;
  particle.drawCountdown = 0;
  particle.offSetY = 0;
  falling.push(particle);
}

function addParticles(skips) {
  for (var i = 0; i < (logo.width) * (logo.height); i++) {
    var x = i % logo.width;
    var y = Math.floor(i / logo.height);
    if (i % skips !== 1 || y % skips !== 1) {
      continue;
    }
    var color = logo.get(x, y);
    if (color[0] > 240
      && (color[1] > 240)
      && color[2] === 0) {
      var particle = new Particle(x, y, getFontSize(skips));
      particles.push(particle);
    }
  }
}

function getFontSize(skips) {
  return 12 + ((skips - 2) * 5);
}

function preload() {
  mobile = loadImage('./assets/decoded_mobile.png');
  logo = loadImage('./assets/logo-new.png');
  skyline = loadImage('./assets/skyline_outline.png');
  skylineMobile = loadImage('./assets/skyline_outline_mobile.png');
  reindeer = loadImage('./assets/reindeer.png');
  skylineFilled = loadImage('./assets/skyline.png');
}

function setPixelWidth() {
  if (MOBILE) {
    brushWidth = brushWidth * 0.8;
    pixelWidth = (mobileWidth / mobile.width);
    mainOffsetX = (window.innerWidth - mobileWidth);
  } else {
    pixelWidth = (mainWidth / logo.width);
    mainOffsetX = (window.innerWidth - mainWidth);
  }
}

function setup() {
  console.log('%c Happy Holidays 🙃 ', 'background: #000; color: #FEF700; font-size: 20px');
  $('.welcome-message').addClass('active');
  if (window.innerWidth < 600) {
    MOBILE = true;
  }
  createCanvas(window.innerWidth, window.innerHeight);
  noStroke();
  deer = new Reindeer();
  setPixelWidth();
  textSize(13);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
}

function drawSnowGlobe() {
  fill(0);
  beginShape();
  vertex(0, 0);
  vertex(0, width/2);
  bezierVertex(0, width/2 * (.45), width/2 * (.45), 0, width/2, 0);
  endShape();
  beginShape();
  vertex(width, 0);
  vertex(width, width/2);
  bezierVertex(width, width/2 * (.45), width/2 + width/2 * (.45), 0, width/2, 0);
  endShape();
}

function star(x, y, radius1, radius2, npoints) {
  var angle = TWO_PI / npoints;
  var halfAngle = angle/2.0;
  beginShape();
  for (var a = 0; a < TWO_PI; a += angle) {
    var sx = x + cos(a) * radius2;
    var sy = y + sin(a) * radius2;
    vertex(sx, sy);
    sx = x + cos(a+halfAngle) * radius1;
    sy = y + sin(a+halfAngle) * radius1;
    vertex(sx, sy);
  }
  endShape(CLOSE);
}

var wandRotation = 0;
var lastRotation = 0;
var inactiveCount = 0;
var startTime = 0;

function checkInactive() {
  startTime += 1;
  if (pmouseX !== mouseX || pmouseY !== mouseY) {
    inactiveCount = 0;
    return;
  } else {
    inactiveCount += 1;
  }
  if (inactiveCount > INACTIVE_TIME && startTime > START_TIME_LIMIT) {
    deer.active = true;
  }
}

function drawWand(speed) {
  push();
  translate(mouseX, mouseY);
  var a = pmouseX - mouseX;
  var b = pmouseY - mouseY;
  var distance = sqrt((a*a) + b*b);
  var thisRotation = lerp(map(distance, 0, 200, 0.03, 0.4*TWO_PI), lastRotation, 0.95);
  wandRotation += thisRotation;
  lastRotation = thisRotation;
  rotate(wandRotation);
  fill(255,255, 0, 255);
  star(0, 0, brushWidth*0.5, brushWidth, 5);
  fill(255,255, 0, 137);
  ellipse(0, 0, brushWidth*2);
  pop();
}

function restart() {
  $('.final-message').removeClass('active');
  completed = false;
  startTime = 0;
  initialize();
}

function draw() {
  if (started) {
    if (!rendered) {
      rendered = true;
      initialize();
    }
  }
  if (started && checkComplete()) {
    if (!completed) {
      $('.final-message').addClass('active');
      completed = true;
    }
  }
  if (!ARTSY) {
    background(0)
  }
  if(started && !completed) {
    drawWand();
    checkInactive();
  }
  wind = sin(frameCount / 80) / 2;
  if (frameCount % 6 === 0) {
    if (DEBUG) {
      $('.fps').html(frameRate().toFixed(2) + '<br>' + falling.length);
    }
    if (ADD_PARTICLES) {
      var numberOfParticles = 5;
      if (MOBILE) {
        numberOfParticles = 2;
      }
      for (var i=0; i < numberOfParticles; i++) {
        addSnowParticle();
      }
    }
  }
  for(var i = particles.length - 1; i >= 0; i--) {
    var particle = particles[i];
    if (mouseX !== pmouseX || mouseY !== pmouseY) {
      moved = true;
    }
    var a = particle.y * pixelWidth - (mouseY - mainOffsetY);
    var b = particle.x * pixelWidth - (mouseX - mainOffsetX/2);

    if (moved && sqrt((a*a) + b*b) < brushWidth) {
      if (particle.drawCountdown < 2) {
        falling.push(particle);
        particle.touched = true;
        particles.splice(i, 1);
      }
    }
    if (deer.active) {
      if (abs((deer.x - mainOffsetX/2) - particle.x * pixelWidth) < pixelWidth*2.5) {
        falling.push(particle);
        particle.touched = true;
        particles.splice(i, 1);
      }
    }
    particle.update();
    particle.display();
  }

  for(var i=falling.length-1; i>=0; i--) {
    var fallingParticle = falling[i];
    if (fallingParticle.toRemove) {
      falling.splice(i, 1);
    }
    if (!fallingParticle.active) {
      if (inactive.length > INACTIVE_LIMIT) {
        inactive.shift();
      }
      inactive.push(fallingParticle);
      falling.splice(i, 1);
    }
    fallingParticle.update();
    fallingParticle.display();
  };

  inactive.forEach(function(particle) {
    particle.display();
  });

  if (SKYLINE) {
    skylineParticles.forEach(function(particle) {
      particle.display();
    });
  }
  deer.display();
}

function setGradient(x, y, w, h) {
  noFill();
  c1 = color(0, 0, 0);
  c2 = color(20, 20, 20);
  for (var i = y; i <= y+h; i++) {
    var inter = map(i, y, y+h, 0, 1);
    var c = lerpColor(c1, c2, inter);
    stroke(c);
    line(x, i, x+w, i);
  }
}

function Reindeer() {
  this.reset = function() {
    this.x = -reindeer.width;
    this.y = height/3;
    this.active = false;
  }
  this.x = -reindeer.width;
  this.y = height/3;
  this.active = false;
  this.rotation = PI;
  this.display = function() {
    var offSet = pixelWidth*1.5;
    if (MOBILE) {
      offSet = pixelWidth*0.8;
    }
    if (this.active) {
      this.x += offSet;
      this.y -= offSet/3;
      push();
      translate(this.x, this.y);
      this.rotation = sin(frameCount/3)*0.1;
      rotate(this.rotation);
      fill(255, 0, 0);
      image(reindeer, 0, 0, reindeer.width*0.8, reindeer.height*0.8);
      pop();
    }
  }
}

function checkComplete() {
  return particles.length === 0;
}

function initialize() {
  $('.skyline').addClass('active');
  if (MOBILE) {
    logo = mobile;
    skyline = skylineMobile;
    addParticles(3);
  } else {
    addParticles(2);
  }
  deer.reset();
  if (SKYLINE) {
    generateSkyline();
  }
  moved = false;
}

function mouseClicked() {
  started = true;
  $('.welcome-message').removeClass('active');
}

function touchStarted() {
  started = true;
  $('.welcome-message').removeClass('active');
}

$('.restart').on('click', function() {
  restart();
});

function calculateSkylineLocationY(particle) {
  return (particle.y - particle.height)*particle.pixelWidth + height - skylineOffset;
}

function SkylineParticle(x, y, skylineHeight) {
  this.x = x;
  this.y = y;
  this.letter = generateLetter()
  this.touched = false;
  this.height = skylineHeight;
  this.pixelWidth = pixelWidth
  this.display = function() {
    if (this.touched) {
      stroke(255);
      noStroke();
    }
  }
}

function checkSkylineIntersect(x, y) {
  if (skylineParticles.length === 0) {
    return false;
  }
  if (y * pixelWidth + mainOffsetY < height - skyline.height * pixelWidth) {
    return false;
  }
  for (var i=0; i<skylineParticles.length; i++) {
    var particle = skylineParticles[i];
    if (abs(particle.x - (mainOffsetX / 4 / pixelWidth) - x) < 1) {
      if (y * pixelWidth + mainOffsetY > calculateSkylineLocationY(particle)) {
        skylineParticles[i].touched = true;
        return true;
      }
    }
  }
  return false;
}

function Particle(x, y, fontSize) {
  this.x = x;
  this.y = y;
  this.touched = false;
  this.toRemove = false;
  this.active = true;
  this.generated = false;
  this.offSetY = mainOffsetY;
  this.fontSize = fontSize;
  this.randomSeed = floor(random(0, 200))
  this.drawCountdown = ((x + (x * y)) / 100 )+ Math.floor(random(10,40));
  this.pixelWidth = pixelWidth;
  this.letter = generateLetter();
  this.radius = random(2,3);
  this.windFactor = random(0.2,0.7);
  this.fallSpeed = random(0.15, 0.5);
  this.initialAngle = random(0, 2 * PI);
  this.update = function() {
    if (this.drawCountdown > 0) {
      this.drawCountdown -= 1;
    }
    if (this.touched) {
      this.fallTime += 1;
      if (this.y * pixelWidth > height) {
        this.toRemove = true;
      } else if (SKYLINE) {
        if (!checkSkylineIntersect(this.x, this.y)) {
        var angle = (frameCount/20) + this.initialAngle;
        this.x = this.x + ((sin(angle) / this.radius) - wind*this.windFactor);
        this.y = this.y + (this.fallSpeed) + random(0,0.2);
        }
      } else if (!SKYLINE) {
        if (!this.y * this.pixelWidth < height) {
          var angle = (frameCount/20) + this.initialAngle;
          this.x = this.x + ((sin(angle) / this.radius) - wind*this.windFactor);
          this.y = this.y + (this.fallSpeed) + random(0,0.2);
        }
      } else {
        this.active = false;
      }
    }
  }
  this.display = function() {
    textSize(this.fontSize);
    if (this.drawCountdown > 0) {
      return;
    }
    if (this.touched) {
      fill(255);
    } else {
      if ((this.randomSeed + frameCount) % 100 === 0) {
        this.letter = generateLetter();
      }
      fill(255,255,0);
    }
    text(this.letter, mainOffsetX/2 + this.x*pixelWidth, mainOffsetY + this.y*pixelWidth);
  }
}
