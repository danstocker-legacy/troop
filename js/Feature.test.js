/**
 * Feature detection unit tests
 */
/*global troop, module, test, ok, equal, deepEqual, expect */
(function () {
    module("Feature detection");

    test("Covering RO properties", function () {
        var browser = navigator.userAgent.match(/(\w+)(?=\/[\w\.]+)/g).pop().toLowerCase();
        switch (browser) {
        case 'firefox':
            equal(troop.Feature.canAssignToReadOnly(), false, "Can't assign to RO property in Firefox");
            break;
        case 'safari':
            equal(troop.Feature.canAssignToReadOnly(), true, "Can assign to RO property in Safari/Chrome");
            break;
        }
    });

    test("Flags", function () {
        ok(troop.hasOwnProperty('testing'), "Testing flag exists");
        ok(troop.hasOwnProperty('writable'), "Writable flag exists");
    });
}());