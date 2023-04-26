
class PID{
    constructor(targetValue,errorScale, kp,kd,ki){
        this.targetValue = targetValue;
        this.kp = kp;
        this.kd = kd;
        this.ki = ki;
        this.errorScale = errorScale;
         
        this._previousError = 0;
        this._integral = 0;
    }

    get lastError(){
        return this._previousError;
    }
    calculateError(currentValue){
        return this.targetValue-currentValue;
    }
    calculateOutput(currentValue){
        let error = this.calculateError(currentValue)/this.errorScale;
        this._integral+=error;
        let derivative = error - this._previousError;
        let output = this.kp*error + this.kd*derivative + this.ki*this._integral;
        this._previousError = error;
        return output; 
    }
}



var Engine = Matter.Engine,
    Render = Matter.Render,
    Runner = Matter.Runner,
    Bodies = Matter.Bodies,
    Body = Matter.Body,
    Constraint = Matter.Constraint,
    Vector = Matter.Vector,
    Events = Matter.Events,
    Composite = Matter.Composite;


// create an engine
var engine = Engine.create();

// create a renderer

var render = Render.create({
    element: document.body,
    engine: engine,
    options: {
        width: 800,
        height: 600,
        showAngleIndicator: true
    }
});

render.canvas.width = window.innerWidth;
render.canvas.height = window.innerHeight;
var a = 0;
// create two boxes and a ground
var boxA = Bodies.rectangle(400, 50, 70,20);
var boxB = Bodies.rectangle(480, 50, 30, 20);
var boxC = Bodies.rectangle(480, 50, 30, 20);
var ground = Bodies.rectangle(window.innerWidth/2,window.innerHeight-50,window.innerWidth-100, 20, { isStatic: true });
var target = Bodies.circle(window.innerWidth/2+10,100,10,{isStatic: true});
target.collisionFilter = {
    'group': -1,
    'category': 2,
    'mask': 0,
  };
boxB.collisionFilter = {
    'group': -1,
    'category': 2,
    'mask': 0,
  };
boxC.collisionFilter = {
    'group': -1,
    'category': 2,
    'mask': 0,
  };



// add all of the bodies to the world
Composite.add(engine.world, [boxA,boxC, boxB,ground,target]);

// run the renderer
Render.run(render);

// create runner
var runner = Runner.create();

// run the engine
Runner.run(runner, engine);

window.addEventListener('keypress', (event) => {
    var name = event.key;
    var code = event.code;
    // Alert the key name and key code on keydown
    mag = 0.005;
    var thres = 10;
    theta = boxA.angle-Math.PI/2;
    x = mag*(Math.cos(theta));
    y = mag*(Math.sin(theta));
    var force = Vector.create(x,y);
    
    if(code=="KeyW"){
        Body.applyForce(boxA,{x:boxA.position.x-30,y:boxA.position.y},force);
        Body.applyForce(boxA,{x:boxA.position.x+30,y:boxA.position.y},force);
     
    }
    if(code=="KeyD"){
        // roll_control(a);
        Body.applyForce(boxA,{x:boxA.position.x-20,y:boxA.position.y},force);
        // a+=0.1;

    }
    if(code=="KeyA"){
        // roll_control(a);
        // a-=0.1;
        Body.applyForce(boxA,{x:boxA.position.x+20,y:boxA.position.y},force);
    }
    if(code=="KeyR"){
        console.log(boxA)%(2*Math.PI);
        Body.setAngle(boxA,0);
        Body.setVelocity(boxA,{x:0,y:0});
        Body.setPosition(boxA,{x:window.innerWidth/2,y:700});
        Body.setPosition(boxA,target.position);

       
    }
    if(code=="KeyS"){
        const force = Vector.create(-x,-y);
        Body.applyForce(boxA,{x:boxA.position.x+50,y:boxA.position.y},force);
        Body.applyForce(boxA,{x:boxA.position.x-50,y:boxA.position.y},force);

    }
    if(code=="KeyL"){
        // y_control(target.position.y)
        roll_control(0);
        
    }
    if(code=="KeyM"){
        y_control(target.position.y)


    }
    if(code=="KeyC"){
        roll_control(0);
        roll_control(0.15);
    }
    if(code=="KeyX"){
        roll_control(0);
        roll_control(-0.15);
    }
    if(code=="KeyB"){
        x_control(target.position.x)
    }
  }, false);

  /** This function sets up our sketch. */
// function setup() {
//     createCanvas(innerWidth-50, innerHeight-50);
// }
function err(p1,p2){
    return Math.sqrt((p1.x-p2.x)**2+(p1.y-p2.y)**2);

}
theta = boxA.angle;
Events.on(engine, 'afterUpdate', function(event){
    Body.setPosition(boxB,{x:(boxA.position.x)+50*Math.sin(theta),y:boxA.position.y-50*Math.cos(theta)});
    Body.setAngle(boxB,theta)

    Body.setPosition(boxC,{x:(boxA.position.x)-50*Math.sin(theta),y:boxA.position.y+50*Math.cos(theta)});
    Body.setAngle(boxC,theta)
    // Body.setPosition(boxC,{x:boxA.position.x-130,y:boxA.position.y})

});

function x_control(){
    phi = 
    xm = new PID(target.position.x,2,0.5,50,0.01);
    Events.on(engine,'afterUpdate',function(event){
        let xf = xm.calculateOutput(boxA.position.x);
        console.log(xf)
        roll_control((xf*0.00005))

         
    })
}



function y_control(pos){
    ym = new PID(pos, 3 , 5, 100, 0.09); //    ym = new PID(pos, 3 , 7, 100, 0.09);

    Events.on(engine, 'afterUpdate', function(event){
        theta = boxA.angle-Math.PI/2;
        let yf = ym.calculateOutput(boxA.position.y);
        
        // yf = Math.min(Math.max(yf, -0.0025), 0);

        console.log(yf)
        x = -0.00001*yf*(Math.cos(theta));
        y = -0.00001*yf*(Math.sin(theta));
        var force = Vector.create(x,y);
        Body.applyForce(boxA,{x:boxA.position.x+50,y:boxA.position.y},force);
        Body.applyForce(boxA,{x:boxA.position.x-50,y:boxA.position.y},force);


   
        
    });
    
}

function roll_control(orient){
    am = new PID(orient, 2 , 3, 70, 0);

        Events.on(engine, 'afterUpdate', function(event){
            theta = boxA.angle-Math.PI/2;
            let af = am.calculateOutput(boxA.angle);
            // let xf = xm.calculateOutput(boxA.position.x);
            
            // yf = Math.min(Math.max(yf, -0.0025), 0);
            
            y = -Math.abs(0.001*af*(Math.sin(theta)));
            // console.log(af)
            if (af<0){
                x = Math.abs(0.005*af*(Math.cos(theta)));

                var force = Vector.create(x,y);

                // console.log("negative")
                Body.applyForce(boxA,{x:boxA.position.x+30,y:boxA.position.y},force);

            }
            else{
                // console.log("positive")
                x = -Math.abs(0.005*af*(Math.cos(theta)));
                var force = Vector.create(x,y);
                Body.applyForce(boxA,{x:boxA.position.x-30,y:boxA.position.y},force);
            }
            Body.applyForce(boxA,{x:boxA.position.x+30,y:boxA.position.y},{x:0,y:0});
             
            Body.applyForce(boxA,{x:boxA.position.x-30,y:boxA.position.y},{x:0,y:0});
        });

}

