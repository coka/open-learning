import { expect, test } from "bun:test";
import { Lexer, Token } from "./interpreter";

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
