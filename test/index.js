/**
 * Created by rsrdesarrollo on 2/23/16.
 */

var cfssl_cli = require('../');

var cli = new cfssl_cli();

exports.test_info_with_no_errors = function(test) {
    test.expect(1);
    cli.info("default", function(err, res){
        test.notEqual(res, null, "Result from info query is null.");
        test.done();
    });
};


exports.test_newcert_with_no_errors = function (test){
    test.expect(1);
    var csr = {

    };
    cli.newcert(csr, function(err, res){
        test.notEqual(res, null, "Result from newcert query is null.");
        if(!err){
            console.log(JSON.stringify(res, null, ' '));
        }
        test.done();
    });
};