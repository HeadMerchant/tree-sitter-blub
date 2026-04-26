/// <reference types="tree-sitter-cli/dsl" />
// @ts-check

/**
 * @param {RuleOrLiteral} positional
 * @param {RuleOrLiteral} named
 * @param {RuleOrLiteral} seperator
 * @param {RuleOrLiteral} newline
 * @returns {SeqRule}
 */
function inputs(positional, named, seperator, newline) {
  return seq(
    repeat(newline),
    optional(seq(
      choice(
        seq(
          seq(positional, repeat(seq(seperator, positional))),
          repeat(seq(seperator, named)),
        ),
        seq(named, repeat(seq(seperator, named))),
      ),
      choice(optional(seperator), repeat(newline)),
    )),
  );
}

const binops = [
  ["or"],
  ["and"],
  ["<<", ">>"],
  ["<", "<=", ">", ">="],
  ["!=", "=="],
  ["~", "&", "|"],
  ["+", "-"],
  ["*", "/", "%"],
];
const precArrow = binops.length + 1;
const precPrefix = binops.length + 5;
const precPostfix = binops.length + 6;
const precAccess = binops.length + 7;

/**
 * Creates a rule to match one or more occurrences of `rule` separated by `sep`
 *
 * @param {RuleOrLiteral} rule
 * @param {RuleOrLiteral} sep
 * @returns {SeqRule}
 */
function sep(rule, sep) {
  return seq(optional(rule), repeat(seq(sep, rule)), optional(sep));
}

