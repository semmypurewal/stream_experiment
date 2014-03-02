var stream = require("stream"),
    util = require("util"),
    Transform = stream.Transform;

function createTransformStream(transform) {
    var TransformStream = function () {
        Transform.call(this, {"objectMode":true});
    }
    util.inherits(TransformStream, Transform);

    TransformStream.prototype._transform = function (data, encoding, done) {
        transform.call(this, data);
        done();
    }
    
    return function () {
        this._source = this._source.pipe(new TransformStream);
        return this;
    }    
};

function FunctionalStream(rs) {
    this._source = rs;
};

FunctionalStream.prototype.filter = function (filter) {
    return createTransformStream (function (data) {
        if (filter(data)) {
            this.push(data);
        }
    }).call(this);
};

FunctionalStream.prototype.map = function (mapper) {
    return createTransformStream (function (data) {
        this.push(mapper(data));
    }).call(this);
};

FunctionalStream.prototype.forEach = function (func) {
    return createTransformStream (function (data) {
        func(data);
        this.push(data);
    }).call(this);
};

FunctionalStream.prototype.throttle = function (ms) {
    var last = Date.now();

    return createTransformStream (function (data) {
        var curr = Date.now();
        if ((curr - last) > ms) {
            this.push(data);
            last = curr;
        }
    }).call(this);
};

module.exports = FunctionalStream;
