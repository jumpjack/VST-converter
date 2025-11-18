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

