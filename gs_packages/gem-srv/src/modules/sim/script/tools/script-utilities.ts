/* eslint-disable @typescript-eslint/no-use-before-define */
/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  ScriptUnit Utilities

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import { TScriptUnit, IToken } from 'lib/t-script.d';
import { VMToken, VMTokenLine } from 'lib/t-ui.d';

/// CONSTANT & DECLARATIONS ///////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;
let DBGTEXT = '';

/// API METHODS ///////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** given a script of ScriptUnit statements, return a PAGE of VMTokenLine and
 *  VMToken
 */
export function ScriptToLines(program: TScriptUnit[]): VMTokenLine[] {
  m_Clear();
  m_BlockToLines({ block: program });
  if (DBG) console.log(DBGTEXT);
  return PAGE;
}

/// LINE PRINTING MACHINE //////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// A "token printer" that maintains a current line buffer. The line buffer is
/// pushed into a page buffer whenever a new line starts. This is used to
/// convert statements that contain nested statements in their line-by-line
/// equivalent
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
let INDENT = 0;
let LINE_NUM = 0;
let LINE_POS = 0;
let LINE_BUF = [];
let PAGE = [];
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function m_Indent(): void {
  ++INDENT;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function m_Outdent(): void {
  --INDENT;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function m_Info() {
  return { lineNum: LINE_NUM, linePos: LINE_POS, level: INDENT };
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function m_Clear(): void {
  LINE_BUF = [];
  LINE_POS = 0;
  LINE_NUM = 0;
  PAGE = [];
  DBGTEXT = '';
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function m_NextLine(): void {
  LINE_NUM++;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function m_NextPos(): void {
  LINE_POS++;
}

/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function m_TokenOut(tok: IToken): void {
  const { lineNum, linePos, level } = m_Info();
  const tokInfo: VMToken = { token: tok, lineNum, linePos };
  LINE_BUF.push(tokInfo);
  m_NextPos();
  if (DBG) {
    if (LINE_POS === 0) DBGTEXT += `${level} {${lineNum}:${linePos}} `;
    else DBGTEXT += `{${lineNum}:${linePos}} `;
  }
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function m_LineOut(): void {
  const { level, lineNum } = m_Info();
  const line: VMTokenLine = {
    tokenList: LINE_BUF,
    level,
    lineNum
  };
  PAGE.push(line);
  LINE_BUF = [];
  LINE_POS = 0;
  m_NextLine();
  if (DBG) DBGTEXT += '\n';
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function m_StatementToLines(statement: TScriptUnit): void {
  // process all the tokens in the statement
  if (statement.length === 0) {
    console.log('surprise', statement);
    return;
  }
  statement.forEach((tok: IToken) => {
    // (1) if it's a block token then nested print
    if (Array.isArray(tok.block)) {
      if (DBG) DBGTEXT += 'BLOCK ';
      m_Indent();
      m_LineOut();
      m_BlockToLines({ block: tok.block });
      m_Outdent();
      return;
    }
    // (3) "print" the token to the line buffer
    m_TokenOut(tok);
  });
  // flush buffer after statement is printed, increment line
  m_LineOut();
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function m_BlockToLines(tok: IToken): void {
  const { block } = tok;
  block.forEach(statement => m_StatementToLines(statement));
}
