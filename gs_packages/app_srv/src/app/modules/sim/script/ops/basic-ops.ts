/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  Basic Stack Machine Operations (aka "opcode")

  A StackMachine opcode is a higher order function returning
  a function that receives an agent instance and a stack, scope, and
  conditions object. This function is the "compiled" output of the
  operation.

  JS MOJO: HOFs and closures
  Every opcode (e.g. push) generates a NEW function every time it is called.
  The new function will execute using whatever parameters that were
  passed to the opcode thanks to the closure.

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import {
  I_Agent,
  T_Stackable,
  I_Scopeable,
  I_State,
  T_Opcode,
  T_OpWait
} from '../../types/t-smc';
import SM_Object from '../../lib/class-sm-object';

/// STACK OPCODES /////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** push object (usually a prop or agent) on stack */
const push = (gv: T_Stackable): T_Opcode => {
  return (agent: I_Agent, STATE: I_State): T_OpWait => {
    STATE.stack.push(gv);
  };
};
/** discard values from stack (default 1) */
const pop = (num: Number = 1): T_Opcode => {
  return (agent: I_Agent, STATE: I_State): T_OpWait => {
    for (let i = 0; i < num; i++) STATE.stack.pop();
  };
};
/** duplicate top of stack */
const dupe = (): T_Opcode => {
  return (agent: I_Agent, STATE: I_State): T_OpWait => {
    STATE.stack.push(STATE.peek());
  };
};
/** push agent on stack */
const pushAgent = (): T_Opcode => {
  return (agent: I_Agent, STATE: I_State): T_OpWait => {
    STATE.stack.push(agent);
  };
};
/** push agent.prop on stack */
const pushAgentProp = (propName: string): T_Opcode => {
  return (agent: I_Agent, STATE: I_State): T_OpWait => {
    STATE.stack.push(agent.prop(propName));
  };
};
/** push agent.prop.value on stack */
const pushAgentPropValue = (propName: string): T_Opcode => {
  return (agent: I_Agent, STATE: I_State): T_OpWait => {
    STATE.stack.push(agent.prop(propName)._value);
  };
};
/** Pop object from stack, read its value, then assign to agent.prop
 */
const popAgentPropValue = (propName: string): T_Opcode => {
  return (agent: I_Agent, STATE: I_State): T_OpWait => {
    const element = STATE.pop();
    if (element instanceof SM_Object) {
      agent.prop(propName)._value = element.value;
    } else {
      agent.prop(propName)._value = element;
    }
  };
};

/// IMMEDIATE OPCODES /////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** Directly set agent prop with immediate value */
const setAgentPropValue = (propName: string, value: any): T_Opcode => {
  return (agent: I_Agent): T_OpWait => {
    const prop = agent.prop(propName);
    prop._value = value;
  };
};
/** There is no getAgentPropValue. Use popAgentPropValue */

/// STACK INDIRECT OPCODES ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** Move top of scope stack to data stack.
 */
const scopeToStack = (): T_Opcode => {
  return (agent: I_Agent, STATE: I_State): T_OpWait => {
    const { scope, stack } = STATE;
    stack.push(scope.pop() as T_Stackable);
  };
};
/** Move top of stack to scope stack, with checks */
const stackToScope = (): T_Opcode => {
  return (agent: I_Agent, STATE: I_State): T_OpWait => {
    const { scope, stack } = STATE;
    const obj = stack.pop();
    if (obj instanceof SM_Object) scope.push(obj as I_Scopeable);
    else throw Error('stackToScope can not move non-SM_Object');
  };
};
/** remove an object from the scope stack */
const scopePop = (): T_Opcode => {
  return (agent: I_Agent, STATE: I_State): T_OpWait => {
    STATE.scope.pop();
  };
};
/** push the named agent prop on the scope stack */
const agentPropToScope = (propName: string): T_Opcode => {
  return (agent: I_Agent, STATE: I_State): T_OpWait => {
    const prop = agent.prop(propName);
    // console.log('prop', agent.name(), '.', agent.prop(propName));
    STATE.scope.push(prop);
  };
};
/** push the agent on the scope stack */
const agentToScope = (): T_Opcode => {
  return (agent: I_Agent, STATE: I_State): T_OpWait => {
    STATE.scope.push(agent);
  };
};
/** push an agent's feature on the scope stack */
const agentFeatureToScope = (featName: string): T_Opcode => {
  return (agent: I_Agent, STATE: I_State): T_OpWait => {
    STATE.scope.push(agent);
    STATE.scope.push(agent.feature(featName));
  };
};
/** Retrieve prop() from scoped object, and push it on stack. */
const scopedProp = (propName: string): T_Opcode => {
  return (agent: I_Agent, STATE: I_State): T_OpWait => {
    const { scope, stack } = STATE;
    const SOBJ: T_Stackable = scope[scope.length - 1];
    stack.push(SOBJ.prop(propName));
  };
};
/** Retrieve prop.value from scoped object, and push it on stack. */
const scopedPropValue = (propName: string): T_Opcode => {
  return (agent: I_Agent, STATE: I_State): T_OpWait => {
    const { scope, stack } = STATE;
    const SOBJ: T_Stackable = scope[scope.length - 1];
    stack.push(SOBJ.prop(propName)._value);
  };
};
/** Invoke method() from scoped object, return onto stack
 *  This is like a subroutine.
 *  Any method name and an arbitrary number of argument are passed,
 *  and any results are pushed on the datastack.
 */
const scopedMethod = (methodName: string, ...args: any[]): T_Opcode => {
  return (agent: I_Agent, STATE: I_State): T_OpWait => {
    const { scope, stack } = STATE;
    const SOBJ = scope[scope.length - 1];
    // call the method, which is also a stackmachine program
    // the results of the method, if any, are returned as a stack
    // so we need to push this onto the existing stack
    const RSTACK: T_Stackable = SOBJ.method(methodName)(...args);
    // push elements returned from scoped call onto our stack
    stack.push(RSTACK);
  };
};
/** Invoke function property on scoped object, return onto stack */
const scopedFunction = (funcName: string, ...args: any[]): T_Opcode => {
  return (agent: I_Agent, STATE: I_State): T_OpWait => {
    const { scope, stack } = STATE;
    const SOBJ: I_Scopeable = scope[scope.length - 1];
    // call the function property on the scoped object
    const RSTACK = SOBJ[funcName](...args);
    // push elements returned from scoped call onto our stack
    stack.push(RSTACK);
  };
};
/** Invoke a feature's scoped context by **including agent** */
const scopedFunctionWithAgent = (funcName: string, ...args: any[]): T_Opcode => {
  return (agent: I_Agent, STATE: I_State): T_OpWait => {
    const { scope, stack } = STATE;
    const SOBJ = scope[scope.length - 1];
    // call the function property on the scoped object
    const RSTACK: T_Stackable = SOBJ[funcName](agent, ...args);
    // push elements returned from scoped call onto our stack
    stack.push(RSTACK);
  };
};

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// data stack ops
export { push, pushAgent, pushAgentProp, pop, dupe };
export { pushAgentPropValue, popAgentPropValue };
/// agent direct ops
export { setAgentPropValue };
/// stack utility ops
export { stackToScope, scopeToStack };
/// scope stack ops
export { agentToScope, agentPropToScope, agentFeatureToScope, scopePop };
/// scoped invocation ops
export { scopedMethod, scopedFunction, scopedProp, scopedPropValue };
/// scoped feature ops
export { scopedFunctionWithAgent };
