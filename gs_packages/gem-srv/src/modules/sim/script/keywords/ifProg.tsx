/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  implementation of keyword "ifProg" command object

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import React from 'react';
import { Keyword } from 'lib/class-keyword';
import { IAgent, IState, TOpcode, TScriptUnit } from 'lib/t-script';
import { RegisterKeyword } from 'modules/runtime-datacore';
import { SingleAgentConditional } from 'script/conditions';

/// CLASS DEFINITION //////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export class ifProg extends Keyword {
  // base properties defined in KeywordDef

  constructor() {
    super('ifProg');
    this.args = ['test', 'consq', 'alter'];
  }
  /* NOTE THIS IS NONFUNCTIONAL */
  /** create smc blueprint code objects */
  compile(unit: TScriptUnit): TOpcode[] {
    const [kw, test, consq, alter] = unit;
    console.log(kw, 'ifProg test:', test, 'then:', consq, 'else', alter);
    const cout = [];
    cout.push();
    return cout;
  }

  /** return a state object that turn react state back into source */
  serialize(state: any): TScriptUnit {
    const { min, max, floor } = state;
    return [this.keyword, min, max, floor];
  }

  /** return rendered component representation */
  jsx(index: number, unit: TScriptUnit, children?: any[]): any {
    const testName = unit[1];
    const conseq = unit[2];
    const alter = unit[3];
    return super.jsx(
      index,
      unit,
      <>
        on {testName} TRUE {conseq}, ELSE {alter}
      </>
    );
  }
} // end of UseFeature

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// see above for keyword export
RegisterKeyword(ifProg);
