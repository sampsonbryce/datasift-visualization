var Datasift = require('datasift-node');
var creds = require('./credentials.js');
var username = creds.username;
var key = creds.apiKey;
console.log('us, key', username, key);
setTimeout(function(){}, 3000)
var ds = new Datasift(username, key);
console.log('in datasift');

var filter = '( fb.content contains_any "wedding,engaged,engagement,marriage" \
          or fb.topics.name in "Wedding,Marriage" ) \
        OR ( fb.parent.content contains_any "wedding,engaged,engagement,marriage" \
          or fb.parent.topics.name in "Wedding,Marriage" )';

var hash;
// Compiles a stream from a CSDL definition:
function compileFilter(csdl) {
    ds.pylon.compile({
        'csdl': csdl
    }, function(err, response) {
        if (err)
            console.log(err);
        else {
            hash = response.hash;
            console.log("Filter hash: " + hash);
            startRecording();
        }
    });
}
var recordingId;

// Starts a recording from the compiled hash:
function startRecording() {
    ds.pylon.start({
        'hash': hash,
        'name': 'Quickstart example'
    }, function(err, response) {
        if (err)
            console.log(err);
        else {
            recordingId = response.id;
            console.log("Recording started, ID: " + recordingId);
        }
    });
}

// Initiate our script by compiling the filter, which in turn will start the recording
compileFilter(filter);
