function Mutex(this:any) {
	this._isLocked = false;
	this._waiting = [];
}

Mutex.prototype.lock = function (cb:()=>any) {
	if (this._isLocked) {
		this._waiting.push(cb);
	} else {
		this._isLocked = true;
		cb.call(this);
	}
};


Object.defineProperty(Mutex.prototype, 'isLocked', {
	get: function () {
		return this._isLocked;
	}
});

Mutex.prototype.tryLock = function () {
	if (this._isLocked) {
		return false;
	}

	this._isLocked = true;
	return true;
};


Mutex.prototype.unlock = function () {
	if (!this._isLocked) {
		throw new Error('Mutex is not locked');
	}
	var waiter = this._waiting.shift();
	
	if (waiter) {
		
		waiter.call(this);
	} else {
		this._isLocked = false;
	}
};

Mutex.prototype.resetQueue = function() {
	this._isLocked=false;
	this._waiting = [];
};

export {Mutex as Mutex};
