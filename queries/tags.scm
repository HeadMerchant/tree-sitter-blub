(declAssign (identifier) @name (colon) (colon) (expression (fn)))  @definition.function
(declAssign (identifier) @name (colon) (colon) (expression ([(struct) (enum_lit)])))  @definition.class

(pureDecl (identifier) @variable (colon) type: (expression (identifier) @reference.class))
(declAssign (identifier) @variable (colon) type: (expression (identifier) @reference.class))
(call (expression (identifier) @reference.call))
(call (expression (dotAccess fieldName: (identifier) @reference.call)))

; Variable / constant declarations
(declAssign
  (identifier) @name) @definition.variable

(pureDecl
  (identifier) @name) @definition.variable

; Imports
(import_lit
  (string) @name) @definition.import

; References
(identifier) @reference
