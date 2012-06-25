/**
 * Property Management.
 *
 * Adding properties of different purposes to a class or instance.
 */
/*global troop */
(function () {
    var $properties = troop.properties = {
        //////////////////////////////
        // Utilities

        /**
         * Adds properties to object with the specified attributes.
         * @this {object}
         * @param properties {object}
         * @param [isWritable] {boolean}
         * @param [isEnumerable] {boolean}
         * @param [isConfigurable] {boolean}
         */
        add: function (properties, isWritable, isEnumerable, isConfigurable) {
            var name;
            for (name in properties) {
                if (properties.hasOwnProperty(name)) {
                    Object.defineProperty(this, name, {
                        value: properties[name],
                        writable: isWritable,
                        enumerable: isEnumerable,
                        configurable: isConfigurable
                    });
                }
            }
            return this;
        },

        /**
         * Adds properties to object with the specified attributes.
         * @this {object}
         * @param prefix {string} Property prefix. Added to all assigned properties.
         * @param properties {object}
         * @param [isWritable] {boolean}
         * @param [isEnumerable] {boolean}
         * @param [isConfigurable] {boolean}
         */
        addPrefixed: function (prefix, properties, isWritable, isEnumerable, isConfigurable) {
            var name, prefixed;
            for (name in properties) {
                if (properties.hasOwnProperty(name)) {
                    if (name.substr(0, prefix.length) === prefix) {
                        // property name is already prefixed
                        prefixed = name;
                    } else {
                        // adding prefix
                        prefixed = prefix + name;
                    }
                    Object.defineProperty(this, prefixed, {
                        value: properties[name],
                        writable: isWritable,
                        enumerable: isEnumerable,
                        configurable: isConfigurable
                    });
                }
            }
            return this;
        },

        /**
         * Promises a property definition (read-only).
         * @param object {object} Host object.
         * @param propertyName {string} Property name.
         * @param generator {function} Generates (and returns) property value.
         */
        promise: function (object, propertyName, generator) {
            // placing class promise on namespace as getter
            Object.defineProperty(object, propertyName, {
                get: function () {
                    // obtaining property value
                    var value = generator(object, propertyName);

                    // overwriting promise with actual property value
                    Object.defineProperty(object, propertyName, {
                        value: value,
                        writable: false,
                        enumerable: true,
                        configurable: false
                    });

                    return value;
                },
                enumerable: true,
                configurable: true  // must be configurable in order to be re-defined
            });
        },

        /**
         * Determines target of property addition.
         * In testing mode, each class has two prototype levels and
         * methods should go to the lower one, so they may be covered on
         * the other.
         */
        getTarget: function () {
            return troop.testing === true ?
                Object.getPrototypeOf(this) :
                this;
        },

        //////////////////////////////
        // Class-level

        /**
         * Adds public read-only methods to class.
         * @this {troop.base} Class object.
         * @param methods {object} Methods.
         */
        addMethod: function (methods) {
            $properties.add.call($properties.getTarget.call(this), methods, false, true, false);
            return this;
        },

        /**
         * Adds private read-only methods to class.
         * @this {troop.base} Class object.
         * @param methods {object} Methods.
         */
        addPrivateMethod: function (methods) {
            $properties.addPrefixed.call($properties.getTarget.call(this), troop.privatePrefix, methods, false, false, false);
            return this;
        },

        //////////////////////////////
        // Class and instance-level

        /**
         * Adds public writable members to class or instance.
         * @this {troop.base} Class or instance object.
         * @param properties {object} Properties and methods.
         */
        addPublic: function (properties) {
            return $properties.add.call(this, properties, true, true, false);
        },

        /**
         * Adds pseudo-private writable members to class or instance.
         * @this {troop.base} Class or instance object.
         * @param properties {object} Properties and methods.
         */
        addPrivate: function (properties) {
            return $properties.addPrefixed.call(this, troop.privatePrefix, properties, true, false, false);
        },

        /**
         * Adds public constant (read-only) members to instance.
         * @this {troop.base} Instance object.
         * @param properties {object} Constant properties.
         */
        addConstant: function (properties) {
            return $properties.add.call(this, properties, false, true, false);
        },

        /**
         * Adds private constant (read-only & non-enumerable) members to instance.
         * @this {troop.base} Instance object.
         * @param properties {object} Constant properties.
         */
        addPrivateConstant: function (properties) {
            return $properties.addPrefixed.call(this, troop.privatePrefix, properties, false, false, false);
        },

        //////////////////////////////
        // Class and instance-level

        /**
         * Adds public mock methods (read-only, but removable) members to instance or class.
         * @this {troop.base} Instance or class object.
         * @param methods {object} Mock methods.
         */
        addMock: function (methods) {
            return $properties.add.call(this, methods, false, true, true);
        },

        /**
         * Removes all mock methods from class or instance.
         */
        removeMocks: function () {
            var key;
            for (key in this) {
                if (this.hasOwnProperty(key) && typeof this[key] === 'function') {
                    delete this[key];
                }
            }
            return this;
        }
    };

    $properties.addPublic.call(troop, {
        privatePrefix: '_'
    });

    $properties.add.call(troop, {
        promise: $properties.promise
    }, false, true, false);
}());
