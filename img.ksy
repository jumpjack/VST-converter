meta:
  id: img_gray16
  file-extension: img
  endian: be

seq:
  - id: version_line
    type: str
    terminator: 0x0d
    encoding: ASCII
  - id : sep
    size : 3

  - id: pds_label_line1
    type: str
    terminator: 0x0d
    encoding: ASCII
  - id : sep1
    size : 3

  - id:  pds_label_line2
    type: str
    terminator: 0x0d
    encoding: ASCII

  - id : sep2
    size : 1


  - id: record_bytes_id
    type: str
    terminator: 0x3d
    encoding: ASCII

  - id: record_bytes_val
    type: str
    terminator: 0x0d
    encoding: ASCII

  - id : sep3
    size : 1


  - id: file_records_id
    type: str
    terminator: 0x3d
    encoding: ASCII

  - id: file_records_val
    type: str
    terminator: 0x0d
    encoding: ASCII

  - id : sep4
    size : 1


  - id: label_records_id
    type: str
    terminator: 0x3d
    encoding: ASCII

  - id: label_records_val
    type: str
    terminator: 0x0d
    encoding: ASCII

  - id : sep5
    size : 1

  - id :  remaining_pds
    size: record_bytes_val.to_i * label_records_val.to_i - (version_line.length+3+1 +
      pds_label_line1.length+3+1 +
      pds_label_line2.length+3+1 +
      record_bytes_id.length + record_bytes_val.length +1+1 +
      file_records_id.length + file_records_val.length +1+1 +
      label_records_id.length + label_records_val.length +1+1) - 1

  - id : vicar_label_size_id
    type: str
    encoding : ASCII
    terminator: 0x3d

  - id : vicar_label_size_val
    type: str
    encoding : ASCII
    terminator: 0x20

  - id : vicar_label
    type : str
    encoding : ASCII
    size :  vicar_label_length -  (vicar_label_size_id.length+1) - (vicar_label_size_val.length+1)

  - id: lines
    type: image_line
    repeat: eos

instances:
  vicar_label_length:
    value:  vicar_label_size_val.to_i

types:
  image_line:
    seq:
      - id: samples
        type: u2
        repeat : expr
        repeat-expr: 1024
