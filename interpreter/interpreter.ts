import assert from "node:assert";

function isLetter(char: string): boolean {
  return char >= "a" && char <= "z";
}

function isDigit(char: string): boolean {
  return char >= "0" && char <= "9";
}

function isWhitespace(char: string): boolean {
  return char === " " || char === "\n";
}

export type TokenType =
  | "LET"
  | "IDENTIFIER"
  | "ASSIGN"
  | "NUMBER"
  | "PLUS"
  | "ASTERISK"
  | "SEMICOLON"
  | "EOF";

export type Token = {
  type: TokenType;
  literal: string;
};

export class Lexer {
  private readonly source: string;
  private position: number = 0;
  private char: string = "";

  constructor(source: string) {
    this.source = source;
    this.read();
  }

  next(): Token {
    this.eatWhitespace();
    let token: Token;
    switch (this.char) {
      case "":
        token = { type: "EOF", literal: this.char };
        break;
      case "=":
        token = { type: "ASSIGN", literal: this.char };
        break;
      case "+":
        token = { type: "PLUS", literal: this.char };
        break;
      case "*":
        token = { type: "ASTERISK", literal: this.char };
        break;
      case ";":
        token = { type: "SEMICOLON", literal: this.char };
        break;
      default:
        if (isLetter(this.char)) {
          let literal = this.readIdentifier();
          if (literal === "let") {
            token = { type: "LET", literal };
          } else {
            token = { type: "IDENTIFIER", literal };
          }
        } else {
          token = { type: "NUMBER", literal: this.readNumber() };
        }
    }
    this.read();
    return token;
  }

  private read(): void {
    if (this.position === this.source.length) {
      this.char = "";
    } else {
      this.char = this.source[this.position];
      this.position++;
    }
  }

  private peek(): string {
    if (this.position === this.source.length) {
      return "";
    } else {
      return this.source[this.position];
    }
  }

  private eatWhitespace(): void {
    while (isWhitespace(this.char)) {
      this.read();
    }
  }

  private readIdentifier(): string {
    let identifier = "";
    while (isLetter(this.peek())) {
      identifier += this.char;
      this.read();
    }
    identifier += this.char;
    return identifier;
  }

  private readNumber(): string {
    let number = "";
    while (isDigit(this.peek())) {
      number += this.char;
      this.read();
    }
    number += this.char;
    return number;
  }
}

export type Expression =
  | {
      kind: "ATOM";
      value: Token;
    }
  | {
      kind: "INFIX";
      left: Expression;
      operator: Token;
      right: Expression;
    };

export type ExpressionStatement = {
  value: Expression;
};

export type LetStatement = {
  identifier: string;
  expression: Expression;
};

export type Statement = ExpressionStatement | LetStatement;

export type Program = {
  statements: Statement[];
};

export class Parser {
  private readonly lexer: Lexer;
  private token: Token;

  constructor(lexer: Lexer) {
    this.lexer = lexer;
    this.next();
  }

  private next(): void {
    this.token = this.lexer.next();
  }

  public parse(): Program {
    const program: Program = { statements: [] };
    while (this.token.type !== "EOF") {
      if (this.token.type === "LET") {
        program.statements.push(this.parseLetStatement());
      } else if (this.token.type === "SEMICOLON") {
        this.next();
      } else {
        program.statements.push(this.parseExpressionStatement());
      }
    }
    return program;
  }

  private parseLetStatement(): LetStatement {
    this.next();
    const identifier = this.token.literal;
    this.next();
    assert(
      this.token.type === "ASSIGN",
      `Expected "=", got "${this.token.literal}".`,
    );
    this.next();
    return {
      identifier,
      expression: this.parseExpression(),
    };
  }

  private parseExpressionStatement(): ExpressionStatement {
    return {
      value: this.parseExpression(),
    };
  }

  private parseExpression(): Expression {
    const left = this.token;
    this.next();
    const right = this.token;
    if (right.type === "SEMICOLON" || right.type === "EOF") {
      return { kind: "ATOM", value: left };
    } else {
      this.next();
      return {
        kind: "INFIX",
        left: { kind: "ATOM", value: left },
        operator: right,
        right: this.parseExpression(),
      };
    }
  }
}

export function evaluate(program: Program): number {
  assert(
    program.statements.length === 1,
    "Unable to evaluate programs with multiple statements.",
  );
  return evaluateExpression(program.statements[0].expression);
}

function evaluateExpression(expression: Expression): number {
  switch (expression.kind) {
    case "ATOM":
      assert(
        expression.value.type === "NUMBER",
        `Expected number, got "${expression.value.type}".`,
      );
      return parseInt(expression.value.literal, 10);
    case "INFIX":
      const left = evaluateExpression(expression.left);
      const right = evaluateExpression(expression.right);
      const operatorType = expression.operator.type;
      assert(
        operatorType === "PLUS" || operatorType === "ASTERISK",
        `Expected operator, got "${operatorType}".`,
      );
      switch (operatorType) {
        case "PLUS":
          return left + right;
        case "ASTERISK":
          return left * right;
      }
  }
}
