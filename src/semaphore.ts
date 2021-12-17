class semaphore{
	public _count:number;
	public _waiting:Array<()=>void>
    constructor (initialCount:number=1) {
	this._count = initialCount || 1;
	this._waiting = [];
}

public wait(cb:()=>any) {
	this._count -= 1;

	if (this._count < 0) {
		this._waiting.push(cb);
	} else {
		cb.call(this);
	}
};


public signal = function () {
	this._count += 1;

	if (this._count <= 0) {
		var waiter = this._waiting.shift();
		if (waiter) {
			waiter.call(this);
		}
	}
};
}

export {semaphore as Semaphore};