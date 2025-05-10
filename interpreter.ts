import assert from "node:assert";

function isLetter(char: string): boolean {
  return char >= "a" && char <= "z";
}

function isWhitespace(char: string): boolean {
  return char === " ";
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
          token = { type: "NUMBER", literal: this.char };
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

  private eatWhitespace(): void {
    while (isWhitespace(this.char)) {
      this.read();
    }
  }

  private readIdentifier(): string {
    let identifier = "";
    while (!isWhitespace(this.char)) {
      identifier += this.char;
      this.read();
    }
    return identifier;
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

export type Statement = {
  identifier: string;
  expression: Expression;
};

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
        program.statements.push(this.parseStatement());
      } else {
        this.next();
      }
    }
    return program;
  }

  private parseStatement(): Statement {
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

  private parseExpression(): Expression {
    const left = this.token;
    this.next();
    const right = this.token;
    if (right.type === "SEMICOLON") {
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
