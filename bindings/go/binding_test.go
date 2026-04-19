package tree_sitter_blub_test

import (
	"testing"

	tree_sitter "github.com/tree-sitter/go-tree-sitter"
	tree_sitter_blub "github.com/tree-sitter/tree-sitter-blub/bindings/go"
)

func TestCanLoadGrammar(t *testing.T) {
	language := tree_sitter.NewLanguage(tree_sitter_blub.Language())
	if language == nil {
		t.Errorf("Error loading Blub grammar")
	}
}
