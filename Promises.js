var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Promises;
(function (Promises) {
    var Promise = (function () {
        function Promise() {
            this.callbacks = [];
            this.success = false;
            this.successResponse = null;
            this.error = false;
            this.errorResponse = null;
            var self = this;
            for(var p in this) {
                if(/function/i.test(this[p])) {
                    this[p] = (function (p) {
                        return function () {
                            return Object.getPrototypeOf(self)[p].apply(self, arguments);
                        };
                    })(p);
                }
            }
        }
        Promise.prototype.done = function (suc, err) {
            if(err) {
                this.deny(err);
            }
            if(suc) {
                this.resolve(suc);
            }
        };
        Promise.prototype.resolve = function (response) {
            this.success = true;
            this.successResponse = response;
            while(this.callbacks.length) {
                this.callbacks.shift()(response);
            }
        };
        Promise.prototype.deny = function (error) {
            this.error = true;
            this.errorResponse = error;
        };
        Promise.prototype.then = function (callback, scope) {
            if (typeof scope === "undefined") { scope = this; }
            this.callbacks.push(function () {
                callback.apply(scope, arguments);
            });
            if(this.success) {
                return this.resolve(this.successResponse, this);
            }
            return this;
        };
        return Promise;
    })();    
    var ChainablePromise = (function (_super) {
        __extends(ChainablePromise, _super);
        function ChainablePromise(chain) {
                _super.call(this);
            this.chain = chain;
            this.resolved();
            return this;
        }
        ChainablePromise.prototype.resolved = function (data) {
            var next = this.chain.shift(), current = next ? next(data) : null;
            if(!current) {
                return this.resolve(data);
            }
            if(current.then) {
                current.then(this.resolved, this);
            } else {
                this.resolved(current);
            }
        };
        return ChainablePromise;
    })(Promise);    
    var PromiseFactory = (function () {
        function PromiseFactory() { }
        PromiseFactory.create = function create(chain) {
            if(!chain) {
                return new Promise();
            }
            return new ChainablePromise(chain);
        };
        return PromiseFactory;
    })();    
    Promises.create = PromiseFactory.create;
})(Promises || (Promises = {}));
