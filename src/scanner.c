#include "tree_sitter/parser.h"
#include <ctype.h>

enum TokenType { SPACE_OP };

void *tree_sitter_blub_external_scanner_create() { return NULL; }
void tree_sitter_blub_external_scanner_destroy(void *p) {}
void tree_sitter_blub_external_scanner_reset(void *p) {}
unsigned tree_sitter_blub_external_scanner_serialize(void *p, char *b) {
  return 0;
}
void tree_sitter_blub_external_scanner_deserialize(void *p, const char *b,
                                                   unsigned n) {}

bool tree_sitter_blub_external_scanner_scan(void *payload, TSLexer *lexer,
                                            const bool *valid_symbols) {
  bool saw_space = false;
  while (lexer->lookahead == ' ' || lexer->lookahead == '\t') {
    lexer->advance(lexer, true);
    saw_space = true;
  }

  if (!saw_space || !valid_symbols[SPACE_OP])
    return false;

  char next = lexer->lookahead;
  if (!(isalpha(next) || next == '_' || next == '@' || next == '"' ||
        next == '\'' || isdigit(next)))
    return false;

  // mark before peeking — space_op is zero-width, ends here
  lexer->mark_end(lexer);

  if (next == 'e') {
    lexer->advance(lexer, false);
    if (lexer->lookahead == 'l') {
      lexer->advance(lexer, false);
      if (lexer->lookahead == 's') {
        lexer->advance(lexer, false);
        if (lexer->lookahead == 'e') {
          lexer->advance(lexer, false);
          if (!isalnum(lexer->lookahead) && lexer->lookahead != '_') {
            return false;
          }
        }
      }
    }
  }

  lexer->result_symbol = SPACE_OP;
  return true;
}
