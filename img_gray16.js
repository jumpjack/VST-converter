// This is a generated file! Please edit source .ksy file and use kaitai-struct-compiler to rebuild

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['kaitai-struct/KaitaiStream'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('kaitai-struct/KaitaiStream'));
  } else {
    root.ImgGray16 = factory(root.KaitaiStream);
  }
}(this, function (KaitaiStream) {
var ImgGray16 = (function() {
  function ImgGray16(_io, _parent, _root) {
    this._io = _io;
    this._parent = _parent;
    this._root = _root || this;

    this._read();
  }
  ImgGray16.prototype._read = function() {
    this.versionLine = KaitaiStream.bytesToStr(this._io.readBytesTerm(13, false, true, true), "ASCII");
    this.sep = this._io.readBytes(3);
    this.pdsLabelLine1 = KaitaiStream.bytesToStr(this._io.readBytesTerm(13, false, true, true), "ASCII");
    this.sep1 = this._io.readBytes(3);
    this.pdsLabelLine2 = KaitaiStream.bytesToStr(this._io.readBytesTerm(13, false, true, true), "ASCII");
    this.sep2 = this._io.readBytes(1);
    this.recordBytesId = KaitaiStream.bytesToStr(this._io.readBytesTerm(61, false, true, true), "ASCII");
    this.recordBytesVal = KaitaiStream.bytesToStr(this._io.readBytesTerm(13, false, true, true), "ASCII");
    this.sep3 = this._io.readBytes(1);
    this.fileRecordsId = KaitaiStream.bytesToStr(this._io.readBytesTerm(61, false, true, true), "ASCII");
    this.fileRecordsVal = KaitaiStream.bytesToStr(this._io.readBytesTerm(13, false, true, true), "ASCII");
    this.sep4 = this._io.readBytes(1);
    this.labelRecordsId = KaitaiStream.bytesToStr(this._io.readBytesTerm(61, false, true, true), "ASCII");
    this.labelRecordsVal = KaitaiStream.bytesToStr(this._io.readBytesTerm(13, false, true, true), "ASCII");
    this.sep5 = this._io.readBytes(1);
    this.remainingPds = this._io.readBytes((((Number.parseInt(this.recordBytesVal, 10) * Number.parseInt(this.labelRecordsVal, 10)) - ((((((((((((((((((((this.versionLine.length + 3) + 1) + this.pdsLabelLine1.length) + 3) + 1) + this.pdsLabelLine2.length) + 3) + 1) + this.recordBytesId.length) + this.recordBytesVal.length) + 1) + 1) + this.fileRecordsId.length) + this.fileRecordsVal.length) + 1) + 1) + this.labelRecordsId.length) + this.labelRecordsVal.length) + 1) + 1)) - 1));
    this.vicarLabelSizeId = KaitaiStream.bytesToStr(this._io.readBytesTerm(61, false, true, true), "ASCII");
    this.vicarLabelSizeVal = KaitaiStream.bytesToStr(this._io.readBytesTerm(32, false, true, true), "ASCII");
    this.vicarLabel = KaitaiStream.bytesToStr(this._io.readBytes(((this.vicarLabelLength - (this.vicarLabelSizeId.length + 1)) - (this.vicarLabelSizeVal.length + 1))), "ASCII");
    this.lines = [];
    var i = 0;
    while (!this._io.isEof()) {
      this.lines.push(new ImageLine(this._io, this, this._root));
      i++;
    }
  }

  var ImageLine = ImgGray16.ImageLine = (function() {
    function ImageLine(_io, _parent, _root) {
      this._io = _io;
      this._parent = _parent;
      this._root = _root || this;

      this._read();
    }
    ImageLine.prototype._read = function() {
      this.samples = new Array(1024);
      for (var i = 0; i < 1024; i++) {
        this.samples[i] = this._io.readU2be();
      }
    }

    return ImageLine;
  })();
  Object.defineProperty(ImgGray16.prototype, 'vicarLabelLength', {
    get: function() {
      if (this._m_vicarLabelLength !== undefined)
        return this._m_vicarLabelLength;
      this._m_vicarLabelLength = Number.parseInt(this.vicarLabelSizeVal, 10);
      return this._m_vicarLabelLength;
    }
  });

  return ImgGray16;
})();
return ImgGray16;
}));
