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