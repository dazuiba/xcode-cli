import XCTest

final class DemoProjTests: XCTestCase {
    func testHelloWorld() throws {
        let greeting = "Hello, World!"
        XCTAssertEqual(greeting, "Hello, World!")
    }
}
