// Seven real-mesh original skinned wrist contact anchors, from the
// in-game Chromium geometry audit 38941138729. No gun transforms changed.
export const nativeContacts={
 pistol:{oldL:[.308,-.4867,-.8014],oldR:[.3878,-.4681,-.7668],left:[.308,-.4867,-.8014],right:[.3878,-.4681,-.7668]},
 rifle:{oldL:[.2245,-.4935,-1.698],oldR:[.3229,-.6877,-.6811],left:[.48,-.535,-1.98],right:[.485,-.835,-1.15]},
 shotgun:{oldL:[.4023,-.4628,-1.5829],oldR:[.3776,-.5572,-.6304],left:[.315,-.365,-1.455],right:[.355,-.395,-.38]},
 smg:{oldL:[.244,-.5935,-1.6665],oldR:[.4653,-.7498,-1.1409],left:[.245,-.485,-1.575],right:[.315,-.585,-.865]},
 m240:{oldL:[.1849,-.4932,-1.9792],oldR:[.3254,-.7188,-.7714],left:[.275,-.455,-2.14],right:[.365,-.675,-.815]},
 dmr:{oldL:[.2017,-.509,-1.9606],oldR:[.422,-.6909,-1.3991],left:[.295,-.44,-2.19],right:[.422,-.6909,-1.3991]},
 grenadeLauncher:{oldL:[.2097,-.5096,-1.5382],oldR:[.3234,-.7008,-.7207],left:[.298,-.397,-1.454],right:[.358,-.636,-.52]}
};
export const nativeGripShift=(weapon,side)=>{
 const spec=nativeContacts[weapon];if(!spec)return[0,0,0];
 return spec[side].map((v,i)=>v-spec[side==="left"?"oldL":"oldR"][i]);
};
