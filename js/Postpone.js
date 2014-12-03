/*global dessert, troop */
(function () {
    "use strict";

    var hOP = Object.prototype.hasOwnProperty,
        slice = Array.prototype.slice;

    dessert.addTypes(/** @lends dessert */{
        /**
         * Determines whether a property descriptor is a getter-setter.
         * @param {object} propertyDescriptor
         */
        isSetterGetterDescriptor: function (propertyDescriptor) {
            return propertyDescriptor instanceof Object &&
                   hOP.call(propertyDescriptor, 'get') &&
                   hOP.call(propertyDescriptor, 'set') &&
                   hOP.call(propertyDescriptor, 'enumerable') &&
                   hOP.call(propertyDescriptor, 'configurable');
        },

        /**
         * Determines whether a property descriptor is a value property.
         * @param {object} propertyDescriptor
         */
        isValueDescriptor: function (propertyDescriptor) {
            return propertyDescriptor instanceof Object &&
                   hOP.call(propertyDescriptor, 'value') &&
                   hOP.call(propertyDescriptor, 'writable') &&
                   hOP.call(propertyDescriptor, 'enumerable') &&
                   hOP.call(propertyDescriptor, 'configurable');
        }
    });

    /**
     * @class troop.Surrogate
     * @ignore
     */
    troop.Amendments = {
        /**
         * Retrieves amendments from postponed definition.
         * Returns empty array when argument is not property descriptor or descriptor has no amendments assigned.
         * @param {object} [propertyDescriptor]
         * @returns {Array}
         */
        getAmendments: function (propertyDescriptor) {
            return dessert.validators.isSetterGetterDescriptor(propertyDescriptor) &&
                   propertyDescriptor.get.amendments ||
                   [];
        },

        /**
         * Sets amendments on postponed definition. Overwrites previous amendments.
         * @param {object} propertyDescriptor
         * @param {object[]} amendments
         */
        setAmendments: function (propertyDescriptor, amendments) {
            var propertyGetter = propertyDescriptor.get;
            propertyGetter.amendments = amendments;
        },

        /**
         * @param {object} propertyDescriptor
         * @param {function} modifier
         * @param {Array} modifierArguments
         */
        addAmendment: function (propertyDescriptor, modifier, modifierArguments) {
            var propertyGetter = propertyDescriptor.get;

            propertyGetter.amendments = propertyGetter.amendments || [];

            propertyGetter.amendments.push({
                modifier: modifier,
                args    : modifierArguments
            });
        },

        /**
         * Applies specified amendments to the specified property descriptor.
         * @param {object} propertyDescriptor
         * @param {object[]} amendments
         */
        applyAmendments: function (propertyDescriptor, amendments) {
            var i, amendment;

            if (amendments instanceof Array) {
                for (i = 0; i < amendments.length; i++) {
                    amendment = amendments[i];
                    amendment.modifier.apply(troop, amendment.args);
                }
            }
        }
    };

    troop.Base.addMethods.call(troop, /** @lends troop */{
        /**
         * Postpones a property definition on the specified object until first access.
         * Initially assigns a special getter to the property, then, when the property is accessed for the first time,
         * the property is assigned the return value of the generator function, unless a value has been assigned from
         * within the generator.
         * @param {object} host Host object.
         * @param {string} propertyName Property name.
         * @param {function} generator Generates (and returns) property value. Arguments: host object, property name,
         * plus all extra arguments passed to .postpone().
         * @example
         * var obj = {};
         * troop.postpone(obj, 'foo', function () {
         *    return "bar";
         * });
         * obj.foo // runs generator and alerts "bar"
         */
        postpone: function (host, propertyName, generator) {
            dessert
                .isObject(host, "Host is not an Object")
                .isString(propertyName, "Invalid property name")
                .isFunction(generator, "Invalid generator function");

            var Amendments = troop.Amendments,
                propertyDescriptorBefore = Object.getOwnPropertyDescriptor(host, propertyName),
                propertyDescriptorAfter,
                generatorArguments = slice.call(arguments);

            // preparing generator argument list
            generatorArguments.splice(2, 1);

            // placing class placeholder on namespace as getter
            propertyDescriptorAfter = {
                get: function getter() {
                    // obtaining property value
                    var value = generator.apply(this, generatorArguments),
                        amendments = getter.amendments;

                    if (typeof value !== 'undefined') {
                        // generator returned a property value
                        // overwriting placeholder with actual property value
                        Object.defineProperty(host, propertyName, {
                            value       : value,
                            writable    : false,
                            enumerable  : true,
                            configurable: false
                        });
                    } else {
                        // no return value
                        // generator supposedly assigned value to property
                        value = host[propertyName];
                    }

                    // applying amendments
                    Amendments.applyAmendments(propertyDescriptorAfter, amendments);

                    return value;
                },

                set: function (value) {
                    // overwriting placeholder with property value
                    Object.defineProperty(host, propertyName, {
                        value       : value,
                        writable    : false,
                        enumerable  : true,
                        configurable: false
                    });
                },

                enumerable  : true,
                configurable: true  // must be configurable in order to be re-defined
            };

            // copying over amendments from old getter-setter
            Amendments.setAmendments(propertyDescriptorAfter, Amendments.getAmendments(propertyDescriptorBefore));

            Object.defineProperty(host, propertyName, propertyDescriptorAfter);
        },

        /**
         * Applies a modifier to the postponed property to be called AFTER the property is resolved.
         * Amendments are resolved in the order they were applied. Amendments should not expect other amendments
         * to be applied.
         * @param {object} host Host object.
         * @param {string} propertyName Property name.
         * @param {function} modifier Amends property value. Arguments: host object, property name,
         * plus all extra arguments passed to .amendPostponed(). Return value is discarded.
         * @example
         * var ns = {};
         * troop.postpone(ns, 'foo', function () {
         *  ns.foo = {hello: "World"};
         * });
         * //...
         * troop.amendPostponed(ns, 'foo', function () {
         *  ns.foo.howdy = "Fellas";
         * });
         * // howdy is not added until first access to `ns.foo`
         */
        amendPostponed: function (host, propertyName, modifier) {
            dessert
                .isObject(host, "Host is not an Object")
                .isString(propertyName, "Invalid property name")
                .isFunction(modifier, "Invalid generator function");

            var modifierArguments = slice.call(arguments),
                propertyDescriptor = Object.getOwnPropertyDescriptor(host, propertyName);

            // removing modifier from argument list
            modifierArguments.splice(2, 1);

            if (!propertyDescriptor) {
                // there is no value nor setter-getter defined on property
                // we're trying to amend before postponing
                // postponing with dummy generator function
                troop.postpone(host, propertyName, function () {
                });

                // re-evaluating property descriptor
                propertyDescriptor = Object.getOwnPropertyDescriptor(host, propertyName);
            }

            if (dessert.validators.isSetterGetterDescriptor(propertyDescriptor)) {
                // property is setter-getter, ie. unresolved
                // adding generator to amendment functions
                troop.Amendments.addAmendment(propertyDescriptor, modifier, modifierArguments);
            } else if (propertyDescriptor) {
                // property is value, assumed to be a resolved postponed property

                // calling modifier immediately
                modifier.apply(troop, modifierArguments);
            }
        }
    });
}());
