module Promises {
    class Promise {
        //  Callbacks for this promise
        private callbacks       : array = [];
        //  Resolved status
        private success         : bool  = false;
        //  Data this promise was resolved with
        private successResponse : obj   = null;
        //  Error status
        private error           : bool  = false;
        //  Data this promise was errored out with
        private errorResponse   : obj   = null;

        constructor() {
            var self = this;

            //  Binding all methods to promise instance
            for( var p in this ) {
                if( /function/i.test( this[p] ) ) {
                    this[p] = (function(p) {
                        return function() {
                            //  For both types of promises
                            return Object.getPrototypeOf( self )[p].apply( self, arguments );
                        }
                    })( p );
                }
            }
        }

        //  ## Method done
        //  ### Arguments
        //  - suc: success data
        //  - err: error data
        done( suc, err ) {
            if( err ) this.deny( err );
            if( suc ) this.resolve( suc );
        }

        //  ## Method resolve
        //  ### Arguments
        //  - response: success data
        resolve( response ) {
            this.success            = true;
            this.successResponse    = response;

            while( this.callbacks.length ) {
                this.callbacks.shift()( response );
            }
        }

        //  ## Method deny
        //  ### Arguments
        //  - error: error data
        deny( error ) {
            this.error          = true;
            this.errorResponse  = error;
        }

        //  ## Method then
        //  Then allows the continuous chaining of callbacks for this particular
        //  promise.
        //  ### Arguments
        //  - callback:
        then( callback: func, scope: obj = this ) {
            this.callbacks.push( function() { callback.apply( scope, arguments ); } );
            if( this.success ) return this.resolve( this.successResponse, this );
            return this;
        }
    }

    //  class ChainablePromise
    //  Takes a collection of methods and returns a promise for all of them
    class ChainablePromise extends Promise {
        constructor( private chain: PromiseChain ) {
            super();
            //  Start the chain
            this.resolved();
            return this;
        }

        //  ## Method resolved
        //  Internal method for handling internal methods and their
        //  returning values (which can be a promise, or data).
        private resolved( data ) {
            //  The next method/promise in the chain
            var next    = this.chain.shift(),
                current = next ? next( data ) : null;

            //  If the chain is empty, resolve this promise
            if( !this.chain.length && !current ) return this.resolve( data );

            //  If the method is a promise
            if( current.then ) {
                //  Wait for the resolution before continuing
                current.then( this.resolved, this );
            }
            else {
                //  If it's not a promise, just skip to the next
                //  in the chain
                this.resolved( current );
            }
        }
    }

    //  class PromiseFactory
    //  Creates a regular Promise or Chainable Promise,
    //  based on arguments.
    class PromiseFactory {
        static create( chain ) {
            if( !chain ) return new Promise();

            return new ChainablePromise( chain );
        }
    }


    export var create = PromiseFactory.create;
}
