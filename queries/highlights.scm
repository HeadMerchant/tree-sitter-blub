[
  "using"
  "import"
  "@cudaImport"
] @keyword

(import_lit (string) @string.path)
[
  "fn"
  "kernel"
] @keyword.function

((identifier) @variable.builtin
  (#any-of? @variable.builtin
    "bool"
    "u8" "u16" "u32" "u64"
    "s8" "s16" "s32" "s64"
    "f16" "f32" "f64"
  ))

"return" @keyword.return

[
  "if"
  "else"
  "when"
] @keyword.conditional

"while" @keyword.repeat

(using (expression (identifier) @namespace))

[
  "struct"
  "enum"
] @keyword.type

(declAssign (identifier) @function (colon) (colon) (expression (fn)))
(declAssign (identifier) @type (colon) (colon) (expression ([(struct) (enum_lit)])))
(declAssign (identifier) @constant (colon) (colon))

(fn params: (_ (identifier) @variable.parameter))
(call (expression (identifier) @function))
(call (expression (dotAccess fieldName: (identifier) @function)))

(builtin) @constant.builtin
((builtin) @keyword.import
  (#any-of? @keyword.import "@cImport"))

; Fields
(dotAccess "." (identifier) @variable.member)
(dotShorthand "." (identifier) @variable.member)
(struct (declBlock (declaration (_ (identifier) @variable.other.member (colon)))))

; Literals
(integer) @number
(decimal) @number.float
[(string) (multiLineToken)] @string
(string "c" @string.special)
(character) @character
(escapeSequence) @string.escape
(boolean) @boolean

; Operators
(binopToken) @operator

; Punctuation
[
  (lParen) (rParen)
  (lCurl) (rCurl)
  (lSquare) (rSquare)
] @punctuation.bracket

[
  (tArrow)
  "."
  (comma)
  (colon)
  "="
] @punctuation.delimiter

(named_arg (identifier) @variable.parameter "=")
(comment) @comment
(pureDecl (identifier) @variable (colon) type: (expression (identifier) @type))
(declAssign (identifier) @variable (colon) type: (expression (identifier) @type))
