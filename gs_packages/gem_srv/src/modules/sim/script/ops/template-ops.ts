/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  Agent Templating Stack Machine Operations
  see basic-ops.ts for description of stack machine

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import { I_Agent, T_Opcode, T_OpWait, I_Scopeable } from '../../types/t-smc';

/// AGENT TEMPLATE ////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const addProp = (
  name: string,
  NewFunc: { new (...args): I_Scopeable }
): T_Opcode => {
  return (agent: I_Agent): T_OpWait => {
    agent.addProp(name, new NewFunc(name));
  };
};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const addFeature = (name: string): T_Opcode => {
  return (agent: I_Agent): T_OpWait => {
    agent.addFeature(name);
  };
};

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// debug opcodes
export { addProp, addFeature };
