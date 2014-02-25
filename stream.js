var ntwitter = require("ntwitter"),
    credentials = require("./credentials.json"),
    Readable = require("stream").Readable,
    FunctionalStream = require("./functional_stream.js"),
    util = require("util");

function TweetStream (credentials, streamType, streamOptions) {
    Readable.call(this, {"objectMode": true});
    this._streamType = streamType;
    this._streamOptions = streamOptions;
    this._ntwitter = new ntwitter(credentials);
}
util.inherits(TweetStream, Readable);

TweetStream.prototype._read = function () {
    var that = this;

    if (!this._stream) {
        this._ntwitter.stream(this._streamType, this._streamOptions, function (stream) {
            that._stream = stream;
            stream.on("data", function (tweet) {
                that.push(tweet);
            });
        });
    }
}

var source = new FunctionalStream(new TweetStream(credentials, "statuses/filter", {"track":["awesome"]}));

source.throttle(500).map(function (tweet) {
    return tweet.text;
}).forEach(function (tweet) {
    console.log(tweet);
});
