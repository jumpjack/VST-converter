// This is a generated file! Please edit source .ksy file and use kaitai-struct-compiler to rebuild
// based on PPM.KSY v2.0 (new width/size)
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['kaitai-struct/KaitaiStream'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('kaitai-struct/KaitaiStream'));
  } else {
    root.Ppm = factory(root.KaitaiStream);
  }
}(typeof self !== 'undefined' ? self : this, function (KaitaiStream) {
var Ppm = (function() {
  function Ppm(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  Ppm.prototype._read = function() {
    this.hdr = new Header(this._io, this, this._root);
    this.image = new ImageData(this._io, this, this._root);
  }

  var Header = Ppm.Header = (function() {
    function Header(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    Header.prototype._read = function() {
      this.magic = this._io.readU2be();
      this.separator1 = this._io.readBytes(1);
      this.comment = KaitaiStream.bytesToStr(this._io.readBytesTerm(10, false, true, true), "ASCII");
      this.width = KaitaiStream.bytesToStr(this._io.readBytesTerm(32, false, true, true), "ASCII");
      this.height = KaitaiStream.bytesToStr(this._io.readBytesTerm(10, false, true, true), "ASCII");
      this.depth = KaitaiStream.bytesToStr(this._io.readBytesTerm(10, false, true, true), "ASCII");
    }

    return Header;
  })();

  var ImageData = Ppm.ImageData = (function() {
    function ImageData(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    ImageData.prototype._read = function() {
      this.data = this._io.readBytes(((Number.parseInt(this._parent.width, 10) * Number.parseInt(this._parent.height, 10)) * 3));
    }

    return ImageData;
  })();

  var Strnum = Ppm.Strnum = (function() {
    function Strnum(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    Strnum.prototype._read = function() {
      this.figure1 = this._io.readU1();
      this.figure2 = this._io.readU1();
      this.figure3 = this._io.readU1();
      this.sep = this._io.readBytes(1);
      this.figure1a = this._io.readU1();
      this.figure2a = this._io.readU1();
      this.figure3a = this._io.readU1();
      this.term = this._io.readBytes(1);
    }

    return Strnum;
  })();
  Object.defineProperty(Ppm.prototype, 'width', {
    get: function() {
      if (this._m_width !== undefined)
        return this._m_width;
      this._m_width = this.hdr.width;
      return this._m_width;
    }
  });
  Object.defineProperty(Ppm.prototype, 'height', {
    get: function() {
      if (this._m_height !== undefined)
        return this._m_height;
      this._m_height = this.hdr.height;
      return this._m_height;
    }
  });

  return Ppm;
})();
return Ppm;
}));
