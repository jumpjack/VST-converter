PFB (Performer Fast Binary) is very complicated. I did dozens of attempts at decoding it, but I can't still go futher pointcloud extraction.

In this folder tou find some experiments: none is fully working, most are partially working, all of them can be useful as a starting point to write yout own PFB parser, together with official documentation:

- https://techpubs.jurassic.nl/library/manuals/3000/007-3560-005/sgi_html/ch07.html
- https://techpubs.jurassic.nl/library/manuals/3000/007-3560-005/sgi_html/ch08.html
- https://techpubs.jurassic.nl/library/manuals/3000/007-3560-005/sgi_html/ch09.html


The "secret" is probably in files [pfpfb.c](https://github.com/jumpjack/SGI-OpenGL-Performer/blob/21d11bd7a6b368ac162ce3f67dcf87755dde542e/usr/share/Performer/src/lib/libpfdb/libpfpfb/pfpfb.c) and [pfpfb.h](https://github.com/jumpjack/SGI-OpenGL-Performer/blob/21d11bd7a6b368ac162ce3f67dcf87755dde542e/usr/share/Performer/src/lib/libpfdb/libpfpfb/pfpfb.h) in folder [/usr/share/Performer/src/lib/libpfdb/libpfpfb/](https://github.com/jumpjack/SGI-OpenGL-Performer/tree/21d11bd7a6b368ac162ce3f67dcf87755dde542e/usr/share/Performer/src/lib/libpfdb/libpfpfb), because there are some useful top-level functions:
- How to store a PFB file: int **pfdStoreFile_pfb**(pfNode *root, const char *fileName)
   - Not to be confused with pfdStoreFile_pfa, for the ASCII version .PFA
   - Reveals the structure of a PFB file:
     -  Header (4 int32):
   	    - buf[0] = PFB_MAGIC_NUMBER;
   	    - buf[1] = PFB_VERSION_NUMBER;
   	    - buf[2] = 1;
   	    - buf[3] = sizeof(int) * 4;
     - Lists:
       - they can be in theory stored in any order, you identify them by first byte, which can be L_LLIST, L_VLIST,...);
       - there are 2 types of lists: "Standard", written by PFB_WRITE_SLIST, and others, written by PFB_WRITE_LIST;
       - apparently NASA files always contain only these lists:
       - PFB_WRITE_SLIST(L_LLIST, pfb_write_llist); (Lenghts list)
       - PFB_WRITE_SLIST(L_VLIST, pfb_write_vlist); (Vertex list: all you need to draw the full point cloud, without colors)
       - PFB_WRITE_SLIST(L_CLIST, pfb_write_clist); (Colors)
       - PFB_WRITE_SLIST(L_NLIST, pfb_write_nlist); (Normals)
       - PFB_WRITE_SLIST(L_TLIST, pfb_write_tlist); (Texture)
       - PFB_WRITE_SLIST(L_ILIST, pfb_write_ilist); (Indexes)
       - PFB_WRITE_LIST(L_MTL, pfb_write_mtl); (Material)
       - PFB_WRITE_LIST(L_TEX, pfb_write_tex); (Texture files)
       - PFB_WRITE_LIST(L_TENV, pfb_write_tenv); (?)
       - PFB_WRITE_LIST(L_GSTATE, pfb_write_gstate); (?)
       - PFB_WRITE_LIST(L_GSET, pfb_write_gset); (**The hardest part: the geoset, which describews how to use the lists to build the mesh**)
       - PFB_WRITE_SLIST(L_NODE, pfb_write_node); (?)       
- The "Performer version" of fread(): **pfb_fread**(void *ptr, size_t size, size_t nitems, FILE *stream)

"PFB_WRITE_SLIST" always call a header-writing function (pfb_write_slist_header()) followed by a specific function for each different type of list; apparently "pfb_write_slist_header()" always writes [size,0,-1] array for NASA files, because they do not contain animations.



The C struct representing a PFB file (but the file is not sequential, hence these objects will not appear always in this order in the file):

```
typedef struct {
    list_t *l_list[L_COUNT];
    list_t *l_list_end[L_COUNT];
    list_t **buckets[L_COUNT];
    int bucket_mask[L_COUNT];
    int l_num[L_COUNT];
    int add_comments;
    void *arena;
    FILE *ifp, *ofp;
    int version;
    int line_num;
    char *line_buf;
    int buf_size;
    int *buf;
    int read_error;
    void **rl_list[L_COUNT];
    int **children;
    int *hlight_gstates;
    morph_list_t *morph_head, *morph_tail;
    void **unknown;
    int unknown_size;
    int unknown_count;
    uint *crypt_key;
    pfdDecryptFuncType_pfb decrypt_func;
    pfdEncryptFuncType_pfb encrypt_func;
    udata_func_t *udfunc;
    int num_udata_slots;
    int max_udata_slot;
    int data_total;
    udata_info_t *udi;
    udata_fix_t *udf;
    int udi_size;
    custom_node_t *custom_nodes;
    int num_custom_nodes;
    int save_texture_image;
    int save_texture_path;
    int save_texture_pfi;
    int disable_rep_save;
    int subdivsurface_save_geosets;
    int dont_load_user_funcs;
    int share_gs_objects;
    pfdShare *share;
    int compile_gl;
    int surface_count;
    pfTessParaSurfaceAction *tessAction;
    pfList *topo_map, *solid_map;
    int maxTextures;
    pfList *boundaryList;
} pfa_global_t;

```
