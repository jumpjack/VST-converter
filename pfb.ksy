meta:
  id: pfb
  file-extension: pfb
  endian : le

seq:
  - id : magic
    type: u4
  - id : unknown1
    type : u4
  - id : unknown2
    type : u4
  - id : unknown3
    type : u4
  - id : nodes
    type : node
    repeat :  expr # eos
    repeat-expr : 8

types:
  node:
    seq:
    - id : type
      type : u4
    - id : contents
      type :
        switch-on: type
        cases:
          0: t_unknown
          1: textures_list
          2: t_unknown
          3: t_unknown
          4: lenghts_lists
          5: vertex_lists
          6: colors_lists
          7: normals_lists
          8: textcoord_lists
          9: t_unknown
          10: t_unknown
          11: t_unknown
          12: t_unknown
          13: t_unknown
          14: t_unknown
          15: t_unknown
          16: t_unknown
          17: t_unknown
          18: t_unknown

  t_unknown:
      seq:
      - id: num
        type : u4
      - id: total_size
        type: u4
      - id : body
        size : total_size

  t_geostates: # type 3
      seq:
      - id: num
        type : u4
      - id: total_size
        type: u4
      - id : body
        size : total_size



  lenghts_lists:  # Type 4   - readLengthLists()
    seq:
      - id : count
        type : u4
      - id : total_size
        type : u4
      - id : lists
        type : lengths_list
        repeat : expr
        repeat-expr : count  # for (unsigned i=0; i<info.numLists; ++i) {   readLengthList(tree->getLengthList(i))   }

  vertex_lists: # Type 5 - readVertexLists()
    seq:
      - id : count
        type : u4
      - id : total_size
        type : u4
      - id : lists
        type : vertex_list
        repeat : expr
        repeat-expr : count    #  for (unsigned i=0; i<info.numLists; ++i) {   readVertexList(tree->getVertexList(i))   )


  colors_lists: # Type 6 #  readColorLists()
    seq:
      - id : count
        type : u4
      - id : total_size
        type : u4
      - id : lists
        type : colors_list
        repeat : expr
        repeat-expr : count    #  for (unsigned i=0; i<info.numLists; ++i) {   readColorList(tree->getColorList(i))   )



  normals_lists: # Type 7 - readNormalLists()
    seq:
      - id : count
        type : u4
      - id : total_size
        type : u4
      - id : lists
        type : normals_list
        repeat : expr
        repeat-expr : count    #  for (unsigned i=0; i<info.numLists; ++i) {   readNormalList(tree->getNormalList(i))   )



  lengths_list:  # readLengthList()
    seq:
      - id: size
        type: u4
      - id : unk1
        type : u4
      - id : unk2
        type : u4
      - id : elements
        type: u4
        repeat : expr
        repeat-expr : size # fread(list.get(0), 4, info.size, f); //  read "size" times a "4" group


  vertex_list:  # readVertexList()
    seq:
      - id: size
        type: u4
      - id : unk1
        type : u4
      - id : unk2
        type : u4
      - id : elements
        type: vertex
        repeat : expr
        repeat-expr : size  # fread(list.get(0), 4*3, info.size, f); // Read "size" times a "4*3" group


  colors_list:  # readColorList()
    seq:
      - id: size
        type: u4
      - id : unk1
        type : u4
      - id : unk2
        type : u4
      - id : elements
        type: color
        repeat : expr
        repeat-expr : size  # fread(list.get(0), 4*4, info.size, f); // Read "size" times a "4*4" group



  normals_list:  # readNormalList()
    seq:
      - id: size
        type: u4
      - id : unk1
        type : u4
      - id : unk2
        type : u4
      - id : elements
        type: normal
        repeat : expr
        repeat-expr : size  # fread(list.get(0), 4*3, info.size, f); // Read "size" times a "4*3" group



  vertex:
    seq:
      - id : x
        type : f4
      - id : y
        type : f4
      - id : z
        type : f4

  normal:
    seq:
      - id : x
        type : f4
      - id : y
        type : f4
      - id : z
        type : f4


  color: # debug: unknown format
    seq:
      - id : r
        type : u4
      - id : g
        type : u4
      - id : b
        type : u4
      - id : a
        type : u4


  textures_list:
    seq:
      - id : num_textures
        type : u4
      - id : total_size
        type : u4
      - id : textures
        type : texture
        repeat : expr
        repeat-expr : num_textures


  texture:
    seq:
      - id : filename
        type : pfb_string
      - id : contents
        size :  _parent.total_size/_parent.num_textures - filename.len - 4  #232


  textcoord_lists: # Type 8 - readTexcoordLists()
    seq:
      - id : num_lists
        type : u4
      - id : total_size
        type : u4
      - id : lists
        type : coords_list
        repeat : expr
        repeat-expr : num_lists    #  for (unsigned i=0; i<info.numLists; ++i) {   readTexcoordList(tree->getTexcoordList(i))    )


  coords_list:  # readTexcoordList()
    seq:
      - id: size
        type: u4
      - id : unk1
        type : u4
      - id : unk2
        type : u4
      - id : list
        type: coordinate_pair
        repeat : expr
        repeat-expr : size  #  fread(list.get(0), 4*2, info.size, f);  // Read "size" times a "4*2" group

  coordinate_pair: # of which texture file?!? To Do
    seq:
      - id : s
        type : f4
      - id : t
        type : f4

  pfb_string:
    seq:
      - id: len
        type : u4
      - id : contents
        type: str
        size : len
        encoding : ASCII


# generic list:
# array of N elements, each on of size T

# Elements of list:

# vertex:
# 3 x float32

# length:
# 1 x uint32

# color:
# 4 x float32

# normal:
# 3 x float32

# texture coordinate:
# 2 x float32

# material:
#        uint32_t type;  // = 1 | 2
#        float    data2; // = 1 | 1
#        float    shininess; // 16 | 32
#        float    specular[3]; // diffuse ? (0.6 0.6 0.6)
#        float    diffuse[3]; // ? (0.8 0.8 0.8)
#        float    diffuse_bis[3]; // ? (0.72 0.72 0.72)
#        float    ambiant[3]; // uint/float ? (0 0 0) | 0 0 0
#        int32_t  data8[2]; // uint ? (3 4) | (3 1)
#        int32_t  data9;    // -1 | -1

# texture:
#        char *fileName;
#        int five_1_a[5];
#        int four_hexa_a[4];
#        int three_1_a[3];
#        int four_0_a[4];
#        int one_1_a;
#        float nine_values_a[9];
#        float nine_values_b[9];
#        int zero_minus_one_a[2];
#        int three_1_b[3];
#        int two_0_a[2];
#        int two_0_b[2];
#        int two_minus_one_a[2];
#        int five_minus_one_a[2];
#        int one_minus_one_a;
#        float zero_minus_one_b[2];
#        int one_zero_a;
#        int one_minus_one_b;
#        int one_zero_b;



# fread(destination, element size, number of elements, source file);

  materials: # Type 0
    seq:
    - id: num
      type : u4
    - id: size
      type: u4
    - id : body
      size : size * 4


  geostates: # Type 3
    seq:
    - id: num
      type : u4
    - id: size
      type: u4





  geosets:  # Type 10
    seq:
    - id: num
      type : u4
    - id: size
      type: u4

  nodes:  # Type 12
    seq:
    - id: num
      type : u4
    - id: size
      type: u4

  unknown:  # Type 2, 17, 18, 27
    seq:
    - id: num
      type : u4
    - id: size
      type: u4



