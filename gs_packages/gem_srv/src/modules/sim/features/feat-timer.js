/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

const TimerPack = {
  name: 'Timer',
  initialize: pm => {
    pm.Hook('INPUT', this.HandleInput);
  },
  agentInit: agent => {
    this.agent = agent;
    return TimerPack;
  },
  defineTimer: timerName => {
    console.log(`deftimer ${timerName}`);
    return TimerPack;
  },
  on: (eventName, f) => {
    console.log(`${TimerPack.name} handler for '${eventName}'`);
    return TimerPack;
  }
};

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

/// URSYS PROMPT //////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
import UR from '@gemstep/ursys/client';
import Feature from './class-feature';

const { makeLogHelper } = UR.util.PROMPTS;
const PR = makeLogHelper('TimerFeature');

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////

/// CLASS DEFINITION //////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/**
 */
class TimerFeature extends Feature {
  constructor() {
    super('Timer');
    console.log(...PR(`${this.name()} initialized`));
  }

  // super.agentInit(agent)
  // super.prop(agent,propName) => gVar
  // super.setProp(agent,propName,gVar) => gVar
}
/// EXPORT SINGLETON //////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const INSTANCE = new TimerFeature('TimerFeature');
export default INSTANCE;
