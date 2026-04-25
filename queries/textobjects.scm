; Functions
(fn
  body: (block) @function.inside) @function.around

; Classes / Structs
(struct
  (declBlock) @class.inside) @class.around

; Enums
(enum_lit
  (enumVariant) @class.inside) @class.around

; Parameters (inside fn parens)
(fn
  params: (pureDecl) @parameter.inside)
(fn
  params: (declAssign) @parameter.inside)

; Parameter around includes separator
(pureDecl) @parameter.around
(declAssign) @parameter.around

; Blocks as generic scopes
(block) @function.inside

; Comments
(comment) @comment.inside @comment.around

; When cases (like match arms)
(case) @entry.inside @entry.around
