
var Module;

if (typeof Module === 'undefined') Module = eval('(function() { try { return Module || {} } catch(e) { return {} } })()');

if (!Module.expectedDataFileDownloads) {
  Module.expectedDataFileDownloads = 0;
  Module.finishedDataFileDownloads = 0;
}
Module.expectedDataFileDownloads++;
(function() {
 var loadPackage = function(metadata) {

  var PACKAGE_PATH;
  if (typeof window === 'object') {
    PACKAGE_PATH = window['encodeURIComponent'](window.location.pathname.toString().substring(0, window.location.pathname.toString().lastIndexOf('/')) + '/');
  } else if (typeof location !== 'undefined') {
      // worker
      PACKAGE_PATH = encodeURIComponent(location.pathname.toString().substring(0, location.pathname.toString().lastIndexOf('/')) + '/');
    } else {
      throw 'using preloaded data can only be done on a web page or in a web worker';
    }
    var PACKAGE_NAME = 'game.data';
    var REMOTE_PACKAGE_BASE = 'game.data';
    if (typeof Module['locateFilePackage'] === 'function' && !Module['locateFile']) {
      Module['locateFile'] = Module['locateFilePackage'];
      Module.printErr('warning: you defined Module.locateFilePackage, that has been renamed to Module.locateFile (using your locateFilePackage for now)');
    }
    var REMOTE_PACKAGE_NAME = typeof Module['locateFile'] === 'function' ?
    Module['locateFile'](REMOTE_PACKAGE_BASE) :
    ((Module['filePackagePrefixURL'] || '') + REMOTE_PACKAGE_BASE);

    var REMOTE_PACKAGE_SIZE = metadata.remote_package_size;
    var PACKAGE_UUID = metadata.package_uuid;

    function fetchRemotePackage(packageName, packageSize, callback, errback) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', packageName, true);
      xhr.responseType = 'arraybuffer';
      xhr.onprogress = function(event) {
        var url = packageName;
        var size = packageSize;
        if (event.total) size = event.total;
        if (event.loaded) {
          if (!xhr.addedTotal) {
            xhr.addedTotal = true;
            if (!Module.dataFileDownloads) Module.dataFileDownloads = {};
            Module.dataFileDownloads[url] = {
              loaded: event.loaded,
              total: size
            };
          } else {
            Module.dataFileDownloads[url].loaded = event.loaded;
          }
          var total = 0;
          var loaded = 0;
          var num = 0;
          for (var download in Module.dataFileDownloads) {
            var data = Module.dataFileDownloads[download];
            total += data.total;
            loaded += data.loaded;
            num++;
          }
          total = Math.ceil(total * Module.expectedDataFileDownloads/num);
          if (Module['setStatus']) Module['setStatus']('Downloading data... (' + loaded + '/' + total + ')');
        } else if (!Module.dataFileDownloads) {
          if (Module['setStatus']) Module['setStatus']('Downloading data...');
        }
      };
      xhr.onerror = function(event) {
        throw new Error("NetworkError for: " + packageName);
      }
      xhr.onload = function(event) {
        if (xhr.status == 200 || xhr.status == 304 || xhr.status == 206 || (xhr.status == 0 && xhr.response)) { // file URLs can return 0
          var packageData = xhr.response;
          callback(packageData);
        } else {
          throw new Error(xhr.statusText + " : " + xhr.responseURL);
        }
      };
      xhr.send(null);
    };

    function handleError(error) {
      console.error('package error:', error);
    };

    function runWithFS() {

      function assert(check, msg) {
        if (!check) throw msg + new Error().stack;
      }
      Module['FS_createPath']('/', '.git', true, true);
      Module['FS_createPath']('/.git', 'branches', true, true);
      Module['FS_createPath']('/.git', 'hooks', true, true);
      Module['FS_createPath']('/.git', 'info', true, true);
      Module['FS_createPath']('/.git', 'logs', true, true);
      Module['FS_createPath']('/.git/logs', 'refs', true, true);
      Module['FS_createPath']('/.git/logs/refs', 'heads', true, true);
      Module['FS_createPath']('/.git/logs/refs', 'remotes', true, true);
      Module['FS_createPath']('/.git/logs/refs/remotes', 'origin', true, true);
      Module['FS_createPath']('/.git', 'objects', true, true);
      Module['FS_createPath']('/.git/objects', '02', true, true);
      Module['FS_createPath']('/.git/objects', '03', true, true);
      Module['FS_createPath']('/.git/objects', '24', true, true);
      Module['FS_createPath']('/.git/objects', '43', true, true);
      Module['FS_createPath']('/.git/objects', '75', true, true);
      Module['FS_createPath']('/.git/objects', '9e', true, true);
      Module['FS_createPath']('/.git/objects', 'b0', true, true);
      Module['FS_createPath']('/.git/objects', 'cc', true, true);
      Module['FS_createPath']('/.git/objects', 'info', true, true);
      Module['FS_createPath']('/.git/objects', 'pack', true, true);
      Module['FS_createPath']('/.git', 'refs', true, true);
      Module['FS_createPath']('/.git/refs', 'heads', true, true);
      Module['FS_createPath']('/.git/refs', 'remotes', true, true);
      Module['FS_createPath']('/.git/refs/remotes', 'origin', true, true);
      Module['FS_createPath']('/.git/refs', 'tags', true, true);

      function DataRequest(start, end, crunched, audio) {
        this.start = start;
        this.end = end;
        this.crunched = crunched;
        this.audio = audio;
      }
      DataRequest.prototype = {
        requests: {},
        open: function(mode, name) {
          this.name = name;
          this.requests[name] = this;
          Module['addRunDependency']('fp ' + this.name);
        },
        send: function() {},
        onload: function() {
          var byteArray = this.byteArray.subarray(this.start, this.end);

          this.finish(byteArray);

        },
        finish: function(byteArray) {
          var that = this;

        Module['FS_createDataFile'](this.name, null, byteArray, true, true, true); // canOwn this data in the filesystem, it is a slide into the heap that will never change
        Module['removeRunDependency']('fp ' + that.name);

        this.requests[this.name] = null;
      }
    };

    var files = metadata.files;
    for (i = 0; i < files.length; ++i) {
      new DataRequest(files[i].start, files[i].end, files[i].crunched, files[i].audio).open('GET', files[i].filename);
    }


    var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
    var IDB_RO = "readonly";
    var IDB_RW = "readwrite";
    var DB_NAME = "EM_PRELOAD_CACHE";
    var DB_VERSION = 1;
    var METADATA_STORE_NAME = 'METADATA';
    var PACKAGE_STORE_NAME = 'PACKAGES';
    function openDatabase(callback, errback) {
      try {
        var openRequest = indexedDB.open(DB_NAME, DB_VERSION);
      } catch (e) {
        return errback(e);
      }
      openRequest.onupgradeneeded = function(event) {
        var db = event.target.result;

        if(db.objectStoreNames.contains(PACKAGE_STORE_NAME)) {
          db.deleteObjectStore(PACKAGE_STORE_NAME);
        }
        var packages = db.createObjectStore(PACKAGE_STORE_NAME);

        if(db.objectStoreNames.contains(METADATA_STORE_NAME)) {
          db.deleteObjectStore(METADATA_STORE_NAME);
        }
        var metadata = db.createObjectStore(METADATA_STORE_NAME);
      };
      openRequest.onsuccess = function(event) {
        var db = event.target.result;
        callback(db);
      };
      openRequest.onerror = function(error) {
        errback(error);
      };
    };

    /* Check if there's a cached package, and if so whether it's the latest available */
    function checkCachedPackage(db, packageName, callback, errback) {
      var transaction = db.transaction([METADATA_STORE_NAME], IDB_RO);
      var metadata = transaction.objectStore(METADATA_STORE_NAME);

      var getRequest = metadata.get("metadata/" + packageName);
      getRequest.onsuccess = function(event) {
        var result = event.target.result;
        if (!result) {
          return callback(false);
        } else {
          return callback(PACKAGE_UUID === result.uuid);
        }
      };
      getRequest.onerror = function(error) {
        errback(error);
      };
    };

    function fetchCachedPackage(db, packageName, callback, errback) {
      var transaction = db.transaction([PACKAGE_STORE_NAME], IDB_RO);
      var packages = transaction.objectStore(PACKAGE_STORE_NAME);

      var getRequest = packages.get("package/" + packageName);
      getRequest.onsuccess = function(event) {
        var result = event.target.result;
        callback(result);
      };
      getRequest.onerror = function(error) {
        errback(error);
      };
    };

    function cacheRemotePackage(db, packageName, packageData, packageMeta, callback, errback) {
      var transaction_packages = db.transaction([PACKAGE_STORE_NAME], IDB_RW);
      var packages = transaction_packages.objectStore(PACKAGE_STORE_NAME);

      var putPackageRequest = packages.put(packageData, "package/" + packageName);
      putPackageRequest.onsuccess = function(event) {
        var transaction_metadata = db.transaction([METADATA_STORE_NAME], IDB_RW);
        var metadata = transaction_metadata.objectStore(METADATA_STORE_NAME);
        var putMetadataRequest = metadata.put(packageMeta, "metadata/" + packageName);
        putMetadataRequest.onsuccess = function(event) {
          callback(packageData);
        };
        putMetadataRequest.onerror = function(error) {
          errback(error);
        };
      };
      putPackageRequest.onerror = function(error) {
        errback(error);
      };
    };

    function processPackageData(arrayBuffer) {
      Module.finishedDataFileDownloads++;
      assert(arrayBuffer, 'Loading data file failed.');
      assert(arrayBuffer instanceof ArrayBuffer, 'bad input to processPackageData');
      var byteArray = new Uint8Array(arrayBuffer);
      var curr;

        // copy the entire loaded file into a spot in the heap. Files will refer to slices in that. They cannot be freed though
        // (we may be allocating before malloc is ready, during startup).
        if (Module['SPLIT_MEMORY']) Module.printErr('warning: you should run the file packager with --no-heap-copy when SPLIT_MEMORY is used, otherwise copying into the heap may fail due to the splitting');
        var ptr = Module['getMemory'](byteArray.length);
        Module['HEAPU8'].set(byteArray, ptr);
        DataRequest.prototype.byteArray = Module['HEAPU8'].subarray(ptr, ptr+byteArray.length);

        var files = metadata.files;
        for (i = 0; i < files.length; ++i) {
          DataRequest.prototype.requests[files[i].filename].onload();
        }
        Module['removeRunDependency']('datafile_game.data');

      };
      Module['addRunDependency']('datafile_game.data');

      if (!Module.preloadResults) Module.preloadResults = {};

      function preloadFallback(error) {
        console.error(error);
        console.error('falling back to default preload behavior');
        fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE, processPackageData, handleError);
      };

      openDatabase(
        function(db) {
          checkCachedPackage(db, PACKAGE_PATH + PACKAGE_NAME,
            function(useCached) {
              Module.preloadResults[PACKAGE_NAME] = {fromCache: useCached};
              if (useCached) {
                console.info('loading ' + PACKAGE_NAME + ' from cache');
                fetchCachedPackage(db, PACKAGE_PATH + PACKAGE_NAME, processPackageData, preloadFallback);
              } else {
                console.info('loading ' + PACKAGE_NAME + ' from remote');
                fetchRemotePackage(REMOTE_PACKAGE_NAME, REMOTE_PACKAGE_SIZE,
                  function(packageData) {
                    cacheRemotePackage(db, PACKAGE_PATH + PACKAGE_NAME, packageData, {uuid:PACKAGE_UUID}, processPackageData,
                      function(error) {
                        console.error(error);
                        processPackageData(packageData);
                      });
                  }
                  , preloadFallback);
              }
            }
            , preloadFallback);
        }
        , preloadFallback);

      if (Module['setStatus']) Module['setStatus']('Downloading...');

    }
    if (Module['calledRun']) {
      runWithFS();
    } else {
      if (!Module['preRun']) Module['preRun'] = [];
      Module["preRun"].push(runWithFS); // FS is not initialized yet, wait for it
    }

  }
  loadPackage({"package_uuid":"88c02b77-0517-43d4-8c1f-963bb099bb9c","remote_package_size":44043,"files":[{"filename":"/.git/COMMIT_EDITMSG","crunched":0,"start":0,"end":13,"audio":false},{"filename":"/.git/HEAD","crunched":0,"start":13,"end":36,"audio":false},{"filename":"/.git/config","crunched":0,"start":36,"end":248,"audio":false},{"filename":"/.git/description","crunched":0,"start":248,"end":321,"audio":false},{"filename":"/.git/hooks/applypatch-msg.sample","crunched":0,"start":321,"end":799,"audio":false},{"filename":"/.git/hooks/commit-msg.sample","crunched":0,"start":799,"end":1695,"audio":false},{"filename":"/.git/hooks/fsmonitor-watchman.sample","crunched":0,"start":1695,"end":6350,"audio":false},{"filename":"/.git/hooks/post-update.sample","crunched":0,"start":6350,"end":6539,"audio":false},{"filename":"/.git/hooks/pre-applypatch.sample","crunched":0,"start":6539,"end":6963,"audio":false},{"filename":"/.git/hooks/pre-commit.sample","crunched":0,"start":6963,"end":8606,"audio":false},{"filename":"/.git/hooks/pre-merge-commit.sample","crunched":0,"start":8606,"end":9022,"audio":false},{"filename":"/.git/hooks/pre-push.sample","crunched":0,"start":9022,"end":10396,"audio":false},{"filename":"/.git/hooks/pre-rebase.sample","crunched":0,"start":10396,"end":15294,"audio":false},{"filename":"/.git/hooks/pre-receive.sample","crunched":0,"start":15294,"end":15838,"audio":false},{"filename":"/.git/hooks/prepare-commit-msg.sample","crunched":0,"start":15838,"end":17330,"audio":false},{"filename":"/.git/hooks/push-to-checkout.sample","crunched":0,"start":17330,"end":20113,"audio":false},{"filename":"/.git/hooks/update.sample","crunched":0,"start":20113,"end":23763,"audio":false},{"filename":"/.git/index","crunched":0,"start":23763,"end":24276,"audio":false},{"filename":"/.git/info/exclude","crunched":0,"start":24276,"end":24516,"audio":false},{"filename":"/.git/logs/HEAD","crunched":0,"start":24516,"end":24693,"audio":false},{"filename":"/.git/logs/refs/heads/master","crunched":0,"start":24693,"end":24870,"audio":false},{"filename":"/.git/logs/refs/remotes/origin/master","crunched":0,"start":24870,"end":25031,"audio":false},{"filename":"/.git/objects/02/a769fbdbef6eb28f04d7012a98ee631758b23e","crunched":0,"start":25031,"end":25562,"audio":false},{"filename":"/.git/objects/03/f9111059efa2cd8798d5d5714c5b77bab123f0","crunched":0,"start":25562,"end":25653,"audio":false},{"filename":"/.git/objects/24/cc2065cfbbc3d8f4810d2b5df812215362fe1f","crunched":0,"start":25653,"end":25735,"audio":false},{"filename":"/.git/objects/43/446b418b7101d94a3d50bb3c6efa1bc82c735d","crunched":0,"start":25735,"end":26450,"audio":false},{"filename":"/.git/objects/75/a7c23f40582964df4c5324170af7b07a02f29e","crunched":0,"start":26450,"end":26781,"audio":false},{"filename":"/.git/objects/9e/1a88571058b44163b37f56c6ffc064f89d6f00","crunched":0,"start":26781,"end":26807,"audio":false},{"filename":"/.git/objects/b0/4f4febe5b1380f1cf6be2c7c23aed3330d7b66","crunched":0,"start":26807,"end":26942,"audio":false},{"filename":"/.git/objects/cc/ca6841a326b8eaebd5638362fab5ccae533449","crunched":0,"start":26942,"end":27155,"audio":false},{"filename":"/.git/refs/heads/master","crunched":0,"start":27155,"end":27196,"audio":false},{"filename":"/.git/refs/remotes/origin/master","crunched":0,"start":27196,"end":27237,"audio":false},{"filename":"/.gitignore","crunched":0,"start":27237,"end":27247,"audio":false},{"filename":"/.rope.lua.swp","crunched":0,"start":27247,"end":39535,"audio":false},{"filename":"/Makefile","crunched":0,"start":39535,"end":39643,"audio":false},{"filename":"/README.md","crunched":0,"start":39643,"end":39727,"audio":false},{"filename":"/main.lua","crunched":0,"start":39727,"end":41051,"audio":false},{"filename":"/rope.lua","crunched":0,"start":41051,"end":43130,"audio":false},{"filename":"/vector2.lua","crunched":0,"start":43130,"end":44043,"audio":false}]});

})();
