// This is a generated file! Please edit source .ksy file and use kaitai-struct-compiler to rebuild

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['kaitai-struct/KaitaiStream'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('kaitai-struct/KaitaiStream'));
  } else {
    root.Vst = factory(root.KaitaiStream);
  }
}(this, function (KaitaiStream) {
var Vst = (function() {
  function Vst(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  Vst.prototype._read = function() {
    this.vistaHeader = new VstHeader(this._io, this, this._root);
    this.boundingBox = new BoundingBox(this._io, this, this._root);
    this.textureRef = this._io.readBytes(2048);
    this.coordinateSystem = this._io.readBytes(4096);
  }

  var VstHeader = Vst.VstHeader = (function() {
    function VstHeader(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    VstHeader.prototype._read = function() {
      this.magic = this._io.readBytes(3);
      if (!((KaitaiStream.byteArrayCompare(this.magic, [86, 83, 84]) == 0))) {
        throw new KaitaiStream.ValidationNotEqualError([86, 83, 84], this.magic, this._io, "/types/vst_header/seq/0");
      }
      this.end = KaitaiStream.bytesToStr(this._io.readBytes(1), "ASCII");
      this.endianness = this._io.readU4le();
      this.major = this._io.readU4le();
      this.minor = this._io.readU4le();
      this.implId = this._io.readU4le();
      this.res = this._io.readU8le();
      this.texturesCount = this._io.readU4le();
      this.vertexCount = this._io.readU4le();
      this.lodsCount = this._io.readU4le();
    }

    return VstHeader;
  })();

  var Vertex = Vst.Vertex = (function() {
    function Vertex(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    Vertex.prototype._read = function() {
      this.s = this._io.readF4le();
      this.t = this._io.readF4le();
      this.x = this._io.readF4le();
      this.y = this._io.readF4le();
      this.z = this._io.readF4le();
    }

    return Vertex;
  })();

  var LodHeader = Vst.LodHeader = (function() {
    function LodHeader(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    LodHeader.prototype._read = function() {
      this.size = this._io.readU4le();
      this.reserved = this._io.readU8le();
      this.vertexCount = this._io.readU4le();
      this.threshold = this._io.readF4le();
      this.patchesCount = this._io.readU4le();
      this.highestVertex = this._io.readU4le();
    }

    return LodHeader;
  })();

  var Lod = Vst.Lod = (function() {
    function Lod(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    Lod.prototype._read = function() {
      this.header = new LodHeader(this._io, this, this._root);
      this.boundingBox = new BoundingBox(this._io, this, this._root);
      this.patches = new Array(this.header.patchesCount);
      for (var i = 0; i < this.header.patchesCount; i++) {
        this.patches[i] = new Patch(this._io, this, this._root);
      }
    }

    return Lod;
  })();

  var VertexList = Vst.VertexList = (function() {
    function VertexList(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    VertexList.prototype._read = function() {
      this.vertex = new Vertex(this._io, this, this._root);
    }

    return VertexList;
  })();

  var PatchHeader = Vst.PatchHeader = (function() {
    function PatchHeader(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    PatchHeader.prototype._read = function() {
      this.reserved = this._io.readU8le();
      this.patchType = this._io.readU4le();
      this.textureIndex = this._io.readU4le();
      this.stripsCount = this._io.readU4le();
      this.indexCount = this._io.readU4le();
    }

    return PatchHeader;
  })();

  var BoundingBox = Vst.BoundingBox = (function() {
    function BoundingBox(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    BoundingBox.prototype._read = function() {
      this.xmin = this._io.readF4le();
      this.ymin = this._io.readF4le();
      this.zmin = this._io.readF4le();
      this.xmax = this._io.readF4le();
      this.ymax = this._io.readF4le();
      this.zmax = this._io.readF4le();
    }

    return BoundingBox;
  })();

  var Patch = Vst.Patch = (function() {
    function Patch(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    Patch.prototype._read = function() {
      this.header = new PatchHeader(this._io, this, this._root);
      this.trianglesStripsLengths = new Array(this.header.stripsCount);
      for (var i = 0; i < this.header.stripsCount; i++) {
        this.trianglesStripsLengths[i] = this._io.readU4le();
      }
      this.pointersToVertexOfFaces = new Array(this.header.indexCount);
      for (var i = 0; i < this.header.indexCount; i++) {
        this.pointersToVertexOfFaces[i] = this._io.readU4le();
      }
    }

    return Patch;
  })();
  Object.defineProperty(Vst.prototype, 'vertices', {
    get: function() {
      if (this._m_vertices !== undefined)
        return this._m_vertices;
      this._m_vertices = new Array(this.vistaHeader.vertexCount);
      for (var i = 0; i < this.vistaHeader.vertexCount; i++) {
        this._m_vertices[i] = new Vertex(this._io, this, this._root);
      }
      return this._m_vertices;
    }
  });
  Object.defineProperty(Vst.prototype, 'lods', {
    get: function() {
      if (this._m_lods !== undefined)
        return this._m_lods;
      var _pos = this._io.pos;
      this._io.seek(((((40 + 24) + (this.textureRef.length * this.vistaHeader.texturesCount)) + this.coordinateSystem.length) + ((this.vistaHeader.vertexCount * 4) * 5)));
      this._m_lods = new Array(this.vistaHeader.lodsCount);
      for (var i = 0; i < this.vistaHeader.lodsCount; i++) {
        this._m_lods[i] = new Lod(this._io, this, this._root);
      }
      this._io.seek(_pos);
      return this._m_lods;
    }
  });

  return Vst;
})();
return Vst;
}));
