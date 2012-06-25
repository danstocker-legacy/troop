/**
 * Property management unit tests
 */
/*global troop, module, test, equal, deepEqual, raises */
(function ($properties) {
    module("Properties");

    test("Promise", function () {
        var ns = {},
            tmp;

        $properties.promise(ns, 'test', function () {
            return "foo";
        });

        equal(typeof Object.getOwnPropertyDescriptor(ns, 'test').value, 'undefined', "Value before fulfilling promise");

        // first access will fulfill the promise
        equal(ns.test, "foo", "Accessing for the first time");
        equal(Object.getOwnPropertyDescriptor(ns, 'test').value, "foo", "Property value after promise is fulfilled");
    });

    test("Utils", function () {
        var tmp = {};
        $properties._assign(tmp, 'foo', {value: "bar"});
        deepEqual(
            Object.getOwnPropertyDescriptor(tmp, 'foo'),
            {
                value: "bar",
                writable: true,
                enumerable: true,
                configurable: true
            },
            "Assigned property descriptor"
        );

        equal($properties._addPrefix('test', '_'), '_test', "Prefixed string w/o prefix");
        equal($properties._addPrefix('_test', '_'), '_test', "Prefixed string w/ prefix");
    });

    test("Flags set", function () {
        var tmp = {},
            descriptor;

        $properties.add.call(tmp, {
                test: function () {}
            },
            true,
            true,
            true
        );

        descriptor = Object.getOwnPropertyDescriptor(tmp, 'test');

        equal(typeof descriptor.value, 'function', "Value type");
        equal(descriptor.writable, true, "Writable");
        equal(descriptor.enumerable, true, "Enumerable");
        equal(descriptor.configurable, true, "Configurable");
    });

    test("Prefixed", function () {
        var tmp = {},
            descriptor;

        $properties.add.call(tmp, {
                test: function () {}
            },
            true,
            true,
            true,
            '_'
        );

        equal(tmp.hasOwnProperty('test'), false, "Property by given name doesn't exist");
        equal(tmp.hasOwnProperty('_test'), true, "Prefixed property name exists");

        descriptor = Object.getOwnPropertyDescriptor(tmp, '_test');

        equal(typeof descriptor.value, 'function', "Value type");
        equal(descriptor.writable, true, "Writable");
        equal(descriptor.enumerable, true, "Enumerable");
        equal(descriptor.configurable, true, "Configurable");

        $properties.add.call(tmp, {
                _hello: function () {}
            },
            true,
            true,
            true,
            '_'
        );

        equal(tmp.hasOwnProperty('_hello'), true, "Prefixed property name exists");
    });

    test("Adding methods", function () {
        var tmp = {},
            result;

        result = $properties.addMethod.call(tmp, {
            foo: function () {}
        });

        equal(result, tmp, "addMethod returns input object");
    });

    test("Flags not set", function () {
        var tmp = {},
            descriptor;

        $properties.add.call(tmp, {
            test: function () {}
        });

        descriptor = Object.getOwnPropertyDescriptor(tmp, 'test');

        equal(typeof descriptor.value, 'function', "Value type");
        equal(descriptor.writable, false, "Writable");
        equal(descriptor.enumerable, false, "Enumerable");
        equal(descriptor.configurable, false, "Configurable");
    });

    test("Sloppy", function () {
        troop.sloppy = true;

        var tmp = {},
            descriptor;

        $properties.add.call(tmp, {
            test: function () {}
        });

        descriptor = Object.getOwnPropertyDescriptor(tmp, 'test');

        equal(typeof descriptor.value, 'function', "Value type");
        equal(descriptor.writable, true, "Writable");
        equal(descriptor.enumerable, true, "Enumerable");
        equal(descriptor.configurable, true, "Configurable");

        troop.sloppy = false;
    });


    test("Class assembly", function () {
        var tmp = {};

        function testMethod() {}

        $properties.addMethod.call(tmp, {
            test: testMethod
        });

        $properties.addConstant.call(tmp, {
            foo: "foo"
        });

        $properties.addPrivate.call(tmp, {
            bar: "bar"
        });

        deepEqual(
            tmp,
            {
                test: testMethod,
                foo: "foo"
            },
            "Enumerable properties of class"
        );

        equal(tmp._bar, "bar", "Pseudo-private property added");
    });

    test("Mocks", function () {
        var tmp = {};

        function testMethod() {}

        $properties.addMock.call(tmp, {
            foo: testMethod
        });

        deepEqual(tmp, {
            foo: testMethod
        }, "Mock method added");

        $properties.removeMocks.call(tmp);

        deepEqual(tmp, {}, "Mock methods removed");
    });
}(
    troop.properties
));
