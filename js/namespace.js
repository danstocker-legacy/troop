/**
 * Top-Level Library Namespace
 */
/*global require */
/** @namespace */
var troop = {},
    dessert;

// adding Node.js dependencies
if (typeof require === 'function') {
    dessert = require('dessert-0.2.4').dessert;
}