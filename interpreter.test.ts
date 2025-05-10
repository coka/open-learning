import { describe, expect, test } from "bun:test";
import { evaluate, Lexer, Parser, Token } from "./interpreter";

function getRemainingTokens(l: Lexer): Token[] {
  let token = l.next();
  const tokens = [token];
  while (token.type !== "EOF") {
    token = l.next();
    tokens.push(token);
  }
  return tokens;
}

describe("Lexer", () => {
  test("expression", () => {
    const expression = "3 + 4";
    const lexer = new Lexer(expression);
    const tokens = getRemainingTokens(lexer);
    expect(tokens).toEqual([
      { type: "NUMBER", literal: "3" },
      { type: "PLUS", literal: "+" },
      { type: "NUMBER", literal: "4" },
      { type: "EOF", literal: "" },
    ]);
  });

  test("identifiers", () => {
    const expression = "foo bar let return";
    const lexer = new Lexer(expression);
    const tokens = getRemainingTokens(lexer);
    expect(tokens).toEqual([
      { type: "IDENTIFIER", literal: "foo" },
      { type: "IDENTIFIER", literal: "bar" },
      { type: "LET", literal: "let" },
      { type: "IDENTIFIER", literal: "return" },
      { type: "EOF", literal: "" },
    ]);
  });

  test("numbers", () => {
    const expression = "1 23 456";
    const lexer = new Lexer(expression);
    const tokens = getRemainingTokens(lexer);
    expect(tokens).toEqual([
      { type: "NUMBER", literal: "1" },
      { type: "NUMBER", literal: "23" },
      { type: "NUMBER", literal: "456" },
      { type: "EOF", literal: "" },
    ]);
  });

  test("let", () => {
    const statement = "let x = 3 + 4;";
    const lexer = new Lexer(statement);
    const tokens = getRemainingTokens(lexer);
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
});

test("Parser", () => {
  const program = new Parser(
    new Lexer(`
      let x = 3 + 4;
      let y = 5 * 6;
      let foo = 42;
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
          literal: "42",
        },
      },
    },
  ]);
});

test("evaluate", () => {
  const statement = "let x = 3 + 4 * 5;";
  const lexer = new Lexer(statement);
  const program = new Parser(lexer).parse();
  expect(evaluate(program)).toEqual(23);
});
