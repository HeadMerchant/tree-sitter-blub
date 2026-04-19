import XCTest
import SwiftTreeSitter
import TreeSitterBlub

final class TreeSitterBlubTests: XCTestCase {
    func testCanLoadGrammar() throws {
        let parser = Parser()
        let language = Language(language: tree_sitter_blub())
        XCTAssertNoThrow(try parser.setLanguage(language),
                         "Error loading Blub grammar")
    }
}
