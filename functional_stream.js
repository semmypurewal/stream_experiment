var stream = require("stream"),
    util = require("util"),
    Transform = stream.Transform;

function ObjectTransformStream(transform) {
    var ResultStream = function (func) {
        Transform.call(this, {"objectMode":true});
        this._func = func;
    }
    util.inherits(ResultStream, Transform);
    ResultStream.prototype._transform = function (data, encoding, done) {
        transform.call(this, data);
        done();
    }
    
    return ResultStream;
};

function createFunction (transform) {
    var transformConstructor = ObjectTransformStream(transform);
    
    return function (func) {
        this._source = this._source.pipe(new transformConstructor(func));
        return this;
    }
};

function FunctionalStream(rs) {
    this._source = rs;
};

FunctionalStream.prototype.filter = createFunction (function (data) {
    if (this._func(data)) {
        this.push(data);
    }
});

FunctionalStream.prototype.map = createFunction (function (data) {
    this.push(this._func(data));
});

FunctionalStream.prototype.forEach = createFunction (function (data) {
    this._func(data);
    this.push(data);
});

FunctionalStream.prototype.throttle = function (ms) {
    var last = Date.now();

    return createFunction (function (data) {
        var curr = Date.now();
        if ((curr - last) > ms) {
            this.push(data);
            last = curr;
        }
    }).call(this, function () {});
};

module.exports = FunctionalStream;
