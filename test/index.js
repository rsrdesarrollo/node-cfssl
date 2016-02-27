/**
 * Created by rsrdesarrollo on 2/23/16.
 */
var pem = require('pem');
var Cfssl_cli = require('../');

var cli = new Cfssl_cli();

exports.test_info_with_no_errors = function(test) {
    test.expect(1);
    cli.info("default", function(err, res){
        test.equal(err, null, 'Error in info: '+err);
        test.done();
    });
};


exports.test_newcert_with_no_errors = function (test){
    test.expect(1);
    var csr = {
        CN: 'www.example.com',
        hosts:['www.example.com'],
        names:[{
            C: 'CO',
            ST: 'State',
            L: 'Location',
            O: 'Organization',
            OU: 'Org Unit'
        }],

        key: {
            algo: 'rsa',
            size: 2048
        }
    };
    cli.newcert(csr, function(err, res){
        test.equal(err, null, 'Error in newcert: '+err);
        test.done();
    });
};


exports.test_sign_with_no_errors = function (test){
    pem.createCSR({
        keyBitsize: 2048,
        country: 'CO',
        state: 'State',
        locality: 'Locality',
        organization:'Org',
        organizationUnit: 'OrgUnit',
        commonName: 'client.cfssl'

    }, function(error, resp){

        cli.sign(resp.csr, function(err, res){
            test.equal(err, null, 'Error in sign '+err);

            if(err)
                return test.done();

            pem.readCertificateInfo(res.certificate, function(err, cert){
                test.equal(cert.commonName, 'client.cfssl', 'Diferent commonName');
                test.done();
            });
        });
    });
};


exports.test_init_ca_with_no_errors = function (test){
    test.expect(1);

    cli.init_ca(
        ["example.com"],
        [{
            C: 'CO',
            ST: 'State',
            L: 'Location',
            O: 'Organization',
            OU: 'Org Unit'}],
        {
            key: {
                algo: 'ecdsa',
                size: 384
            },
            CA: {
                Expiry: '720h'
            }
        },
        function (err, res) {
            test.equal(err, null, "Error in init_ca: "+err);
            test.done();
        }
    );
};