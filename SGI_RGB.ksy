# http://paulbourke.net/dataformats/sgirgb/
meta:
  id: rgb
  file-extension: rgb
  endian: be

seq:
  - id: hdr
    type: header
  - id : image
    type: image_data
types:
  header:
    seq:
      - id: magic
        type : u2
      - id: compression
        type: u1
      - id: bytes_per_pixel
        type : u1
      - id: image_dimension #1= single row, 2 = 2d, 3 = multiple 2d
        type : u2
      - id: width
        type: u2
      - id: height
        type: u2
      - id : channels_num # 1 = greyscale, 3=RGB, 4 = RGBA
        type: u2
      - id: min_pixel
        type: u4
      - id: max_pixel
        type: u4
      - id: reserved
        size: 4
      - id: name
        size: 80
      - id : color_map_id # 0=norm, 1=dithered, 2=index color, 3=not image but colormap
        size : 4
      - id : filler
        size : 404 # image data start at offset 512
  image_data:
    seq:
      - id :  image_lines
        size: 1024
        repeat: expr
        repeat-expr: 1024

