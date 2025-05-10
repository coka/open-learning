import { expect, test } from "bun:test";
import { Lexer, Parser, Token } from "./interpreter";

test("Lexer", () => {
  const statement = "let x = 3 + 4;";
  const lexer = new Lexer(statement);
  const tokens = [];
  let token: Token;
  while (token?.type !== "EOF") {
    token = lexer.next();
    tokens.push(token);
  }
  expect(tokens).toEqual([
    { type: "LET", literal: "let" },
    { type: "IDENTIFIER", literal: "x" },
    { type: "ASSIGN", literal: "=" },
    { type: "NUMBER", literal: "3" },
    { type: "PLUS", literal: "+" },
    { type: "NUMBER", literal: "4" },
    { type: "SEMICOLON", literal: ";" },
    { type: "EOF", literal: "" },
  ]);
});

test("Parser", () => {
  const program = new Parser(
    new Lexer(`
      let x = 3 + 4;
      let y = 5 * 6;
      let foo = 7;
    `),
  ).parse();
  expect(program.statements).toEqual([
    {
      identifier: "x",
      expression: {
        kind: "INFIX",
        left: {
          kind: "ATOM",
          value: {
            type: "NUMBER",
            literal: "3",
          },
        },
        operator: {
          type: "PLUS",
          literal: "+",
        },
        right: {
          kind: "ATOM",
          value: {
            type: "NUMBER",
            literal: "4",
          },
        },
      },
    },
    {
      identifier: "y",
      expression: {
        kind: "INFIX",
        left: {
          kind: "ATOM",
          value: {
            type: "NUMBER",
            literal: "5",
          },
        },
        operator: {
          type: "ASTERISK",
          literal: "*",
        },
        right: {
          kind: "ATOM",
          value: {
            type: "NUMBER",
            literal: "6",
          },
        },
      },
    },
    {
      identifier: "foo",
      expression: {
        kind: "ATOM",
        value: {
          type: "NUMBER",
          literal: "7",
        },
      },
    },
  ]);
});
