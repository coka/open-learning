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
