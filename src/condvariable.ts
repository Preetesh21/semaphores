
function condToFunc(cond:any) {
	if (typeof cond === 'function') {
		return cond;
	}

	if (typeof cond === 'number' || typeof cond === 'boolean' || typeof cond === 'string') {
		return function (value:any) {
			return value === cond;
		};
	}

	if (cond && typeof cond === 'object' && cond instanceof RegExp) {
		return function (value:any) {
			return cond.test(value);
		};
	}

	throw new TypeError('Unknown condition type: ' + (typeof cond));
}
class CondVariable {
	public _value:boolean;
	public _waiting:Array<()=>void>

	constructor(initialValue:boolean){
	this._value = initialValue;
	this._waiting = [];
}

public get = function () {
	return this._value;
};


public wait = function (cond:any, cb:()=>void) {
	var test = condToFunc(cond);

	if (test(this._value)) {
		return cb.call(this);
	}

	this._waiting.push({ test: test, cb: cb });
};


public set = function (value:any) {
	this._value = value;

	for (var i = 0; i < this._waiting.length; i++) {
		var waiter = this._waiting[i];

		if (waiter.test(value)) {
			this._waiting.splice(i, 1);
			i -= 1;
			waiter.cb.call(this);
		}
	}
};
}

export {CondVariable as CondVariable};