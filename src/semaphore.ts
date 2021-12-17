function Semaphore(this:any,initialCount:number) {
	this._count = initialCount || 1;
	this._waiting = [];
}


Semaphore.prototype.wait = function (cb:()=>any) {
	this._count -= 1;

	if (this._count < 0) {
		this._waiting.push(cb);
	} else {
		console.log(this);
		cb.call(this);
	}
};


Semaphore.prototype.signal = function () {
	this._count += 1;

	if (this._count <= 0) {
		var waiter = this._waiting.shift();
		if (waiter) {
			waiter.call(this);
		}
	}
};


export {Semaphore as Semaphore};