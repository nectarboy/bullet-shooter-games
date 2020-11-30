
class entity {

	constructor(w,h,x,y,accel,frict,jump,grav) {
		this.w = w;
		this.h = h;
		this.x = x;
		this.y = y;
		this.accel = accel;
		this.frict = frict;
		this.jump = jump;
		this.grav = grav;

		this.animationTick = 0;
		this.lookingRight = 0;
		this.onGround = false;
	}
}