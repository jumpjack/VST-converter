// This is a generated file! Please edit source .ksy file and use kaitai-struct-compiler to rebuild

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['kaitai-struct/KaitaiStream'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('kaitai-struct/KaitaiStream'));
  } else {
    root.Rgb = factory(root.KaitaiStream);
  }
}(this, function (KaitaiStream) {
var Rgb = (function() {
  function Rgb(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  Rgb.prototype._read = function() {
    this.hdr = new Header(this._io, this, this._root);
  }

  var Header = Rgb.Header = (function() {
    function Header(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    Header.prototype._read = function() {
      this.magic = this._io.readU2be();
      this.compression = this._io.readU1();
      this.bytesPerPixel = this._io.readU1();
      this.imageDimension = this._io.readU2be();
      this.width = this._io.readU2be();
      this.height = this._io.readU2be();
      this.channelsNum = this._io.readU2be();
      this.minPixel = this._io.readU4be();
      this.maxPixel = this._io.readU4be();
      this.reserved = this._io.readBytes(4);
      this.name = this._io.readBytes(80);
      this.colorMapId = this._io.readBytes(4);
      this.filler = this._io.readBytes(404);
      this.imageLines = new Array(1024);
      for (var i = 0; i < 1024; i++) {
        this.imageLines[i] = this._io.readBytes(1024);
      }
    }

    return Header;
  })();

  return Rgb;
})();
return Rgb;
}));