export default grammar({
  name: "blub",

  extras: $ => [$.comment, /[ \t\r]/],
  externals: $ => [$.space_op],
  rules: {
    source_file: $ => sep($.statement, repeat1($.nl)),
    word: $ => $.identifier,
    statement: $ => choice($.assignment, $.declaration, $.expression),
    set: $ =>
      prec.right(
        -1,
        seq(
          $.expression,
          token("="),
          $.expression,
        ),
      ),
    assignment: $ =>
      prec.right(
        -1,
        choice(
          $.binopAssign,
          $.set,
        ),
      ),
    binopAssign: $ =>
      seq(
        $.expression,
        seq($.binopToken, token.immediate("=")),
        $.expression,
      ),
    binopToken: _ =>
      choice(
        ...binops.flat().map(token),
      ),
    lCurl: _ => token("{"),
    rCurl: _ => token("}"),
    lSquare: _ => token("["),
    rSquare: _ => token("]"),
    lParen: _ => token("("),
    rParen: _ => token(")"),
    comma: _ => token(","),
    closing: $ => choice($.rCurl, $.rSquare, $.rParen, $.nl, "else", $.comma),
    colon: _ => token(":"),
    assign: _ => token("="),
    declaration: $ => choice($.pureDecl, $.declAssign),
    pureDecl: $ => seq($.identifier, $.colon, field("type", $.expression)),
    declAssign: $ =>
      seq(
        seq($.identifier, $.colon, field("type", optional($.expression))),
        choice($.colon, $.assign),
        $.expression,
      ),
    expression: $ =>
      choice(
        ...binops.flatMap(
          (ops, i) =>
            ops.map(
              op =>
                prec.left(
                  i + 1,
                  seq(
                    field("left", $.expression),
                    field("operator", op),
                    field("right", $.expression),
                  ),
                ),
            ),
        ),
        $.dotAccess,
        $.dotShorthand,
        $.call,
        $.call_arguments,
        $.index_args,
        $.prefix,
        $.postfix,
        $.import_lit,
        $.identifier,
        $.builtin,
        $.string,
        $.character,
        $.integer,
        $.decimal,
        // $.decimalTrailing,
        // $.decimalLeading,
        $.struct,
        $.enum_lit,
        $.fn,
        $.if_expr,
        $.return_expr,
        $.when,
        $.using,
        $.character,
        $.boolean,
        prec.left($.while_expr),
        $.multiLineString,
        $.block,
        $.apply,
      ),
    using: $ => prec.left(seq(token("using"), $.expression)),
    fn: $ =>
      prec.left(
        seq(
          choice("fn", "kernel"),
          optional($.string),
          $.lParen,
          field("params", inputs($.pureDecl, $.declAssign, $.argSep, $.nl)),
          $.rParen,
          field(
            "returnType",
            optional(prec.left(precArrow, seq($.tArrow, $.expression))),
          ),
          field("body", optional($.block)),
        ),
      ),
    block: $ =>
      seq(
        $.lCurl,
        choice(repeat($.nl), sep($.statement, repeat1($.nl))),
        $.rCurl,
      ),
    call: $ =>
      prec.left(
        precAccess,
        seq(
          $.expression,
          $.call_arguments,
        ),
      ),
    call_arguments: $ =>
      seq(
        $.lParen,
        inputs($.expression, $.named_arg, $.argSep, $.nl),
        $.rParen,
      ),
    index_args: $ =>
      seq(
        $.lSquare,
        inputs($.expression, $.named_arg, $.argSep, $.nl),
        $.rSquare,
      ),
    named_arg: $ => seq($.identifier, "=", $.expression),
    string: $ =>
      seq(
        optional("c"),
        "\"",
        repeat(choice(
          $.string_content,
          $.escapeSequence,
        )),
        "\"",
      ),
    string_content: _ => /[^"\\]+/,
    prefix: $ =>
      prec.right(
        precPrefix,
        seq(
          choice(
            $.pointer,
            "-",
            "!",
            $.slice,
            $.multiPointer,
            seq($.lSquare, $.expression, $.rSquare),
          ),
          $.expression,
        ),
      ),
    pointer: _ => token("^"),
    multiPointer: _ => token("[^]"),
    // TODO: precedence
    access: $ => choice($.call, $.bracketAccess),
    bracketAccess: $ =>
      seq(
        $.expression,
        $.lSquare,
        // args
        seq(
          optional($.expression),
          repeat(seq($.comma, repeat($.nl), $.expression)),
          repeat(seq($.comma, repeat($.nl), $.declAssign)),
        ),
        $.rSquare,
      ),
    slice: _ => token("[]"),
    postfix: $ =>
      prec.right(
        precPostfix,
        seq(
          $.expression,
          choice($.slice, $.multiPointer, $.pointer, $.index_args),
        ),
      ),
    identifier: _ => /[a-zA-Z_][a-zA-Z0-9_]*/,
    builtin: _ => /\@[a-zA-Z_][a-zA-Z0-9_]*/,
    integer: _ => /\d+/,
    // TODO: leading/trailing decimals currently don't work with apply
    decimal: _ => /\d+\.\d+/,
    character: $ => seq("'", choice($.escapeSequence, $.string_content), "'"),
    escapeSequence: _ => seq("\\", /[n\\]/),
    return_expr: $ => prec.left(seq(token("return"), optional($.expression))),
    comment: _ => token(seq("#", /[^\r\n]*/)),
    declBlock: $ =>
      seq(
        $.lCurl,
        sep($.declaration, repeat1($.nl)),
        $.rCurl,
      ),
    struct: $ => seq(token("struct"), $.declBlock),
    nl: _ => token("\n"),
    if_expr: $ =>
      // prec.right needed to consume dangling else
      prec.right(seq(
        "if",
        $.lParen,
        field("condition", $.expression),
        $.rParen,
        $.expression,
        optional(
          field("elseClause", seq("else", $.expression)),
        ),
      )),
    enum_lit: $ =>
      seq(
        "enum",
        field("rawType", optional(seq($.lParen, $.expression, $.rParen))),
        $.lCurl,
        sep($.enumVariant, repeat1($.nl)),
        $.rCurl,
      ),
    while_expr: $ =>
      prec.left(
        seq(
          "while",
          $.lParen,
          field("condition", $.expression),
          $.rParen,
          $.block,
        ),
      ),
    enumVariant: $ => choice($.identifier, $.set),
    dotAccess: $ =>
      prec.left(
        precAccess,
        seq($.expression, ".", field("fieldName", $.identifier)),
      ),
    dotShorthand: $ => seq(".", field("fieldName", $.identifier)),
    boolean: _ => choice("true", "false"),
    import_lit: $ => seq(choice("import", "@cudaImport"), $.string),
    when: $ =>
      prec.left(seq(
        "when",
        $.lParen,
        $.expression,
        $.rParen,
        $.lCurl,
        optional($.case),
        repeat(seq(repeat1($.nl), $.case)),
        optional(seq(repeat1($.nl), "else", $.tArrow, $.expression)),
        repeat($.nl),
        $.rCurl,
      )),
    case: $ => seq($.expression, $.tArrow, $.expression),
    tArrow: _ => token("->"),
    fArrow: _ => token("=>"),
    argSep: $ => seq($.comma, repeat($.nl)),
    multiLineString: $ =>
      prec.left(seq($.multiLineToken, repeat(seq($.nl, $.multiLineToken)))),
    multiLineToken: _ => token(/\\"[^\n]*/),
    apply: $ =>
      prec.right(binops.length, seq($.expression, $.space_op, $.expression)),
  },
});
