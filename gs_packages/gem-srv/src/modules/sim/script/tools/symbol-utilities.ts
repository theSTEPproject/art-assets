/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-use-before-define */
/* eslint-disable consistent-return */
/* eslint-disable no-cond-assign */
/* eslint-disable no-continue */
/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  A collection of symbol utilities

  The intent of SymbolHelper is to lookup symbol data from a token.
  Your provide a bundle and context
  It knows how to lookup features, programs, and blueprints.
  It knows how to dig into props.


\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import UR from '@gemstep/ursys/client';

import {
  GetKeyword,
  GetAllKeywords,
  GetFeature,
  GetProgram,
  GetTest,
  GetBlueprint,
  UnpackArg,
  UnpackToken,
  IsValidBundle
} from 'modules/datacore';
import {
  IToken,
  TSymbolData,
  TSymbolRefs,
  TSymbolErrorCodes,
  TSymMethodArg
} from 'lib/t-script.d';

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DBG = false;
const PR = UR.PrefixUtil('SYMUTIL', 'TagTest');

/// TSYMBOLDATA ERROR UTILITY CLASS ///////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** error constructor */
class SymbolError implements TSymbolData {
  error: { code: TSymbolErrorCodes; info: string };
  /** @constructor
   *  @param {TSymbolData} err_code specific code type
   *  @param {string} err_info description of what causes the error
   *  @param {TSymbolData} symbols optional set of symbols that were available
   *  @param {string} info optional tag, useful for adding context for errors
   */
  constructor(
    err_code: TSymbolErrorCodes = 'debug',
    err_info: string = '<none provided>',
    symbols?: TSymbolData,
    info?: string
  ) {
    // always deliver error
    this.error = {
      code: err_code,
      info: err_info
    };
    if (info !== undefined) (this as any).info = info;
    // optionally tack-on symbol data
    if (symbols) {
      const symbolKeys = [...Object.keys(symbols)];
      symbolKeys.forEach(key => {
        (this as any)[key] = symbols[key];
      });
    }
  }
  /** decorate with additional context info */
  setInfo(info: string) {
    (this as any).info = info;
  }
}

/// SYMBOL HELPER CLASS ///////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** this class helps extract contextual information from an IToken
 *  suitable for creating viewmodel data lists for dropdowns/selectors.
 *  create an instance, setParameters(), then call decode method
 */
class SymbolHelper {
  refs: TSymbolRefs; // replaces token, bundle, xtx_obj, symscope
  cur_scope: TSymbolData; // current scope as drilling down into objref
  bdl_scope: TSymbolData; // pointer to the top scope (blueprint bundle)
  keyword: string; // store the name of the keyword that created this instance
  scan_error: boolean; // set if a bad token was encountered during scoping
  //
  constructor(keyword: string = '?') {
    this.refs = {
      bundle: null,
      global: null
      // TSymbolRefs symbols is stored in this.cur_scope for ease of access
    };
    this.keyword = keyword;
    this.scan_error = false;
  }
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /** reference are the default lookup dictionaries. This is more than
   *  just the global context, including the entire
   */
  setReferences(refs: any) {
    const fn = 'setReferences:';
    const { bundle, global } = refs || {};
    if (bundle) {
      if (IsValidBundle(bundle)) this.refs.bundle = bundle;
      else throw Error(`${fn} invalid bundle`);
    }
    if (!bundle.symbols)
      throw Error(`${fn} bundle ${bundle.name} has no symbol data`);
    if (global) {
      if (typeof global === 'object') this.setGlobal(global);
      else throw Error(`${fn} invalid context`);
    }
    this.bdl_scope = this.refs.bundle.symbols;
    this.reset();
  }

  /// SCOPE ACCESSORS /////////////////////////////////////////////////////////
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  reset() {
    this.cur_scope = this.bdl_scope;
    this.scan_error = false;
  }
  resetScope() {
    this.cur_scope = this.getInitialScope();
  }
  getInitialScope(): TSymbolData {
    return this.getBundleScope();
  }
  getCurrentScope(): TSymbolData {
    return this.cur_scope;
  }
  getBundleScope(): TSymbolData {
    return this.bdl_scope;
  }
  scanError(flag?: boolean) {
    const fn = 'scanError:';
    if (flag !== undefined) this.scan_error = Boolean(flag);
    return this.scan_error;
  }
  setGlobal(ctx: object) {
    this.refs.global = ctx;
  }
  extendGlobal(ctxChild: object) {
    // TODO: use prototype chains
    const fn = 'extendGlobal:';
    console.log(`TODO: ${fn} should chain`, ctxChild);
  }

