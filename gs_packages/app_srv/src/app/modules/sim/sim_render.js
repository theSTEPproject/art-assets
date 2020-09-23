/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  Renderer Phase Machine Interface

  Works purely with display objects, so it is up to other code to convert
  lists of Agents, etc into an array or map of DisplayObjects.

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

import UR from '@gemstep/ursys/client';
import SyncMap from './lib/class-syncmap';
import Sprite from './lib/class-sprite';

/// CONSTANTS & DECLARATIONS //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const PR = UR.PrefixUtil('SIM_RENDER');
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
let DOBJ_LIST;
const MAPPED_SPRITES = new SyncMap('DOBJ-TO-SPRITE', {
  Constructor: Sprite, // sprites track display objs
  autoGrow: true
});
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** Manager for handling changes in the display objects, and handling their
 *  individual updates
 */
function m_Initialize() {
  MAPPED_SPRITES.setObjectHandlers({
    onAdd: (dobj, spr) => {
      spr.x = dobj.x;
      spr.y = dobj.y;
    },
    onUpdate: (dobj, spr) => {
      spr.x = dobj.x;
      spr.y = dobj.y;
    },
    onRemove: spr => {}
  });
}

/// MODULE HELPERS /////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function m_RenderDisplayList(frameNum) {
  if (!MAPPED_SPRITES) throw Error('called before init()');
  DOBJ_LIST = MAPPED_SPRITES.getSyncedObjects();
}

/// API FUNCTIONS /////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** Accepts a list of display objects that were presumably already derived from
 *  the agents list
 */
function SaveDisplayList(dobjs) {
  DOBJ_LIST = dobjs;
}
/** Update the sprites from the saved list of display objects
 */
function RenderDisplayList() {
  MAPPED_SPRITES.syncFromArray(DOBJ_LIST);
}

/// PHASE MACHINE DIRECT INTERFACE ////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// PHASE_LOAD
UR.SystemHook('SIM', 'RESET', () => {
  m_Initialize();
});
UR.SystemHook('SIM', 'SETMODE', () => {});
UR.SystemHook('SIM', 'WAIT', () => {
  console.log(...PR('should initialize viewport'));
  console.log(...PR('should load sprites'));
});
UR.SystemHook('SIM', 'INIT', () => {});
UR.SystemHook('SIM', 'READY', () => {});
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/// PHASE_LOOP
UR.SystemHook('SIM', 'VIS_UPDATE', () => {
  // use this for updating anything other than mapped display objects,
  // since MAPPED_SPRITES updates sprites implicitly after
});
UR.SystemHook('SIM', 'VIS_RENDER', m_RenderDisplayList);

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
export { SaveDisplayList, RenderDisplayList };
