/*///////////////////////////////// ABOUT \\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\*\

  client datacore - a pure data module for server-side ursys operations

\*\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\\ * /////////////////////////////////////*/

const $$ = require('./ur-common');
const DifferenceCache = require('./class-diff-cache');
const PathedHasher = require('./class-pathed-hasher');
const DBG = require('./ur-dbg-settings');

/// URNET MESSAGING SYSTEM ////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
let BROKER_UINFO = {};
let CLIENT_UINFO = {};
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** saved from client-netinfo { host, port, uaddr, urnet_version } */
function SaveBrokerInfo(info) {
  if (info === undefined) throw Error('SaveBrokerInfo got undefined parameter');
  Object.keys(info).forEach(prop => {
    if (BROKER_UINFO[prop]) console.log('overwriting broker info', prop);
    BROKER_UINFO[prop] = info[prop];
  });
  return BROKER_UINFO;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** saved from client-netinfo { ip }
 *  saved from client-urnet registration { uaddr, srv_uaddr, isLocalServer }
 *  saved from index-client SystemStart { uapp }
 */
function SaveClientInfo(info) {
  if (info === undefined) throw Error('SaveClientInfo got undefined parameter');
  Object.keys(info).forEach(prop => {
    if (CLIENT_UINFO[prop]) console.log('overwriting client info', prop);
    CLIENT_UINFO[prop] = info[prop];
  });
  return CLIENT_UINFO;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function MyUADDR() {
  const { uaddr } = CLIENT_UINFO;
  if (uaddr === undefined) throw Error('MyUADDR() called before uaddr set');
  return uaddr;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function MyAppPath() {
  const { uapp } = CLIENT_UINFO;
  if (uapp === undefined) throw Error('MyAppPath() called before uapp set');
  return uapp;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function MyAppServerPort() {
  return window.location.port || 80;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function MyAppServerHostname() {
  return window.location.hostname;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function MyNetBrokerInfo() {
  return BROKER_UINFO;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function MyNetBroker() {
  return BROKER_UINFO.host;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function ConnectionString() {
  const { host } = BROKER_UINFO;
  const port = window.location.port;
  let str = `${MyUADDR()} ⇆ ${host}`;
  if (port) str += `:${port}`;
  return str;
}

/// ENDPOINT DATA STRUCTURES //////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
let LocalNode;
let NetNode;
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function SetSharedEndPoints(eps) {
  LocalNode = eps.LocalNode;
  NetNode = eps.NetNode;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function GetSharedEndPoints() {
  return { LocalNode, NetNode };
}

/// DEVICE DATA STORES ////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DEVICES_SUBBED = new Map();
let DB_COUNT = 0;
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** a deviceSpec has three named function properties (defined in
 *  client-netdevices as TDeviceSelector)
 *  selectify: udevice => true|falase
 *  quantify:  udeviceList => deviceList
 *  notify:    (added,updated,removed) => voic
 */
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** a device subscription saves a "device controller" when it's received from the
 *  device connector. It's called by client-netdevices SubscribeDevice() which
 *  is exported from UR client.
 *  returns a deviceAPI object
 */
function SaveDeviceSub(deviceSpec) {
  const sub = deviceSpec;
  const dcache = new Map(); // udid to deviceDef
  const cobjs = new Map(); // cName to DifferenceCache for this sub
  sub.cobjs = cobjs;
  sub.dcache = dcache;
  DEVICES_SUBBED.set(DB_COUNT, sub);
  const unsub = () => {
    console.log('deleting device sub', DB_COUNT);
    DEVICES_SUBBED.delete(DB_COUNT);
  };
  const deviceNum = () => {
    return DB_COUNT;
  };
  const getInputs = () => {
    return cobjs.getInputs();
  };
  const getChanges = () => {
    return cobjs.getChanges();
  };
  const putOutput = () => {
    console.log('putOutput() is unmplemented');
  };
  ++DB_COUNT; // increment device counter
  return { unsub, getInputs, getChanges, putOutput, deviceNum };
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** return all subscriptions in the DEVICES_SUBBED map */
function GetAllSubs() {
  return [...DEVICES_SUBBED.values()];
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** device subscriptions have a dcache property which is the DifferenceCache
 *  of all devices hashed by udid
 */
function GetSubsByUDID(udid) {
  const subs = GetAllSubs();
  return subs.filter(sub => sub.dcache.has(udid));
}

/// DEVICE DEFINITION & CREATION //////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DEVICES_LOCAL = new Map();
let DEVICE_COUNT = 0;
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function SaveDevice(udevice) {
  DEVICES_LOCAL.set(udevice.udid, udevice);
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function GetDeviceByUDID(udid) {
  return DEVICES_LOCAL.get(udid);
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** returns the unique UADDR number */
function GetUAddressNumber() {
  const { PRE_UADDR_ID, PRE_UDEVICE_ID } = $$;
  const base_id = `${PRE_UDEVICE_ID}${MyUADDR().slice(PRE_UADDR_ID.length)}`;
  return base_id;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function GetNewDeviceUDID() {
  const base_id = GetUAddressNumber();
  const udid = `${base_id}:${DEVICE_COUNT++}`;
  return udid;
}

/// DEVICE DIRECTORY //////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
const DEVICE_DIR = new DifferenceCache('udid');
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function log_arr(arr, prompt = 'array') {
  if (arr.length > 0) console.log(`${prompt}: ${arr.length} elements`, arr);
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
/** Returns { added, updated, removed } by default unless opt is overridden */
function IngestDevices(devices, opt) {
  const results = DEVICE_DIR.ingest(devices, opt);
  if (DBG.devices) {
    console.group('IngestDevices');
    const { all, added, updated, removed } = results;
    if (added) log_arr(added, 'added  ');
    if (updated) log_arr(updated, 'updated');
    if (removed) log_arr(removed, 'removed');
    if (all) log_arr(all, 'all');
    console.groupEnd();
  }
  return results;
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function GetDevicesChangeList() {
  return DEVICE_DIR.getChanges();
}
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
function GetDevices() {
  return DEVICE_DIR.getValues();
}

/// EXPORTS ///////////////////////////////////////////////////////////////////
/// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
module.exports = {
  // NETWORK PARAMETERS
  SaveBrokerInfo,
  SaveClientInfo,
  MyUADDR,
  MyAppPath,
  MyAppServerHostname,
  MyAppServerPort,
  MyNetBrokerInfo,
  MyNetBroker,
  ConnectionString,
  // URNET
  SetSharedEndPoints,
  GetSharedEndPoints,
  // DEVICES
  GetUAddressNumber,
  SaveDeviceSub,
  GetAllSubs,
  GetSubsByUDID,
  SaveDevice,
  GetDeviceByUDID,
  GetDevices,
  GetNewDeviceUDID,
  IngestDevices,
  GetDevicesChangeList
};