  /// HIGH LEVEL SCOPES ///////////////////////////////////////////////////////
  /** These methods don't rely on prior scope being set by prior passes,
   *  and are used for the very first units parsed in a line
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /** returns a list of valid keywords for the script engine */
  allKeywords(token: IToken): TSymbolData {
    const keywords = GetAllKeywords();
    if (token === undefined) {
      this.scan_error = true;
      return new SymbolError('noparse', 'no keyword token', {
        keywords
      });
    }
    return { keywords };
  }

  /// MULTIPLE CHOICE CHECKS //////////////////////////////////////////////////
  /** These methods are used for drilling-down into object refs
   */
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /** If part is 'agent', return the bundle symbols or undefined.
   *  This lookup is valid only if the scope is pointing the bundle's
   *  symbol entry at the start
   */
  agentLiteral(part: string, scope?: TSymbolData) {
    const fn = 'agentLiteral:';
    if (scope)
      throw Error(`${fn} works only on bdl_scope, so don't try to override`);
    if (part !== 'agent') return undefined;
    this.cur_scope = this.bdl_scope;
    return this.bdl_scope; // valid scope is parent of cur_scope
  }
  /** search the current scope for a matching featureName
   */
  featureName(part: string, scope?: TSymbolData) {
    scope = scope || this.cur_scope;
    const features = scope.features;
    if (features === undefined) return undefined; // no match
    const feature = features[part];
    if (!feature) return undefined;
    this.cur_scope = feature; // advance scope
    return features; // valid scope is parent of cur_scope
  }
  /** search the refs.global context object to see if there is a defined
   *  blueprint module in it; use the blueprint symbols to set the current scope
   *  and return symbols
   */
  blueprintName(part: string, scope?: TSymbolData) {
    const fn = 'blueprintName:';
    if (scope)
      throw Error(`${fn} works on context, so don't provide scope override`);
    if (part === 'agent') return undefined; // skip agent prop in refs.global
    const ctx = this.refs.global || {};
    const bp = ctx[part];
    if (!bp) return undefined; // no match
    if (!bp.symbols) throw Error(`missing bundle symbles ${bp.name}`);
    this.cur_scope = bp.symbols; // advance scope pointer
    return bp; // valid scope is parent of cur_scope
  }
  /** check the current scope or bundle for propName matches or undefined. Use
   *  this in the cases where you DO NOT WANT an objectref instead, as you would
   *  for the addProp keyword */
  propName(propName: string, scope?: TSymbolData) {
    const ctx = scope || this.cur_scope || {};
    // is there a props dictionary in scope?
    const propDict = ctx.props;
    if (!propDict) return undefined; // no props found
    // does the propName exist?
    const prop = propDict[propName];
    if (!prop) return undefined; // no matching prop
    this.cur_scope = prop; // advance scope pointer
    return ctx; // valid scope is parent of cur_scope
  }

