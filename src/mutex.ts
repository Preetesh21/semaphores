class Mutex{
	public _isLocked:boolean;
	public _waiting:Array<()=>void>

	constructor(){
	this._isLocked = false;
	this._waiting = [];
}

public lock = function (cb:()=>any) {
	if (this._isLocked) {
		this._waiting.push(cb);
	} else {
		this._isLocked = true;
		cb.call(this);
	}
};



public tryLock = function () {
	if (this._isLocked) {
		return false;
	}

	this._isLocked = true;
	return true;
};


public unlock = function () {
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

public resetQueue = function() {
	this._isLocked=false;
	this._waiting = [];
};


}
export {Mutex as Mutex};
