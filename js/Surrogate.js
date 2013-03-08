/**
 * Surrogate Class Feature
 */
/*global dessert, troop */
(function () {
    /**
     * @class troop.Surrogate
     * @extends troop.Base
     */
    var self = troop.Surrogate = troop.Base.extend()
        .addMethod(/** @lends troop.Surrogate */{
            /**
             * Retrieves first surrogate fitting constructor arguments.
             * @this {troop.Base} Class
             * @return {troop.Base|undefined}
             */
            getSurrogate: function () {
                var surrogates = this.surrogates,
                    i, surrogateInfo;

                if (typeof surrogates !== 'undefined') {
                    for (i = 0; i < surrogates.length; i++) {
                        surrogateInfo = surrogates[i];

                        // determining whether arguments fit next filter
                        if (surrogateInfo.filter.apply(this, arguments)) {
                            return surrogateInfo.namespace[surrogateInfo.className];
                        }
                    }
                }
            },

            /**
             * Adds surrogate class to this class.
             * When surrogate classes are present, instantiation is delegated
             * to the first surrogate satisfying the filter argument.
             * params: namespace, className, filter
             * @this {troop.Base} Class object.
             */
            addSurrogate: function (namespace, className, filter) {
                if (!this.hasOwnProperty('surrogates')) {
                    this.addConstant({surrogates: []});
                }

                dessert
                    .isPlainObject(namespace, "Invalid namespace object")
                    .isString(className, "Invalid class name")
                    .isFunction(filter, "Invalid filter function");

                this.surrogates.push({
                    namespace: namespace,
                    className: className,
                    filter   : filter
                });

                return this;
            }
        });

    // delegating public methods to troop.Base
    troop.Base.addMethod(/** @lends troop.Base*/{
        addSurrogate: self.addSurrogate
    });
}());
