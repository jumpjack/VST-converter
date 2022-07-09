// This is a generated file! Please edit source .ksy file and use kaitai-struct-compiler to rebuild

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['kaitai-struct/KaitaiStream'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('kaitai-struct/KaitaiStream'));
  } else {
    root.Pfb = factory(root.KaitaiStream);
  }
}(typeof self !== 'undefined' ? self : this, function (KaitaiStream) {
var Pfb = (function() {
  function Pfb(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  Pfb.prototype._read = function() {
    this.magic = this._io.readU4le();
    this.unknown1 = this._io.readU4le();
    this.unknown2 = this._io.readU4le();
    this.unknown3 = this._io.readU4le();
    this.nodes = [];
    for (var i = 0; i < 8; i++) {
      this.nodes.push(new Node(this._io, this, this._root));
    }
  }

  var CoordsList = Pfb.CoordsList = (function() {
    function CoordsList(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    CoordsList.prototype._read = function() {
      this.size = this._io.readU4le();
      this.unk1 = this._io.readU4le();
      this.unk2 = this._io.readU4le();
      this.list = [];
      for (var i = 0; i < this.size; i++) {
        this.list.push(new CoordinatePair(this._io, this, this._root));
      }
    }

    return CoordsList;
  })();

  var NormalsList = Pfb.NormalsList = (function() {
    function NormalsList(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    NormalsList.prototype._read = function() {
      this.size = this._io.readU4le();
      this.unk1 = this._io.readU4le();
      this.unk2 = this._io.readU4le();
      this.elements = [];
      for (var i = 0; i < this.size; i++) {
        this.elements.push(new Normal(this._io, this, this._root));
      }
    }

    return NormalsList;
  })();

  var Vertex = Pfb.Vertex = (function() {
    function Vertex(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    Vertex.prototype._read = function() {
      this.x = this._io.readF4le();
      this.y = this._io.readF4le();
      this.z = this._io.readF4le();
    }

    return Vertex;
  })();

  var LengthsList = Pfb.LengthsList = (function() {
    function LengthsList(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    LengthsList.prototype._read = function() {
      this.size = this._io.readU4le();
      this.unk1 = this._io.readU4le();
      this.unk2 = this._io.readU4le();
      this.elements = [];
      for (var i = 0; i < this.size; i++) {
        this.elements.push(this._io.readU4le());
      }
    }

    return LengthsList;
  })();

  var Geosets = Pfb.Geosets = (function() {
    function Geosets(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    Geosets.prototype._read = function() {
      this.count = this._io.readU4le();
      this.size = this._io.readU4le();
      this.geosets = [];
      for (var i = 0; i < this.count; i++) {
        this.geosets.push(new Geoset(this._io, this, this._root));
      }
    }

    return Geosets;
  })();

  var Materials = Pfb.Materials = (function() {
    function Materials(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    Materials.prototype._read = function() {
      this.count = this._io.readU4le();
      this.size = this._io.readU4le();
      this.materials = this._io.readBytes((this.count * 4));
    }

    return Materials;
  })();

  var Normal = Pfb.Normal = (function() {
    function Normal(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    Normal.prototype._read = function() {
      this.nx = this._io.readF4le();
      this.ny = this._io.readF4le();
      this.nz = this._io.readF4le();
    }

    return Normal;
  })();

  var Color = Pfb.Color = (function() {
    function Color(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    Color.prototype._read = function() {
      this.r = this._io.readF4le();
      this.g = this._io.readF4le();
      this.b = this._io.readF4le();
      this.a = this._io.readF4le();
    }

    return Color;
  })();

  var VertexLists = Pfb.VertexLists = (function() {
    function VertexLists(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    VertexLists.prototype._read = function() {
      this.count = this._io.readU4le();
      this.totalSize = this._io.readU4le();
      this.lists = [];
      for (var i = 0; i < this.count; i++) {
        this.lists.push(new VertexList(this._io, this, this._root));
      }
    }

    return VertexLists;
  })();

  var TextcoordLists = Pfb.TextcoordLists = (function() {
    function TextcoordLists(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    TextcoordLists.prototype._read = function() {
      this.count = this._io.readU4le();
      this.totalSize = this._io.readU4le();
      this.lists = [];
      for (var i = 0; i < this.count; i++) {
        this.lists.push(new CoordsList(this._io, this, this._root));
      }
    }

    return TextcoordLists;
  })();

  var CoordinatePair = Pfb.CoordinatePair = (function() {
    function CoordinatePair(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    CoordinatePair.prototype._read = function() {
      this.s = this._io.readF4le();
      this.t = this._io.readF4le();
    }

    return CoordinatePair;
  })();

  var VertexList = Pfb.VertexList = (function() {
    function VertexList(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    VertexList.prototype._read = function() {
      this.size = this._io.readU4le();
      this.unk1 = this._io.readU4le();
      this.unk2 = this._io.readU4le();
      this.elements = [];
      for (var i = 0; i < this.size; i++) {
        this.elements.push(new Vertex(this._io, this, this._root));
      }
    }

    return VertexList;
  })();

  var ColorsLists = Pfb.ColorsLists = (function() {
    function ColorsLists(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    ColorsLists.prototype._read = function() {
      this.count = this._io.readU4le();
      this.totalSize = this._io.readU4le();
      this.lists = [];
      for (var i = 0; i < this.count; i++) {
        this.lists.push(new ColorsList(this._io, this, this._root));
      }
    }

    return ColorsLists;
  })();

  var ColorsList = Pfb.ColorsList = (function() {
    function ColorsList(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    ColorsList.prototype._read = function() {
      this.size = this._io.readU4le();
      this.unk1 = this._io.readU4le();
      this.unk2 = this._io.readU4le();
      this.elements = [];
      for (var i = 0; i < this.size; i++) {
        this.elements.push(new Color(this._io, this, this._root));
      }
    }

    return ColorsList;
  })();

  var Geoset = Pfb.Geoset = (function() {
    function Geoset(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    Geoset.prototype._read = function() {
      this.stripType = this._io.readU4le();
      this.numStrip = this._io.readU4le();
      this.lengthListId = this._io.readS4le();
      this.unk1 = this._io.readU4le();
      this.unk2 = this._io.readU4le();
      this.unk3 = this._io.readU4le();
      this.unk4 = this._io.readU4le();
      this.unk5 = this._io.readU4le();
      this.geostateId = this._io.readU4le();
      this.data6b = this._io.readU4le();
      this.data7 = this._io.readU4le();
      this.data8 = this._io.readU4le();
      this.mask = this._io.readU4le();
      this.data9 = this._io.readU4le();
      this.num = this._io.readU4le();
      this.vec0 = this._io.readF4le();
      this.vec1 = this._io.readF4le();
      this.vec2 = this._io.readF4le();
      this.vec3 = this._io.readF4le();
      this.vec4 = this._io.readF4le();
      this.vec5 = this._io.readF4le();
    }

    return Geoset;
  })();

  var Node = Pfb.Node = (function() {
    function Node(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    Node.prototype._read = function() {
      this.type = this._io.readU4le();
      switch (this.type) {
      case 10:
        this.contents = new Geosets(this._io, this, this._root);
        break;
      case 17:
        this.contents = new TUnknown(this._io, this, this._root);
        break;
      case 0:
        this.contents = new TUnknown(this._io, this, this._root);
        break;
      case 4:
        this.contents = new LenghtsLists(this._io, this, this._root);
        break;
      case 6:
        this.contents = new ColorsLists(this._io, this, this._root);
        break;
      case 7:
        this.contents = new NormalsLists(this._io, this, this._root);
        break;
      case 1:
        this.contents = new Textures(this._io, this, this._root);
        break;
      case 27:
        this.contents = new TUnknown(this._io, this, this._root);
        break;
      case 12:
        this.contents = new TUnknown(this._io, this, this._root);
        break;
      case 3:
        this.contents = new TUnknown(this._io, this, this._root);
        break;
      case 5:
        this.contents = new VertexLists(this._io, this, this._root);
        break;
      case 8:
        this.contents = new TextcoordLists(this._io, this, this._root);
        break;
      case 9:
        this.contents = new TUnknown(this._io, this, this._root);
        break;
      case 18:
        this.contents = new TUnknown(this._io, this, this._root);
        break;
      case 2:
        this.contents = new TUnknown(this._io, this, this._root);
        break;
      }
    }

    return Node;
  })();

  var Textures = Pfb.Textures = (function() {
    function Textures(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    Textures.prototype._read = function() {
      this.count = this._io.readU4le();
      this.totalSize = this._io.readU4le();
      this.textures = [];
      for (var i = 0; i < this.count; i++) {
        this.textures.push(new Texture(this._io, this, this._root));
      }
    }

    return Textures;
  })();

  var Geostates = Pfb.Geostates = (function() {
    function Geostates(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    Geostates.prototype._read = function() {
      this.count = this._io.readU4le();
      this.totalSize = this._io.readU4le();
      this.geostates = this._io.readBytes(this.totalSize);
    }

    return Geostates;
  })();

  var Texture = Pfb.Texture = (function() {
    function Texture(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    Texture.prototype._read = function() {
      this.filename = new PfbString(this._io, this, this._root);
      this.contents = this._io.readBytes(((Math.floor(this._parent.totalSize / this._parent.count) - this.filename.len) - 4));
    }

    return Texture;
  })();

  var LenghtsLists = Pfb.LenghtsLists = (function() {
    function LenghtsLists(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    LenghtsLists.prototype._read = function() {
      this.count = this._io.readU4le();
      this.totalSize = this._io.readU4le();
      this.lists = [];
      for (var i = 0; i < this.count; i++) {
        this.lists.push(new LengthsList(this._io, this, this._root));
      }
    }

    return LenghtsLists;
  })();

  var PfbString = Pfb.PfbString = (function() {
    function PfbString(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    PfbString.prototype._read = function() {
      this.len = this._io.readU4le();
      this.contents = KaitaiStream.bytesToStr(this._io.readBytes(this.len), "ASCII");
    }

    return PfbString;
  })();

  var NormalsLists = Pfb.NormalsLists = (function() {
    function NormalsLists(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    NormalsLists.prototype._read = function() {
      this.count = this._io.readU4le();
      this.totalSize = this._io.readU4le();
      this.lists = [];
      for (var i = 0; i < this.count; i++) {
        this.lists.push(new NormalsList(this._io, this, this._root));
      }
    }

    return NormalsLists;
  })();

  var TUnknown = Pfb.TUnknown = (function() {
    function TUnknown(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    TUnknown.prototype._read = function() {
      this.count = this._io.readU4le();
      this.totalSize = this._io.readU4le();
      this.body = this._io.readBytes(this.totalSize);
    }

    return TUnknown;
  })();

  return Pfb;
})();
return Pfb;
}));
