/**
 * @file Blub language
 * @author Amani Toussaint <amanitoussaintgreen@gmail.com>
 * @license MIT
 */

/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

export default grammar({
  name: "blub",

  rules: {
    // TODO: add the actual grammar rules
    source_file: $ => repeat($._statement),
    _statement: $ => choice($.assignment, $.declaration),
    primary: $ => choice($.identifier, $.integer, $.decimalTrailing, $.decimalLeading),
    identifier: $ => /[a-z]+/,
    integer: $ => /\d+/,
    decimalTrailing: $ => /\d+\.\d*/,
    decimalLeading: $ => /\d*\.\d+/,
  }
});
