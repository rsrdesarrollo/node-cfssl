const http = require('http');

const API_URL_BASE='/api/v1/cfssl/';
const API_URL={
    info: API_URL_BASE+'info',
    newcert: API_URL_BASE+'newcert',
};
const API_METHOD={
    info: 'POST',
    newcert: 'POST'
};

var keepAliveAgent = new http.Agent({ keepAlive: true });

function cfssl_client(connect_opt) {
    if (typeof connect_opt === 'undefined' || typeof connect_opt !== 'object') {
        connect_opt={
            hostname: 'localhost',
            port: 8888
        }
    }

    connect_opt.agent = keepAliveAgent;

    this._conn_opt = connect_opt;
}

cfssl_client.prototype.__simple_http_request = function (req_type, callback) {
    this._conn_opt.path = API_URL[req_type];
    this._conn_opt.method = API_METHOD[req_type];

    var ret = http.request(this._conn_opt, function(res) {

        var data = '';
        res.on("data", function(chunk) {
            data += chunk;
        });

        res.on('end', function(){
            var ret = JSON.parse(data);
            if(ret.success){
                callback(null, ret.result);
            }else{
                callback(ret.errors);
            }
        });

    }).on('error', function(e) {
        callback(e);
    });

    return ret;
}

cfssl_client.prototype.info = function (label, optProfile, callback) {
    if (typeof callback === 'undefined') {
        callback = optProfile;
        optProfile = undefined;
    }

    var request = this.__simple_http_request('info', callback);

    request.write(JSON.stringify({
        lable:label,
        profile:optProfile
    }));
    request.end();
};

cfssl_client.prototype.newcert = function (csr, optLabel, optProfile, callback) {
    if (typeof callback === 'undefined') {
        if (typeof optProfile === 'undefined') {
            callback = optLabel;
            optLabel = undefined;
        }else{
            callback = optProfile;
            optProfile = undefined;
        }
    }

    var request = this.__simple_http_request('newcert', callback);
    request.write(JSON.stringify({
        request:csr,
        lable:optLabel,
        profile:optProfile
    }));
    request.end();
};

module.exports=cfssl_client;
