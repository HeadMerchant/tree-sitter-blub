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
    source_file: ($) => repeat($.statement),
    statement: ($) => seq(choice($.assignment, $.declaration)),
    block: ($) =>
      seq(optional($.statement), seq($.nl, $.statement), optional($.nl)),
    lCurl: (_) => token("{"),
    rCurl: (_) => token("}"),
    lSquare: (_) => token("["),
    rSquare: (_) => token("]"),
    lParen: (_) => token("("),
    rParen: (_) => token(")"),
    comma: (_) => token(","),
    closing: ($) => choice($.rCurl, $.rSquare, $.rParen, $.nl),
    colon: (_) => token(":"),
    assign: (_) => token("="),
    declaration: ($) =>
      seq(
        $.identifer,
        $.colon,
        optional(seq(choice($.colon, $.assign), $.expression)),
      ),
    expression: ($) => seq(),
    prefix: ($) => seq(choice("^", ".", "-", "!")),
    postfix: ($) => seq($.expression, choice("^")),
    primary: ($) =>
      choice($.identifier, $.integer, $.decimalTrailing, $.decimalLeading),
    identifier: ($) => token(/[a-zA-Z][a-zA-Z0-9]*/),
    integer: ($) => /\d+/,
    decimalTrailing: ($) => /\d+\.\d*/,
    decimalLeading: ($) => /\d*\.\d+/,
    _return: ($) => seq(token("return"), $.expression),
    comment: (_) => token(seq("#", /[^\r\n]*/)),
    declBlock: ($) =>
      seq(
        $.lCurl,
        optional($.declaration),
        repeat(seq(repeat1($.nl), $.declaration)),
        optional($.nl),
        $.rCurl,
      ),
    struct: ($) => seq(token("struct"), $.declBlock),
    nl: (_) => token("\n"),
    _if: ($) =>
      seq(
        token("if"),
        $.lParen,
        $.expression,
        $.rParen,
        $.expression,
        optional(seq(repeat($.nl), $._else, $.expression)),
      ),
    _else: (_) => token("else"),
  },
});
