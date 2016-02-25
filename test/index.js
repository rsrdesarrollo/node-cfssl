/**
 * Created by rsrdesarrollo on 2/23/16.
 */
var pem = require('pem');
var Cfssl_cli = require('../');

var cli = new Cfssl_cli();

exports.test_info_with_no_errors = function(test) {
    test.expect(1);
    cli.info("default", function(err, res){
        test.notEqual(res, null, "Result from info query is null.");
        test.done();
    });
};


exports.test_newcert_with_no_errors = function (test){
    //test.expect(1);
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
        test.notEqual(res, null, "Result from newcert query is null.");
        if(err){
            test.ok(false, 'Error '+JSON.stringify(err));
        }
        test.done();
    });
};

exports.test_sign_with_no_errors = function (test){
    test.expect(2);

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
            test.notEqual(res, null, "Result from sign query is null.");
            if(!err){
                pem.readCertificateInfo(res.certificate, function(err, cert){
                    test.equal(cert.commonName, 'client.cfssl', 'Diferent commonName');
                    test.done();
                });
            }
        });
    });
};