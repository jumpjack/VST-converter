meta:
  endian: le
  id: vst
  file-extension: vst

seq:
  - id: vista_header
    type: vst_header
  - id : bounding_box
    type : bounding_box
  - id : texture_ref
    size : 2048
  - id : coordinate_system
    size : 4096

#  - id : vertices
#    type : vertex
#    repeat: expr
#    repeat-expr: vista_header.vertex_count - 351910 # debug
#  - id : lods
#    type : first_lod
#    repeat : expr
#    repeat-expr : 1 # vista_header.lods_count  debug

instances:
  vertices:
    type : vertex
    repeat: expr
    repeat-expr: vista_header.vertex_count   # debug number of vertex
  lods:
    pos:  40 +  24  +   texture_ref.size * vista_header.textures_count  + coordinate_system.size  + vista_header.vertex_count * 4 * 5
    type : lod
    repeat : expr
    repeat-expr:  vista_header.lods_count # debug number of lods


types:
  vst_header:
    seq:
    - id: magic
      contents: 'VST'
    - id: end
      type: str
      size: 1
      encoding: ASCII
    - id : endianness
      type : u4
    - id : major
      type : u4
    - id : minor
      type : u4
    - id: impl_id
      type : u4
    - id : res
      type : u8
    - id : textures_count
      type : u4
    - id : vertex_count
      type : u4
    - id : lods_count
      type : u4
  bounding_box:
    seq :
      - id : xmin
        type : f4
      - id : ymin
        type : f4
      - id : zmin
        type : f4
      - id : xmax
        type : f4
      - id : ymax
        type : f4
      - id : zmax
        type : f4
  vertex_list:
    seq:
      - id : vertex
        type : vertex
  vertex:
    seq:
      - id : s
        type : f4
      - id : t
        type : f4
      - id : x
        type : f4
      - id : y
        type : f4
      - id : z
        type : f4

  lod:
    seq:
    - id : header
      type: lod_header
    - id : bounding_box
      type: bounding_box
    - id : patches
      type : patch
      repeat : expr
      repeat-expr :  header.patches_count


  lod_header:
    #size: 28 bytes (0x1c)
    seq:
      - id: size
        type : u4
      - id : reserved
        type: u8
      - id : vertex_count
        type : u4
      - id : threshold
        type: f4
      - id : patches_count
        type : u4
      - id : highest_vertex
        type: u4

  patch :
     seq:
      - id: header
        type : patch_header
      - id : triangles_strips_lengths  # IndexArrayLength x n, n = header
        type : u4
        repeat : expr
        repeat-expr: header.strips_count
      - id : pointers_to_vertex_of_faces # IndexArray x n
        # get the faces as a single big group of vertex,
        # for further processing
        type : u4
        repeat : expr
        repeat-expr: header.index_count



  patch_header:
    seq:
      - id : reserved
        type : u8
      - id : patch_type
        type : u4
      - id : texture_index
        type : u4
      - id : strips_count # index_arrays_count # Number of  Index arrays (triangle strips) in the patch (faces?)
        type : u4
      - id : index_count # Total  number  of  Index listed in the patch
        type : u4



