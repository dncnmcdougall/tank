/* eslint-env browser*/
/* global Vector */

const interval = 50;
const maxPos = Vector.toVec( 1200, 500);

var canvas = document.getElementById('canvas');
canvas.width = maxPos.x;
canvas.height = maxPos.y;
var ctx = canvas.getContext('2d');
ctx.setTransform(1,0, 0,-1,  0,maxPos.y);

let dP = 0;
let dA = 0;

window.onkeypress = (event) => {
    switch ( event.code ) {
        case "ArrowRight":
            dA = -5;
            break;
        case "ArrowLeft":
            dA = +5;
            break;
        case "ArrowUp":
            dP = + maxPos.x/200;
            break;
        case "ArrowDown":
            dP = - maxPos.x/200;
            break;
    }
};

var terr = []

var tank = {
    pos: Math.random()*maxPos.x,
    angle: 45,
    power: maxPos.x/20
};
tank.angle = tank.pos > maxPos.x/2? 135 : 45;

var projectile = {
    angle: 0,
    mult: 0
};
let projectilePos = [];

var getLandPosition = function( x ) {
    // CRC: This could be better: quadratic interpolation
    let i = 0;
    let prevI = 0;
    let t = 0;
    for( i in terr ) {
        if ( terr[i].x > x ) {
            t = (x - terr[prevI].x)/(terr[i].x - terr[prevI].x);
            return t*terr[i].y + (1-t)*terr[prevI].y;
        } else {
            prevI = i;
        }
    }
    return -1;
};

var updateProjectile = function() {
    var power = document.getElementById('power');
    power.innerHTML = "Power: "+tank.power;
    var angle = document.getElementById('angle');
    angle.innerHTML = "Angle: "+tank.angle;

    let theta = tank.angle;
    projectile.mult = 1;
    if ( theta > 90 ) {
        theta = 180 - theta;
        projectile.mult = -1;
    }
    projectile.angle = -theta*Math.PI/180;

    projectilePos = [];
    for( i = 1; i < max; i++ ) {
        if ( tank.pos < terr[i].x ) {
            break;
        }
    }
    if ( projectile.mult < 0 ) {
        i = i -1;
    }
    projectilePos.push( Vector.toVec(tank.pos, getProjectilePosition(tank.pos)) ); 
    while( i >= 0 && i < max ) {
        let dx = tank.pos - terr[i].x
        let pp =Vector.toVec(terr[i].x, getProjectilePosition(terr[i].x));
        if (pp.y < terr[i].y ) {
            let ppp = projectilePos[ projectilePos.length - 1];

            let a = (terr[i].y - pp.y)/(ppp.y-terr[i-projectile.mult].y);
            let t = 1/(a+1);

            projectilePos.push( Vector.multAdd(ppp, 1-t, pp, t) ); 
            break;
        }
        else
        {
            projectilePos.push( pp ); 
        }
        i = i + projectile.mult;
    }
};

var getProjectilePosition = function( x ) {
    let dx = projectile.mult*(tank.pos-x);
    let t = dx/(tank.power*Math.cos(projectile.angle));
    return tank.power*t*Math.sin(projectile.angle)
        - 10*Math.pow(t,2)
        + getLandPosition( tank.pos ) 
        + 10;
};

let max = 50;
let dy = 0.2;

let dx = maxPos.x/(max-1);
let previous = Math.random()*maxPos.y/2;
let i = 0;

for( i = 0; i< max; i++) {
    previous =  previous* (1 + (Math.random()-0.5)*dy);
    previous = previous<0? 0: previous;
    previous = previous>maxPos.y? maxPos.y: previous;
    terr.push( Vector.toVec(i*dx, previous) );
}

updateProjectile();

var timer = setInterval( () => {
    // Clear canvas
    ctx.fillStyle = '#000000';
    ctx.fillRect(0,0, maxPos.x, maxPos.y);
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(2,2, maxPos.x-4, maxPos.y-4);

    ctx.fillStyle = '#999999';
    ctx.beginPath()
    ctx.moveTo( terr[0].x, terr[0].y);
    for( i = 1; i< max; i++ ) {
        ctx.lineTo( terr[i].x, terr[i].y);
    }
    ctx.lineTo( maxPos.x, 0);
    ctx.lineTo( 0, 0);
    ctx.lineTo( terr[0].x, terr[0].y);
    ctx.fill();

    ctx.strokeStyle = '#FF0000';
    ctx.beginPath()
    ctx.moveTo( projectilePos[0].x, projectilePos[0].y);
    for( i in projectilePos ) {
        ctx.lineTo( projectilePos[i].x, projectilePos[i].y);
    }
    ctx.stroke();

    ctx.fillStyle = '#FF0000';
    ctx.beginPath()
    ctx.fillRect(projectilePos[i].x, projectilePos[i].y, 5, 5);

    ctx.fillStyle = '#0000FF';
    ctx.beginPath()
    ctx.fillRect(tank.pos, getLandPosition(tank.pos), 10, 10);

    if ( dP != 0 || dA != 0 )
    {
        tank.angle += dA;
        tank.power += dP;
        tank.angle = Math.max(0, Math.min(tank.angle,180));
        tank.power = Math.max(0, Math.min(tank.power,maxPos.x/5));

        updateProjectile();

        dP = 0;
        dA = 0;
    }

}, interval);
