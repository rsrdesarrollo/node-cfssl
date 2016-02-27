const http = require('http');

const API_URL_BASE='/api/v1/cfssl/';
const API_URL={
    info: API_URL_BASE+'info',
    newcert: API_URL_BASE+'newcert',
    sign: API_URL_BASE+'sign',
    init_ca: API_URL_BASE+'init_ca'
};
const API_METHOD={
    info: 'POST',
    newcert: 'POST',
    sign: 'POST',
    init_ca: 'POST'
};

var keepAliveAgent = new http.Agent({ keepAlive: true });

/**
 *
 * @param connect_opt
 * @constructor
 */
function Cfssl_client(connect_opt) {
    if (typeof connect_opt === 'undefined' || typeof connect_opt !== 'object') {
        connect_opt={
            hostname: 'localhost',
            port: 8888
        }
    }

    connect_opt.agent = keepAliveAgent;

    this._conn_opt = connect_opt;
}

/**
 *
 * @param req_type
 * @param callback
 * @returns {*}
 * @private
 */
Cfssl_client.prototype.__simple_http_request = function (req_type, callback) {
    this._conn_opt.path = API_URL[req_type];
    this._conn_opt.method = API_METHOD[req_type];

    return http.request(this._conn_opt, function (res) {

        /*
        // Disabled because of bad implementation on init_ca API
        if(res.headers['content-type'] !== 'application/json'){
            return callback('Error content-type: expected json get '+res.headers['content-type']);
        }
        */

        var data = '';
        res.on("data", function (chunk) {
            data += chunk;
        });

        res.on('end', function () {
            var ret = JSON.parse(data);
            if (ret.success) {
                callback(null, ret.result);
            } else {
                callback(new Error(ret.errors[0].message));
            }
        });

    }).on('error', function (e) {
        callback(e);
    });
};

/**
 *
 * @param label
 * @param optProfile
 * @param callback
 */
Cfssl_client.prototype.info = function (label, optProfile, callback) {
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

/**
 *
 * @param csr
 * @param {Object} [optOptions]
 * @param [optOptions.label]
 * @param [optOptions.profile]
 * @param callback
 */
Cfssl_client.prototype.newcert = function (csr, optOptions, callback) {
    if (typeof callback === 'undefined') {
        callback = optOptions;
        optOptions = {};
    }

    var request = this.__simple_http_request('newcert', callback);
    request.write(JSON.stringify({
        request:csr,
        lable:optOptions.label,
        profile:optOptions.profile
    }));
    request.end();
};

/**
 *
 * @param csr
 * @param {Object} [optOptions]
 * @param [optOptions.hosts]
 * @param [optOptions.serial_sequence]
 * @param [optOptions.label]
 * @param [optOptions.subject]
 * @param [optOptions.profile]
 * @param callback
 */
Cfssl_client.prototype.sign = function (csr, optOptions, callback){
    if (typeof callback === 'undefined') {
        callback = optOptions;
        optOptions = {};
    }

    var request = this.__simple_http_request('sign',callback);
    request.write(JSON.stringify({
        certificate_request:csr,
        hosts:optOptions.hosts,
        subject:optOptions.subject,
        serial_sequence: optOptions.serial_sequence,
        label: optOptions.label,
        profile:optOptions.profile
    }));
    request.end();
};

/**
 *
 * @param hosts
 * @param names
 * @param {Object} [optOptions]
 * @param [optOptions.CN]
 * @param [optOptions.key]
 * @param [optOptions.key.algo]
 * @param [optOptions.key.size]
 * @param [optOptions.CA]
 * @param [optOptions.CA.PathLength]
 * @param [optOptions.CA.Expiry]
 * @param callback
 */
Cfssl_client.prototype.init_ca = function (hosts, names, optOptions, callback){
    if (typeof callback === 'undefined') {
        callback = optOptions;
        optOptions = {};
    }

    var request = this.__simple_http_request('init_ca',callback);
    request.write(JSON.stringify({
        hosts:hosts,
        names:names,
        CN: optOptions.CN,
        key: optOptions.key,
        CA: optOptions.CA
    }));
    request.end();
};

module.exports=Cfssl_client;
