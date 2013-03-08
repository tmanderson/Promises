# PROMISES
A lightweight alternative to the many promise libraries out there. There's nothing really new here
and it's not according to the Promise/A spec, but the execution, idea, and event flow is the same.

- Written in and compiled by TypeScript
- Small size
- Promise resolution scope control

### Promise "and-thenning"
```
var promise = Promises.create();

promise
    .then( someFunction )
    .then( anotherFunction )
    .then( lastFunction )
```

Promise "and-thenning" is a string of ```thens``` called on one single root promise. When this
promise is resolved, each callback supplied will be executed in the order in which they were added.

**BONUS:**  Methods supplied to ```then``` do not need to return a promise. Anything they return is
            passed to the next function in the callback stack.

### Promise Chain
```
Promises.create([
    someFunction,
    anotherFunction,
    lastFunction
])
    .then( finalFunction );
```

A promise chain creates a single promise from a collection of many sync/async methods. The bonus here
is that a dependency chain can be created, regardless of a callback's returning value and sync/async status.
The below example shows this in action

```
Promises.create([
    function() {
        return "Starting!";
    },
    function(str) {
        var p = Promises.create();
        console.log(str);
        setTimeout( p.resolve, 2000 );
        return p;
    },
    function() {
        return "I should execute after ~2 seconds!";
    }
])
``

Above there's two sync callbacks that return strings and one pointless async callback which returns its promise.
Under the hood the sync methods are really just Promises that resolve immediately with their returning values.
This allows for dependency chains that have some callbacks that need to happen syncronously.

**BONUS:** Promises will maintain their scope, so the timeout above will resolve correctly within the Promises scope.
