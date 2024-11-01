// This is a generated file! Please edit source .ksy file and use kaitai-struct-compiler to rebuild

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['kaitai-struct/KaitaiStream'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('kaitai-struct/KaitaiStream'));
  } else {
    root.Vsth = factory(root.KaitaiStream);
  }
}(this, function (KaitaiStream) {
var Vsth = (function() {
  function Vsth(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  Vsth.prototype._read = function() {
    this.vistaHeader = new VstHeader(this._io, this, this._root);
    this.boundingBox = new BoundingBox(this._io, this, this._root);
    this.textureRef = this._io.readBytes(2048);
  }

  var VstHeader = Vsth.VstHeader = (function() {
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

  var BoundingBox = Vsth.BoundingBox = (function() {
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

  return Vsth;
})();
return Vsth;
}));
