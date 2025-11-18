PFB (Performer Fast Binary) is very complicated. I did dozens of attempts at decoding it, but I can't still go futher pointcloud extraction.

In this folder tou find some experiments: none is fully working, most are partially working, all of them can be useful as a starting point to write yout own PFB parser, together with official documentation:

- https://techpubs.jurassic.nl/library/manuals/3000/007-3560-005/sgi_html/ch07.html
- https://techpubs.jurassic.nl/library/manuals/3000/007-3560-005/sgi_html/ch08.html
- https://techpubs.jurassic.nl/library/manuals/3000/007-3560-005/sgi_html/ch09.html

These AI-generated demo pages are probably full of useless garbage, but at least they can properly read the high level structure of a PFB file and display the pointcloud using Babylon.js ;  I prefer babylon to three.js because it can work totally offline, withoyt modules, import, node.js,...:

- [Mistral demo](https://jumpjack.github.io/VST-converter/PFB/experiments/mistral.html) ([source](https://github.com/jumpjack/VST-converter/blob/main/PFB/experiments/mistral.html))
- [Deep Seek demo](https://jumpjack.github.io/VST-converter/PFB/experiments/deepseek_html_20251118_0c9798.html) ([source](https://github.com/jumpjack/VST-converter/blob/main/PFB/experiments/deepseek_html_20251118_0c9798.html))
- [Mixed AI+humans demo](https://jumpjack.github.io/VST-converter/PFB/experiments/PFB-extractor-006.html) ([source](https://github.com/jumpjack/VST-converter/blob/main/PFB/experiments/PFB-extractor-006.html))
- 

The "secret" pf PFB format is probably in files [pfpfb.c](https://github.com/jumpjack/SGI-OpenGL-Performer/blob/21d11bd7a6b368ac162ce3f67dcf87755dde542e/usr/share/Performer/src/lib/libpfdb/libpfpfb/pfpfb.c) and [pfpfb.h](https://github.com/jumpjack/SGI-OpenGL-Performer/blob/21d11bd7a6b368ac162ce3f67dcf87755dde542e/usr/share/Performer/src/lib/libpfdb/libpfpfb/pfpfb.h) in folder [/usr/share/Performer/src/lib/libpfdb/libpfpfb/](https://github.com/jumpjack/SGI-OpenGL-Performer/tree/21d11bd7a6b368ac162ce3f67dcf87755dde542e/usr/share/Performer/src/lib/libpfdb/libpfpfb), because there are some useful top-level functions:
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
- The "standard list header writer": **pfb_write_slist_header**(); it always writes [listSize,0,-1] array for NASA files, because they do not contain animations.
- "**PFB_WRITE_SLIST**": macro which turnis into different function calls depending on list:  pfb_write_slist_header() followed by specific function;

Simplified writing sequence:

```
fwrite(llist, sizeof(int), size, glb->ofp);
fwrite(vlist, sizeof(pfVec3), size, glb->ofp);
fwrite(clist, sizeof(pfVec4), size, glb->ofp);
fwrite(nlist, sizeof(pfVec3), size, glb->ofp);
fwrite(tlist, sizeof(pfVec2), size, glb->ofp);
fwrite(ilist, sizeof(ushort), size, glb->ofp);

Then the complicated functions:

pfb_write_mtl() 
pfb_write_tex()
pfb_write_tenv()
pfb_write_gstate()
pfb_write_gset()
pfb_write_node()
```

For parsing the gset you must take into account the PFB file version, which apparently is always 26 for NASA files; thse are all t he known versions:

```
/*
 *  Historic versions at which specific features were added.
 */
#define PFBV_NODE_BSPHERE		5
#define PFBV_GSET_DO_DP			5
#define PFBV_LPSTATE_CALLIG		5
#define PFBV_CLIPTEXTURE		6
#define PFBV_GSET_BBOX_FLUX		8
#define PFBV_FLUX_SYNC_GROUP		10
#define PFBV_SWITCH_VAL_FLUX		11
#define PFBV_UFUNC			12
#define PFBV_UDATA_SLOT_FUNCS		16
#define PFBV_FLUX_SYNC_GROUP_NAMES	17
#define PFBV_ASD_SYNC_GROUP		17
#define PFBV_ASD_GSTATES		18
#define PFBV_MULTITEXTURE		19
#define PFBV_ANISOTROPY			20
#define PFBV_SHADER                     21
#define PFBV_ANISOTROPY_PFA		22
#define PFBV_IBR_TEXTURE		23
#define PFBV_VERSION2_6                 24 /* first needed for texCoords in
					      pfIBRnode */
#define PFBV_REMOVE_SHADER              25 
#define PFBV_SHADER_V2                  26 /* complete shader re-work */
#define PFBV_GEOARRAY                   27 /* GeoArray Type */
#define PFBV_SURFACES			28 /* parametric surface support */
#define PFBV_TEXTURE_COMPRESSION	29 /* added tokens for compressed 
					      external and internal texture 
					      formats */
#define PFBV_SHADER_OBJECTS             30 /* OpenGL shader_objects support */
#define PFBV_MAX_TEXTURES_8             31 /* bump up max textures to 8 */
#define PFBV_SURFACE_CLONING            32 /* fix cloning of pfParaSurfaces w/ topo info */
#define PFBV_GEOARRAY_STRIDE_SAVE       33

```

Simplified reading sequence of PFB file (no encryption, no user data, version = 26):

```
fread(buf, sizeof(int), 4, glb->ifp);  // (for header, 4 x int32)
while (pfb_fread(buf, sizeof(int), 3, glb->ifp) == 3) // 3 x int32 per list: type, number of elements, number of bytes
  list_type = buf[0];
  list_size = buf[1]; // number of elements
  if (list_type == L_NODE)
     pfb_read_node(i, glb);
  else
     pfb_read_func[list_type](glb);
}
```

Note: list length in bytes, stored in buf[2], is only used if list type is not recognized, to skip it.
