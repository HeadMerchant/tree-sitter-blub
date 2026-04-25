; Scopes
(block) @local.scope
(fn) @local.scope
(if_expr) @local.scope
(while_expr) @local.scope
(when) @local.scope

; Definitions
(declaration (_ (identifier) @local.definition))

; Function parameters
(fn
  params: (_
    (identifier) @local.definition))

; References
(identifier) @local.reference
