var t=require("@bsv/sdk"),n=require("@tempfix/idb"),e=require("buffer");function r(t,n){(null==n||n>t.length)&&(n=t.length);for(var e=0,r=Array(n);e<n;e++)r[e]=t[e];return r}function o(t){var n,e,r,o=2;for("undefined"!=typeof Symbol&&(e=Symbol.asyncIterator,r=Symbol.iterator);o--;){if(e&&null!=(n=t[e]))return n.call(t);if(r&&null!=(n=t[r]))return new i(n.call(t));e="@@asyncIterator",r="@@iterator"}throw new TypeError("Object is not async iterable")}function i(t){function n(t){if(Object(t)!==t)return Promise.reject(new TypeError(t+" is not an object."));var n=t.done;return Promise.resolve(t.value).then(function(t){return{value:t,done:n}})}return i=function(t){this.s=t,this.n=t.next},i.prototype={s:null,n:null,next:function(){return n(this.n.apply(this.s,arguments))},return:function(t){var e=this.s.return;return void 0===e?Promise.resolve({value:t,done:!0}):n(e.apply(this.s,arguments))},throw:function(t){var e=this.s.return;return void 0===e?Promise.reject(t):n(e.apply(this.s,arguments))}},new i(t)}function u(t,n){var e="undefined"!=typeof Symbol&&t[Symbol.iterator]||t["@@iterator"];if(e)return(e=e.call(t)).next.bind(e);if(Array.isArray(t)||(e=function(t,n){if(t){if("string"==typeof t)return r(t,n);var e={}.toString.call(t).slice(8,-1);return"Object"===e&&t.constructor&&(e=t.constructor.name),"Map"===e||"Set"===e?Array.from(t):"Arguments"===e||/^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e)?r(t,n):void 0}}(t))||n&&t&&"number"==typeof t.length){e&&(t=e);var o=0;return function(){return o>=t.length?{done:!0}:{done:!1,value:t[o++]}}}throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.")}function s(){return s=Object.assign?Object.assign.bind():function(t){for(var n=1;n<arguments.length;n++){var e=arguments[n];for(var r in e)({}).hasOwnProperty.call(e,r)&&(t[r]=e[r])}return t},s.apply(null,arguments)}var h,c=/*#__PURE__*/function(){function t(t,n,e){void 0===t&&(t=Date.now()),void 0===n&&(n=0n),void 0===e&&(e=""),this.height=void 0,this.idx=void 0,this.hash=void 0,this.height=t,this.idx=n,this.hash=e}return t.prototype.toJSON=function(){return{height:this.height,idx:this.idx.toString(),hash:this.hash}},t}(),a=/*#__PURE__*/function(){function t(t,n,e){this.txid=void 0,this.vin=void 0,this.block=void 0,this.txid=t,this.vin=n,this.block=e}return t.prototype.toJSON=function(){var t;return{txid:this.txid,vin:this.vin,block:null==(t=this.block)?void 0:t.toJSON()}},t}(),f=/*#__PURE__*/function(){function t(t,n,e,r){this.txid=void 0,this.vout=void 0,this.satoshis=void 0,this.script=void 0,this.block=void 0,this.spend=void 0,this.data={},this.events=[],this.owner="",this.txid=t,this.vout=n,this.satoshis=e,this.script=r}return t.fromObject=function(n,e){void 0===e&&(e=[]);var r=new t(n.txid,n.vout,n.satoshis,n.script);r.block=n.block&&new c(n.block.height,n.block.idx,n.block.hash),r.spend=n.spend&&new a(n.spend.txid,n.spend.vin,n.spend.block&&new c(n.spend.block.height,n.spend.block.idx,n.spend.block.hash)),r.owner=n.owner;for(var o,i=u(e);!(o=i()).done;){var s=o.value;n.data[s.tag]&&(r.data[s.tag]=s.fromObj(n.data[s.tag]))}return r.events=n.events,r},t.prototype.toJSON=function(){return s({},this,{script:e.Buffer.from(this.script).toString("base64"),satoshis:this.satoshis.toString(),owner:this.owner,data:Object.entries(this.data).reduce(function(t,n){return t[n[0]]=n[1].data,t},{}),events:this.events})},t}();function l(t,n,e){if(!t.s){if(e instanceof v){if(!e.s)return void(e.o=l.bind(null,t,n));1&n&&(n=e.s),e=e.v}if(e&&e.then)return void e.then(l.bind(null,t,n),l.bind(null,t,2));t.s=n,t.v=e;var r=t.o;r&&r(t)}}!function(t){t[t.INVALID=-1]="INVALID",t[t.PENDING=0]="PENDING",t[t.BROADCASTED=1]="BROADCASTED",t[t.CONFIRMED=2]="CONFIRMED"}(h||(h={}));var v=/*#__PURE__*/function(){function t(){}return t.prototype.then=function(n,e){var r=new t,o=this.s;if(o){var i=1&o?n:e;if(i){try{l(r,1,i(this.v))}catch(t){l(r,2,t)}return r}return this}return this.o=function(t){try{var o=t.v;1&t.s?l(r,1,n?n(o):o):e?l(r,1,e(o)):l(r,2,o)}catch(t){l(r,2,t)}},r},t}();function d(t){return t instanceof v&&1&t.s}var p=1e4,b=/*#__PURE__*/function(){function t(){this.db=void 0,this.syncInProgress=!1,this.db=n.openDB("blocks",1,{upgrade:function(t){t.createObjectStore("headers",{keyPath:"height"}).createIndex("byHash","hash")}})}var e=t.prototype;return e.syncBlocks=function(){try{var t=this;if(t.syncInProgress)return Promise.resolve();t.syncInProgress=!0;var n=1;return Promise.resolve(t.db).then(function(e){return Promise.resolve(e.transaction("headers").store.openCursor(null,"prev")).then(function(r){r&&(n=r.key>5?r.key-5:1);var o=function(t,r){try{var o=function(t,r){try{var o=Promise.resolve(fetch("https://ordinals.gorillapool.io/api/blocks/list/"+n+"?limit="+p)).then(function(t){return Promise.resolve(t.json()).then(function(r){var o=function(t,n){var e;do{var r=t();if(r&&r.then){if(!d(r)){e=!0;break}r=r.v}var o=n();if(d(o)&&(o=o.v),!o)return r}while(!o.then);var i=new v,u=l.bind(null,i,2);return(e?r.then(s):o.then(h)).then(void 0,u),i;function s(e){for(r=e;d(o=n())&&(o=o.v),o;){if(o.then)return void o.then(h).then(void 0,u);if((r=t())&&r.then){if(!d(r))return void r.then(s).then(void 0,u);r=r.v}}l(i,1,r)}function h(e){if(e){do{if((r=t())&&r.then){if(!d(r))return void r.then(s).then(void 0,u);r=r.v}if(d(e=n())&&(e=e.v),!e)return void l(i,1,r)}while(!e.then);e.then(h).then(void 0,u)}else l(i,1,r)}}(function(){console.log("Syncing from",n);for(var o,i=e.transaction("headers","readwrite"),s=u(r);!(o=s()).done;){var h=o.value;i.store.put(h),n=h.height+1}return Promise.resolve(i.done).then(function(){return Promise.resolve(fetch("https://ordinals.gorillapool.io/api/blocks/list/"+n+"?limit="+p)).then(function(n){return t=n,Promise.resolve(t.json()).then(function(t){r=t})})})},function(){return r.length==p});if(o&&o.then)return o.then(function(){})})})}catch(t){return r(t)}return o&&o.then?o.then(void 0,r):o}(0,function(t){console.error(t)})}catch(t){return r(!0,t)}return o&&o.then?o.then(r.bind(null,!1),r.bind(null,!0)):r(!1,o)}(0,function(n,e){if(t.syncInProgress=!1,setTimeout(function(){return t.syncBlocks()},6e4),n)throw e;return e});if(o&&o.then)return o.then(function(){})})})}catch(t){return Promise.reject(t)}},e.isValidRootForHeight=function(t,n){try{return Promise.resolve(this.db).then(function(e){return Promise.resolve(e.get("headers",n)).then(function(n){return(null==n?void 0:n.merkleroot)==t})})}catch(t){return Promise.reject(t)}},e.getHashByHeight=function(t){try{return Promise.resolve(this.db).then(function(n){return Promise.resolve(n.get("headers",t)).then(function(t){return null==t?void 0:t.hash})})}catch(t){return Promise.reject(t)}},e.getHeightByHash=function(t){try{return Promise.resolve(this.db).then(function(n){return Promise.resolve(n.getFromIndex("headers","byHash",t)).then(function(t){return null==t?void 0:t.height})})}catch(t){return Promise.reject(t)}},t}();function m(t,n,e){if(!t.s){if(e instanceof y){if(!e.s)return void(e.o=m.bind(null,t,n));1&n&&(n=e.s),e=e.v}if(e&&e.then)return void e.then(m.bind(null,t,n),m.bind(null,t,2));t.s=n,t.v=e;var r=t.o;r&&r(t)}}const y=/*#__PURE__*/function(){function t(){}return t.prototype.then=function(n,e){const r=new t,o=this.s;if(o){const t=1&o?n:e;if(t){try{m(r,1,t(this.v))}catch(t){m(r,2,t)}return r}return this}return this.o=function(t){try{const o=t.v;1&t.s?m(r,1,n?n(o):o):e?m(r,1,e(o)):m(r,2,o)}catch(t){m(r,2,t)}},r},t}();function g(t){return t instanceof y&&1&t.s}function x(t,n,e){for(var r;;){var o=t();if(g(o)&&(o=o.v),!o)return i;if(o.then){r=0;break}var i=e();if(i&&i.then){if(!g(i)){r=1;break}i=i.s}if(n){var u=n();if(u&&u.then&&!g(u)){r=2;break}}}var s=new y,h=m.bind(null,s,2);return(0===r?o.then(a):1===r?i.then(c):u.then(f)).then(void 0,h),s;function c(r){i=r;do{if(n&&(u=n())&&u.then&&!g(u))return void u.then(f).then(void 0,h);if(!(o=t())||g(o)&&!o.v)return void m(s,1,i);if(o.then)return void o.then(a).then(void 0,h);g(i=e())&&(i=i.v)}while(!i||!i.then);i.then(c).then(void 0,h)}function a(t){t?(i=e())&&i.then?i.then(c).then(void 0,h):c(i):m(s,1,i)}function f(){(o=t())?o.then?o.then(a).then(void 0,h):a(o):m(s,1,i)}}function P(t,n){try{var e=t()}catch(t){return n(t)}return e&&e.then?e.then(void 0,n):e}function w(t,n){try{var e=t()}catch(t){return n(!0,t)}return e&&e.then?e.then(n.bind(null,!1),n.bind(null,!0)):n(!1,e)}var k="undefined"!=typeof Symbol?Symbol.iterator||(Symbol.iterator=Symbol("Symbol.iterator")):"@@iterator";exports.TxoStore=/*#__PURE__*/function(){function r(t,e,r){var o=this;void 0===e&&(e=[]),void 0===r&&(r=new Set),this.accountId=void 0,this.indexers=void 0,this.addresses=void 0,this.db=void 0,this.blocks=new b,this.accountId=t,this.indexers=e,this.addresses=r,this.indexers.forEach(function(t){return t.addresses=o.addresses}),this.db=n.openDB("txostore-"+t,1,{upgrade:function(t){var n=t.createObjectStore("txos",{keyPath:["txid","vout"]});n.createIndex("events","events",{multiEntry:!0}),n.createIndex("owner","owner"),t.createObjectStore("txns",{keyPath:"txid"})}})}var i=r.prototype;return i.getTx=function(n,e){void 0===e&&(e=!1);try{var r=this;return Promise.resolve(r.db).then(function(o){return Promise.resolve(o.get("txns",n)).then(function(o){if(o){var i=t.Transaction.fromBinary(Array.from(new Uint8Array(o.rawtx)));return i.merklePath=t.MerklePath.fromBinary(Array.from(o.proof)),i}if(e)return console.log("Fetching",n),Promise.resolve(Promise.all([fetch("https://junglebus.gorillapool.io/v1/transaction/get/"+n+"/bin").then(function(t){return t.arrayBuffer()}),fetch("https://junglebus.gorillapool.io/v1/transaction/proof/"+n).then(function(t){return t.arrayBuffer()})])).then(function(e){var i,u=e[0],s=e[1],a=t.Transaction.fromBinary(Array.from(new Uint8Array(u)));return a.merklePath=t.MerklePath.fromBinary(Array.from(new Uint8Array(s))),o={txid:n,rawtx:new Uint8Array(u),proof:new Uint8Array(s),block:new c(a.merklePath.blockHeight,BigInt((null==(i=a.merklePath.path[0].find(function(t){return t.hash==n}))?void 0:i.offset)||0)),status:h.CONFIRMED},Promise.resolve(r.db).then(function(t){return Promise.resolve(t.put("txns",o)).then(function(){return a})})})})})}catch(t){return Promise.reject(t)}},i.getTxo=function(t,n){try{return Promise.resolve(this.db).then(function(e){return e.get("txos",[t,n])})}catch(t){return Promise.reject(t)}},i.searchTxos=function(t,n,e){void 0===n&&(n=10);try{var r,i,u=this;return Promise.resolve(u.db).then(function(s){var h;function c(t){return h?t:(delete v.nextPage,console.timeEnd("findTxos"),v)}var a=t.toQueryKey(),l=IDBKeyRange.bound(e||a,a+"￿",!0,!1),v={txos:[]};console.time("findTxos");var d,p=!1,b=!1,m=w(function(){return P(function(){return r=o(s.transaction("txos").store.index("events").iterate(l)),x(function(){function t(t){return!h&&(p=!(i=t).done)}return h?!!t(!h&&r.next()):Promise.resolve(!h&&r.next()).then(t)},function(){return!!(p=!1)},function(){var e=i.value,r=f.fromObject(e.value,u.indexers);if(v.nextPage=e.key,!t.owner||r.owner==t.owner)return v.txos.push(r),console.timeLog("findTxos",r.txid,r.vout),v.txos.length>=n?(console.timeEnd("findTxos"),h=1,v):void 0})},function(t){b=!0,d=t})},function(t,n){function e(e){if(h)return e;if(t)throw n;return n}var o=w(function(){var t=function(){if(p&&null!=r.return)return Promise.resolve(r.return()).then(function(){})}();if(t&&t.then)return t.then(function(){})},function(t,n){if(b)throw d;if(t)throw n;return n});return o&&o.then?o.then(e):e(o)});return m&&m.then?m.then(c):c(m)})}catch(t){return Promise.reject(t)}},i.ingest=function(n,r){void 0===r&&(r=!1);try{var i,s,h,c,l=function(){function l(r){return Promise.resolve(v.db).then(function(r){function l(e){function r(t){v.indexers.forEach(function(t){return t.save&&t.save(b)});for(var n,e=function(){var t,e,r=n.value;r.events=[];var o=r.spend?"1":"0",i=((null==(t=r.spend)||null==(t=t.block)?void 0:t.height)||(null==(e=r.block)?void 0:e.height)||Date.now()).toString(16).padStart(8,"0");r.owner&&v.addresses.has(r.owner)&&Object.entries(r.data).forEach(function(t){var n=t[0];t[1].events.forEach(function(t){var e;r.events.push(n+":"+t.id+":"+t.value+":"+o+":"+i+":"+(null==(e=r.block)?void 0:e.idx)+":"+r.vout+":"+r.satoshis)})}),y.store.put(r)},r=u(b.txos);!(n=r()).done;)e();return Promise.resolve(y.done).then(function(){return b})}var i,s=!1,a=!1,l=w(function(){return P(function(){h=o(n.outputs.entries());var e=x(function(){return Promise.resolve(h.next()).then(function(t){return s=!(c=t).done})},function(){return!!(s=!1)},function(){var n=c.value,e=n[0],r=n[1];return Promise.resolve(y.store.get([d,e])).then(function(n){var o;if(n)o=f.fromObject(n);else{var i=r.lockingScript.toBinary();o=new f(d,e,BigInt(r.satoshis),new Uint8Array(i))}o.owner||(o.owner=function(n,e){var r,o,i,u,s;return void 0===e&&(e=0),(null==(r=n.chunks[0+e])?void 0:r.op)===t.OP.OP_DUP&&(null==(o=n.chunks[1+e])?void 0:o.op)===t.OP.OP_HASH160&&20===(null==(i=n.chunks[2+e])||null==(i=i.data)?void 0:i.length)&&(null==(u=n.chunks[3+e])?void 0:u.op)===t.OP.OP_EQUALVERIFY&&(null==(s=n.chunks[4+e])?void 0:s.op)===t.OP.OP_CHECKSIG?t.Utils.toBase58Check(n.chunks[2+e].data,[0]):""}(r.lockingScript,0)),o.block=p,o.events=[],b.txos.push(o),v.indexers.forEach(function(t){var n=t.parse&&t.parse(b,e);n&&(o.data[t.tag]=n)})})});if(e&&e.then)return e.then(function(){})},function(t){a=!0,i=t})},function(t,n){function e(e){if(t)throw n;return n}var r=w(function(){var t=function(){if(s&&null!=h.return)return Promise.resolve(h.return()).then(function(){})}();if(t&&t.then)return t.then(function(){})},function(t,n){if(a)throw i;if(t)throw n;return n});return r&&r.then?r.then(e):e()});return l&&l.then?l.then(r):r()}var m,y=r.transaction("txos","readwrite"),g=!1,k=!1,I=w(function(){return P(function(){i=o(n.inputs.entries());var t=x(function(){return Promise.resolve(i.next()).then(function(t){return g=!(s=t).done})},function(){return!!(g=!1)},function(){var t=s.value,n=t[0],r=t[1];return Promise.resolve(y.store.get([r.sourceTXID,r.sourceOutputIndex])).then(function(t){var o=t?f.fromObject(t,v.indexers):new f(r.sourceTXID,r.sourceOutputIndex,BigInt(r.sourceTransaction.outputs[r.sourceOutputIndex].satoshis),e.Buffer.from(r.sourceTransaction.outputs[r.sourceOutputIndex].lockingScript.toBinary()));o.spend=new a(d,n,p),b.spends.push(o),y.store.put(o)})});if(t&&t.then)return t.then(function(){})},function(t){k=!0,m=t})},function(t,n){function e(e){if(t)throw n;return n}var r=w(function(){var t=function(){if(g&&null!=i.return)return Promise.resolve(i.return()).then(function(){})}();if(t&&t.then)return t.then(function(){})},function(t,n){if(k)throw m;if(t)throw n;return n});return r&&r.then?r.then(e):e()});return I&&I.then?I.then(l):l()})}var b={txid:d,tx:n,block:p,spends:[],txos:[]},I=function(t,n,e){if("function"==typeof t[k]){var r,o,i,u=t[k]();if(function t(e){try{for(;!(r=u.next()).done;)if((e=n(r.value))&&e.then){if(!g(e))return void e.then(t,i||(i=m.bind(null,o=new y,2)));e=e.v}o?m(o,1,e):o=e}catch(t){m(o||(o=new y),2,t)}}(),u.return){var s=function(t){try{r.done||u.return()}catch(t){}return t};if(o&&o.then)return o.then(s,function(t){throw s(t)});s()}return o}if(!("length"in t))throw new TypeError("Object is not iterable");for(var h=[],c=0;c<t.length;c++)h.push(t[c]);return function(t,n,e){var r,o,i=-1;return function e(u){try{for(;++i<t.length;)if((u=n(i))&&u.then){if(!g(u))return void u.then(e,o||(o=m.bind(null,r=new y,2)));u=u.v}r?m(r,1,u):r=u}catch(t){m(r||(r=new y),2,t)}}(),r}(h,function(t){return n(h[t])})}(n.inputs,function(t){return t.sourceTXID||(t.sourceTXID=t.sourceTransaction.id("hex")),t.sourceTransaction?Promise.resolve(v.db).then(function(n){return Promise.resolve(n.getKey("txns",t.sourceTXID)).then(function(n){if(!n)return Promise.resolve(v.ingest(t.sourceTransaction)).then(function(){})})}):Promise.resolve(v.getTx(t.sourceTXID,r)).then(function(n){if(t.sourceTransaction=n,!t.sourceTransaction)throw new Error("Failed to get source tx "+t.sourceTXID)})});return I&&I.then?I.then(l):l()},v=this,d=n.id("hex"),p={height:Date.now(),idx:0n},b=function(){if(n.merklePath){var t,e=n.hash("hex"),r=(null==(t=n.merklePath.path[0].find(function(t){return t.hash==e}))?void 0:t.offset)||0;return p.height=n.merklePath.blockHeight,p.idx=BigInt(r),Promise.resolve(v.blocks.getHashByHeight(n.merklePath.blockHeight)).then(function(t){p.hash=t||""})}}();return Promise.resolve(b&&b.then?b.then(l):l())}catch(t){return Promise.reject(t)}},r}();
//# sourceMappingURL=index.cjs.map
