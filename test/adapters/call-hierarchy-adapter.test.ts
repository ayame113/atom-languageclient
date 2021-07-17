import CallHierarchyAdapter from "../../lib/adapters/call-hierarchy-adapter"
import * as ls from "../../lib/languageclient"
import { createSpyConnection, createFakeEditor } from "../helpers.js"
import { Point, Range } from "atom"
import type { TextEditor } from "atom"

const callHierarchyItem: ls.CallHierarchyItem = {
  name: "hello",
  kind: 12,
  detail: "",
  uri: "file:///C:/path/to/file.ts",
  range: { start: { line: 0, character: 0 }, end: { line: 1, character: 1 } },
  selectionRange: { start: { line: 0, character: 24 }, end: { line: 0, character: 29 } },
}
const callHierarchyItemWithTags: ls.CallHierarchyItem = {
  name: "hello",
  kind: 12,
  tags: [1],
  detail: "",
  uri: "file:///C:/path/to/file.ts",
  range: { start: { line: 0, character: 0 }, end: { line: 1, character: 1 } },
  selectionRange: { start: { line: 0, character: 24 }, end: { line: 0, character: 29 } },
}

describe("OutlineViewAdapter", () => {
  let fakeEditor: TextEditor
  let connection: ls.LanguageClientConnection

  beforeEach(() => {
    connection = new ls.LanguageClientConnection(createSpyConnection())
    fakeEditor = createFakeEditor()
  })

  describe("canAdapt", () => {
    it("returns true if callHierarchyProvider is supported", () => {
      const result = CallHierarchyAdapter.canAdapt({ callHierarchyProvider: true })
      expect(result).toBe(true)
    })

    it("returns false if callHierarchyProvider not supported", () => {
      const result = CallHierarchyAdapter.canAdapt({})
      expect(result).toBe(false)
    })
  })

  describe("getCallHierarchy", () => {
    it("converts the results from the connection", async () => {
      spyOn(connection, "prepareCallHierarchy").and.resolveTo([callHierarchyItem])
      const result = <any>(
        await new CallHierarchyAdapter().getCallHierarchy(connection, fakeEditor, new Point(0, 0), "incoming")
      )
      expect(result.type).toEqual("incoming")
      expect(result.data).toEqual([
        {
          path: "C:\\path\\to\\file.ts",
          name: "hello",
          icon: "type-function",
          tags: [],
          detail: "",
          range: new Range([0, 0], [1, 1]),
          selectionRange: new Range([0, 24], [0, 29]),
          rawData: jasmine.anything(),
        },
      ])
    })
    it("converts the results with tags from the connection", async () => {
      spyOn(connection, "prepareCallHierarchy").and.resolveTo([callHierarchyItemWithTags])
      const result = <any>(
        await new CallHierarchyAdapter().getCallHierarchy(connection, fakeEditor, new Point(0, 0), "incoming")
      )
      expect(result.type).toEqual("incoming")
      expect(result.data).toEqual([
        {
          path: "C:\\path\\to\\file.ts",
          name: "hello",
          icon: "type-function",
          tags: ["deprecated"],
          detail: "",
          range: new Range([0, 0], [1, 1]),
          selectionRange: new Range([0, 24], [0, 29]),
          rawData: jasmine.anything(),
        },
      ])
    })
    it("converts null results from the connection", async () => {
      spyOn(connection, "prepareCallHierarchy").and.resolveTo(null)
      const result = <any>(
        await new CallHierarchyAdapter().getCallHierarchy(connection, fakeEditor, new Point(0, 0), "outgoing")
      )
      expect(result.type).toEqual("outgoing")
      expect(result.data).toEqual([])
    })
    it("converts empty results from the connection", async () => {
      spyOn(connection, "prepareCallHierarchy").and.resolveTo([])
      const result = <any>(
        await new CallHierarchyAdapter().getCallHierarchy(connection, fakeEditor, new Point(0, 0), "outgoing")
      )
      expect(result.type).toEqual("outgoing")
      expect(result.data).toEqual([])
    })
    it("returns itemAt for incoming requests", async () => {
      spyOn(connection, "prepareCallHierarchy").and.resolveTo([callHierarchyItem])
      spyOn(connection, "callHierarchyIncomingCalls").and.resolveTo([
        {
          from: callHierarchyItem,
          fromRanges: [],
        },
      ])
      const result = <any>(
        await new CallHierarchyAdapter().getCallHierarchy(connection, fakeEditor, new Point(0, 0), "incoming")
      )
      expect((await result.itemAt(0)).type).toEqual("incoming")
      expect((await result.itemAt(0)).data).toEqual([
        {
          path: "C:\\path\\to\\file.ts",
          name: "hello",
          icon: "type-function",
          tags: [],
          detail: "",
          range: new Range([0, 0], [1, 1]),
          selectionRange: new Range([0, 24], [0, 29]),
          rawData: jasmine.anything(),
        },
      ])
      expect((await (await result.itemAt(0)).itemAt(0)).type).toEqual("incoming")
      expect((await (await result.itemAt(0)).itemAt(0)).data).toEqual([
        {
          path: "C:\\path\\to\\file.ts",
          name: "hello",
          icon: "type-function",
          tags: [],
          detail: "",
          range: new Range([0, 0], [1, 1]),
          selectionRange: new Range([0, 24], [0, 29]),
          rawData: jasmine.anything(),
        },
      ])
    })
    it("returns itemAt for outgoing requests", async () => {
      spyOn(connection, "prepareCallHierarchy").and.resolveTo([callHierarchyItem])
      spyOn(connection, "callHierarchyOutgoingCalls").and.resolveTo([
        {
          to: callHierarchyItem,
          fromRanges: [],
        },
      ])
      const result = <any>(
        await new CallHierarchyAdapter().getCallHierarchy(connection, fakeEditor, new Point(0, 0), "outgoing")
      )
      expect((await result.itemAt(0)).type).toEqual("outgoing")
      expect((await result.itemAt(0)).data).toEqual([
        {
          path: "C:\\path\\to\\file.ts",
          name: "hello",
          icon: "type-function",
          tags: [],
          detail: "",
          range: new Range([0, 0], [1, 1]),
          selectionRange: new Range([0, 24], [0, 29]),
          rawData: jasmine.anything(),
        },
      ])
      expect((await (await result.itemAt(0)).itemAt(0)).type).toEqual("outgoing")
      expect((await (await result.itemAt(0)).itemAt(0)).data).toEqual([
        {
          path: "C:\\path\\to\\file.ts",
          name: "hello",
          icon: "type-function",
          tags: [],
          detail: "",
          range: new Range([0, 0], [1, 1]),
          selectionRange: new Range([0, 24], [0, 29]),
          rawData: jasmine.anything(),
        },
      ])
    })
  })

  describe("getIncoming", () => {
    it("converts the results from the connection", async () => {
      spyOn(connection, "callHierarchyIncomingCalls").and.resolveTo([
        {
          from: callHierarchyItem,
          fromRanges: [],
        },
      ])
      const result = <any>await new CallHierarchyAdapter().getIncoming(connection, callHierarchyItem)
      expect(result.type).toEqual("incoming")
      expect(result.data).toEqual([
        {
          path: "C:\\path\\to\\file.ts",
          name: "hello",
          icon: "type-function",
          tags: [],
          detail: "",
          range: new Range([0, 0], [1, 1]),
          selectionRange: new Range([0, 24], [0, 29]),
          rawData: jasmine.anything(),
        },
      ])
    })
    it("converts null results from the connection", async () => {
      spyOn(connection, "callHierarchyIncomingCalls").and.resolveTo(null)
      const result = <any>await new CallHierarchyAdapter().getIncoming(connection, callHierarchyItem)
      expect(result.type).toEqual("incoming")
      expect(result.data).toEqual([])
    })
    it("converts empty results from the connection", async () => {
      spyOn(connection, "callHierarchyIncomingCalls").and.resolveTo([])
      const result = <any>await new CallHierarchyAdapter().getIncoming(connection, callHierarchyItem)
      expect(result.type).toEqual("incoming")
      expect(result.data).toEqual([])
    })
  })

  describe("getOutgoing", () => {
    it("converts the results from the connection", async () => {
      spyOn(connection, "callHierarchyOutgoingCalls").and.resolveTo([
        {
          to: callHierarchyItem,
          fromRanges: [],
        },
      ])
      const result = <any>await new CallHierarchyAdapter().getOutgoing(connection, callHierarchyItem)
      expect(result.type).toEqual("outgoing")
      expect(result.data).toEqual([
        {
          path: "C:\\path\\to\\file.ts",
          name: "hello",
          icon: "type-function",
          tags: [],
          detail: "",
          range: new Range([0, 0], [1, 1]),
          selectionRange: new Range([0, 24], [0, 29]),
          rawData: jasmine.anything(),
        },
      ])
    })
    it("converts null results from the connection", async () => {
      spyOn(connection, "callHierarchyOutgoingCalls").and.resolveTo(null)
      const result = <any>await new CallHierarchyAdapter().getOutgoing(connection, callHierarchyItem)
      expect(result.type).toEqual("outgoing")
      expect(result.data).toEqual([])
    })
    it("converts empty results from the connection", async () => {
      spyOn(connection, "callHierarchyOutgoingCalls").and.resolveTo([])
      const result = <any>await new CallHierarchyAdapter().getOutgoing(connection, callHierarchyItem)
      expect(result.type).toEqual("outgoing")
      expect(result.data).toEqual([])
    })
  })
})
