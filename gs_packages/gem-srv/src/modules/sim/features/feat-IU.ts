/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\


For testing new featureees ...

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import UR from '@gemstep/ursys/client';
import SM_Feature from 'lib/class-sm-feature';
import { RegisterFeature } from 'modules/datacore/dc-sim-data';
import { SM_Boolean, SM_Number, SM_String } from 'script/vars/_all_vars';
import SM_Agent from 'lib/class-sm-agent';

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const FEATID = 'IU';
const PR = UR.PrefixUtil('IUFEATURE');
const DBG = true;
const LOG_ID = 'SCRIPT_LOG';

/// FEATURE CLASS /////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
class IUPack extends SM_Feature {
  constructor(name) {
    super(name);
    this.featAddMethod('logString', this.logString);
    this.featAddMethod('logProperty', this.logProperty);
  }
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  decorate(agent) {
    super.decorate(agent);

    this.featAddProp(agent, 'logStringText', new SM_String('INIT'));
    agent.prop.IU.logStringText.setTo('INIT');
  }

  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /// IU FEATURE METHODS
  logProperty(agent: IAgent) {
    this.logString(agent, agent.prop.IU.logStringText.value);
  }

  logString(agent: IAgent, text: string) {
    if (DBG) console.log('Logging character(' + agent.id + '): ' + text);
    UR.LogEvent(LOG_ID, [' character ' + agent.id + '\t' + text]);
  }

  /// SYMBOL DECLARATIONS /////////////////////////////////////////////////////
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /** static method to return symbol data */
  static Symbolize(): TSymbolData {
    return SM_Feature._SymbolizeNames(IUPack.Symbols);
  }
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /** instance method to return symbol data */ a;
  symbolize(): TSymbolData {
    return IUPack.Symbolize();
  }
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  static _CachedSymbols: TSymbolData;
  /// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
  /** declaration of base symbol data; methods will be modified to include
   *  the name parameter in each methodSignature */
  static Symbols: TSymbolData = {
    props: {
      logStringText: SM_String.SymbolizeCustom({
        setTo: ['logStringText:string']
      })
    },
    methods: {
      'logString': { args: ['text:string'] },
      'logProperty': {}
    }
  };
}

/// REGISTER FEATURE SINGLETON ////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const INSTANCE = new IUPack('IU');
RegisterFeature(INSTANCE);