  /// SCOPE DRILLING //////////////////////////////////////////////////////////
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /** scans the current scope for a terminal property or feature, after
   *  which a methodName would be expected in the next tokens
   */
  objRef(token: IToken): TSymbolData {
    // error checking & type overrides
    const fn = 'objRef:';
    this.resetScope();
    let [tokType, parts] = UnpackToken(token);
    if (DBG) console.log(...PR(`${fn}: ${tokType}:${parts}`));
    // was there a previous scope-breaking error?
    if (this.scanError())
      return new SymbolError('noscope', `${fn} error in previous token(s)`);
    // is the token a valid identifier or objref token?
    if (tokType === 'identifier') parts = [parts];
    else if (tokType !== 'objref') {
      this.scanError(true);
      return new SymbolError(
        'noparse',
        `${fn} improper or missing token`,
        this.getBundleScope()
      );
    }
    // OBJREF PART 1: what kind of object are we referencing?
    // these calls will update cur_scope SymbolData appropriately
    let part = parts[0];
    let agent = this.agentLiteral(part);
    let feature = this.featureName(part);
    let prop = this.propName(part);
    let blueprint = this.blueprintName(part);
    // is there only one part in this objref?
    let terminal = parts.length === 1;
    // does the objref terminate in a method-bearing reference?
    if (terminal) {
      if (prop) return prop; // return agent scope {props}
      if (feature) return feature; // return feature scope {features,props}
    }
    // did any agent, feature, prop, or blueprint resolve?
    if (!(agent || feature || prop || blueprint)) {
      this.scanError(true);
      return new SymbolError('noscope', `${fn} invalid objref '${part}`);
    }

    // OBJREF PART 2: are the remaining parts valid?
    for (let ii = 1; ii < parts.length; ii++) {
      part = parts[ii];
      //
      if (DBG) console.log('scanning', ii, 'for', part, 'in', this.cur_scope);
      // are there any prop, feature, or blueprint references?
      // these calls drill-down into the scope for each part, starting in the
      // scope set in OBJREF PART 1
      prop = this.propName(part);
      feature = this.featureName(part);
      blueprint = this.blueprintName(part);
      // is this part of the objref the last part?
      terminal = ii >= parts.length - 1;
      if (terminal) {
        if (prop) return prop; // return agent scope {props}
        if (feature) return feature; // return feature scope {features,props}
      }
    } /** END OF LOOP **/

    // OBJREF ERROR: if we exhaust all parts without terminating, that's an error
    // so return error+symbolData for the entire bundle
    // example: 'prop agent'
    this.scanError(true);
    const orStr = parts.join('.');
    return new SymbolError(
      'noparse',
      `${fn} '${orStr}' not found or invalid`,
      this.getBundleScope()
    );
  }
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /** given an existing symboldata scope set in this.cur_scope, looks for a method.
   *
   */
  scopeMethod(token: IToken): TSymbolData {
    const fn = 'scopeMethod:';
    let [tokType, methodName] = UnpackToken(token);
    if (DBG) console.log(...PR(`${fn}: ${tokType}:${methodName}`));

    // was there a previous scope-breaking error?
    if (this.scanError())
      return new SymbolError('noscope', `${fn} error in previous token(s)`);
    // is scope set?
    if (this.cur_scope === null)
      return new SymbolError('noscope', `${fn} unexpected invalid scope`);
    // is there a token?
    if (token === undefined) {
      this.scanError(true);
      const { methods } = this.cur_scope;
      return new SymbolError('noparse', `${fn} missing token`, { methods });
    }
    // is the token an identifier?
    if (tokType !== 'identifier') {
      this.scanError(true);
      const symbols = this.cur_scope;
      return new SymbolError(
        'noparse',
        `${fn} expects identifier, not ${tokType}`,
        symbols
      );
    }
    // is the indentifier defined?
    if (typeof methodName !== 'string') {
      this.scanError(true);
      return new SymbolError('noparse', `${fn} bad identifier`);
    }
    // is there a methods dictionary in scope
    const { methods } = this.cur_scope;
    if (methods === undefined) {
      this.scanError(true);
      return new SymbolError('noexist', `${fn} scope has no method dict`);
    }
    // does methodName exist in the methods dict?
    const methodArgs = methods[methodName];
    if (methodArgs === undefined) {
      this.scanError(true);
      return new SymbolError(
        'noexist',
        `${fn} '${methodName}' is not in method dict`,
        { methods }
      );
    }
    // all good!
    this.cur_scope = { [methodName]: methodArgs }; // advance scope pointer
    return { methods }; // valid scope is parent of cur_scope
  }
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /** process the argument list that follows a methodName in GEMSCRIPT
   */
  scopeArgs(tokens: IToken[]): TSymbolData[] {
    const fn = 'scopeArgs:';
    const vargs = [];

    // is the current scope single-entry dictionary containing a method array?
    const methodNames = [...Object.keys(this.cur_scope)];
    if (methodNames.length !== 1) {
      for (let i = 0; i < tokens.length; i++)
        vargs.push(new SymbolError('noscope', `${fn} invalid methodArgs dict`));
      return vargs;
    }

    // SCOPE ARGS 1: retrieve the method's argument symbol data
    const methodName = methodNames[0];
    const methodSignature: TSymMethodArg = this.cur_scope[methodName];
    // TODO: some keywords (e.g. 'when') may have multiple arrays
    const { args } = methodSignature;

    // expect the number of argument tokens to match the symbol data
    if (tokens.length > args.length) console.warn('token overflow');
    if (tokens.length < args.length) console.warn('token underflow');

    // SCOPE ARGS 2: general validation tokens for each argument
    // this loop structure is weird because we have to handle overflow
    // and underflow conditionss
    let tokenIndex = 0;
    for (tokenIndex; tokenIndex < tokens.length; tokenIndex++) {
      // is the tokenIndex greater than the number of argument definitions?
      if (tokenIndex > args.length - 1) {
        vargs.push(new SymbolError('over', `${fn} no argType for extra tokens`));
        continue;
      }
      // SCOPE ARGS 3: validate current token against matching  argument definition
      const tok = tokens[tokenIndex];
      const argType = args[tokenIndex];
      /** MAGIC EXPAND **/
      const symbols = this.scopeArgSymbols(argType);
      /** RESULT IS RENDERABLE LIST **/
      vargs.push({ symbols });
    }
    // check for underflow
    if (ii < args.length - 1)
      for (ii; ii < args.length; ii++) {
        vargs.push(new SymbolError('under', 'fewer tokens than expecteds'));
      }
    return vargs;
  }
} // end of SymbolHelper class

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export {
  SymbolHelper, // symbol decoder
  SymbolError // create a TSymbolData error object
};
export function HACK_ForceImport() {
  // force import of this module in Transpiler, otherwise webpack treeshaking
  // seems to cause it not to load
}
