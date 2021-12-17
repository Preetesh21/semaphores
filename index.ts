// let n:string="hello";
// let age:number=12;

// console.log(age);




import { Mutex } from "./src/mutex";
import { Semaphore } from "./src/semaphore";
import { CondVariable } from "./src/condvariable";


import test from 'tape';

test('A passing test', (assert) => {

  assert.pass('This test will pass.');

  assert.end();
});

function testMany(t, cb:()=>void) {
	let sem= new Semaphore();

	//sem = locks.createSemaphore();  // default resources should be 1
	t.equal(sem._count, 1, 'Defaults to 2 available resources');

	sem = new Semaphore(2);  // 2 available resources
	t.equal(sem._count, 2, 'Created with 2 available resources');

	function fn() {
		process.nextTick(function () {
			sem.signal();
		});
	}

	for (var i = 0; i < 100; i++) {
		sem.wait(fn);
	}

	setTimeout(function () {
		t.equal(sem._count, 2, 'Still 2 available resources');
		t.equal(sem._waiting.length, 0, 'Nobody waiting');
		cb();
	}, 0);
}


test('Semaphore', function (t) {
	testMany(t, function () {
		t.end();
	});
});

var trueTest = function (value) { return value === true; };
var falseTest = function (value) { return value === false; };

function testny(t, cb:()=>void) {
	var cond = new CondVariable(false);
	var timerFired = false;

	t.throws(function () {
		cond.wait({}, function () {});
	}, 'Objects are not valid conditions to wait for')

	t.equal(cond.get(), false, 'Condition starts false');

	cond.wait(trueTest, function () {
		t.equal(this.get(), true, 'Condition is true');

		cond.set(null);

		var fired = 0;
		var expect = 4;

		cond.wait('foo', function () {
			t.equal(this.get(), 'foo', 'String matching');
			fired += 1;
		});

		cond.wait(/foo/, function () {
			t.equal(this.get(), 'foo', 'RegExp matching');
			fired += 1;
		});

		cond.wait(5, function () {
			t.equal(this.get(), 5, 'Number matching');
			fired += 1;
		});

		cond.wait(false, function () {
			t.equal(this.get(), false, 'Boolean matching');
			fired += 1;
		});

		cond.set('foo');
		cond.set(5);
		cond.set(false);

		t.equal(fired, 4, 'All match types fired');

		t.end();
	});

	cond.wait(falseTest, function () {
		t.equal(this.get(), false, 'Condition is false');
		t.equal(timerFired, false, 'Timer has not yet fired');
	});

	setTimeout(function () {
		timerFired = true;
		cond.set(true);
	}, 10);
};

test('CondVariable', function (t) {
	testny(t, function () {
		t.end();
	});
});

function testany(t, cb:()=>void) {
	var mutex = new Mutex();

	t.equal(mutex._isLocked, false, 'Unlocked');

	var unlockedByNextLock = false;
	var instantTimedLockSuccess = false;

	t.throws(function () {
		mutex.unlock();
	}, 'Cannot unlock an unlocked mutex');

	mutex.lock(function () {
		unlockedByNextLock = true;
		t.equal(mutex._isLocked, true, 'Locked');

		var success = mutex.tryLock();

		t.equal(success, false, 'Try failed');

		mutex.unlock();

		success = mutex.tryLock();

		t.equal(success, true, 'Try succeeded');
	});
	
	mutex.lock(function () {
		t.equal(mutex._isLocked, true, 'Locked');
	});
	
	var success = mutex.tryLock();
	t.equal(success, false, 'Try failed');
	
	mutex.resetQueue();
	t.equal(mutex._isLocked, false, 'Lock is waiting to be acquired');
};

test('Mutex', function (t) {
	testany(t, function () {
		t.end();
	});
});