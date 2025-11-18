
size_t swapped_fread32(void *ptr, size_t size, size_t nitems, FILE *stream)
{
    unsigned char *p = ptr;
    int i, n;

    if ((size != 4) && (nitems > 1))
    	n = (size * nitems)/4;
    else if ((size != 4) && nitems == 1)
    	n = size/4;
    else
    	n = nitems;

    /* do 32bit swap */
    nitems = pfbFileReadFunction.fread(ptr, 4, n, stream);
    for(i=0; i<n; ++i)
    {
    	P_32_SWAP(p);
    	p += 4;
    }

    return nitems;
}


size_t swapped_fread16(void *ptr, size_t size, size_t nitems, FILE *stream)
{
        unsigned char *p = ptr;
        int i;

        /* do 16bit swap */
        nitems = pfbFileReadFunction.fread(ptr, 2, nitems, stream);
        for(i=0; i<nitems; ++i)
        {
            P_16_SWAP(p);
            p += 2;
        }
        return nitems;
}

size_t pfb_fread(void *ptr, size_t size, size_t nitems, FILE *stream)
{
    if (r_swap)
    {
	if(size == 1)
	{
	    /* normal fread */
	    nitems = pfbFileReadFunction.fread(ptr, size, nitems, stream);
	    return nitems;
	}
	else if(size == 2)
	{
	    /* swapped_fread16 */
	    nitems = swapped_fread16(ptr, size, nitems, stream);
	    return nitems;
	}
	else if((size == 4) || (size%4 == 0))
	{
	    /* swapped_fread32 */
	    nitems = swapped_fread32(ptr, size, nitems, stream);
	    return nitems;
	}
    }
    else
    {
	/* normal fread */
	nitems = pfbFileReadFunction.fread(ptr, size, nitems, stream);
	return nitems;
    }
    return 0; /* make compiler happy -- should never get here */
}

static int getNumGSetVertices(pfGeoSet *gset)
{
    pfVec3 *attrib;
    ushort *indexPtr;
    int *lengths;
    int j, type, nprims, vertcount;

    pfGetGSetAttrLists(gset, PFGS_COORD3, (void **)&attrib, &indexPtr);

    if(indexPtr)  /* don't bother to handle indexed data */
	return 0;

    /* get number of vertices */
    type = pfGetGSetPrimType(gset);
    nprims = pfGetGSetNumPrims(gset);

    switch(type)
    {
    case PFGS_TRIS:
	vertcount = 3 * nprims;
	break;

    case PFGS_QUADS:
	vertcount = 4 * nprims;
	break;

    case PFGS_TRISTRIPS:
    case PFGS_FLAT_TRISTRIPS:
    case PFGS_TRIFANS:
    case PFGS_FLAT_TRIFANS:
    case PFGS_POLYS:

	lengths = pfGetGSetPrimLengths(gset);

	vertcount = 0;
	for(j = 0; j<nprims; j++)
	    vertcount += lengths[j];
	break;

    case PFGS_POINTS:
    case PFGS_LINES:
    case PFGS_LINESTRIPS:
    case PFGS_FLAT_LINESTRIPS:
    default:
	vertcount = 0;
	break;
    }

    return vertcount;
}

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

/* if you add any types here be sure to modify PFB_VERSION_NUMBER */

/*
 *	This hold the value of PF_MAX_TEXTURES as of pfb version 19.
 *	If PF_MAX_TEXTURES changes, we can maintain binary compatibility
 *	by extending structures by (PF_MAX_TEXTURES - PF_MAX_TEXTURES_19).
 *
 *	The value of PF_MAX_TEXTURES differs between the Linux and IRIX
 *	versions of libpf. In the pfb format, we always have PF_MAX_TEXTURES_19
 *	elements for texture related objects.
 *      But, as of pf 3.2 PF_MAX_TEXTURES is the same on all platforms (8).
 *
 */
#define PF_MAX_TEXTURES_19	4
#define PF_MAX_TEXTURES_31      8

/*
#if !((PF_MAJOR_VERSION == 2) && (PF_MINOR_VERSION == 0))
#endif
*/

typedef struct list_s {
    void *data;
    int id;
    int size;
    struct list_s *next;
    struct list_s *bnext;
} list_t;



typedef struct node_trav_s {
    pfNodeTravFuncType app_pre, app_post;
    void *app_data;
    pfNodeTravFuncType cull_pre, cull_post;
    void *cull_data;
    pfNodeTravFuncType draw_pre, draw_post;
    void *draw_data;
    pfNodeTravFuncType isect_pre, isect_post;
    void *isect_data;
} node_trav_t;


/*
 *  Object types
 */
typedef struct {
    int side;
    float alpha;
    float shininess;
    pfVec3 ambient;
    pfVec3 diffuse;
    pfVec3 specular;
    pfVec3 emission;
    int cmode[2];
    int udata;
} mtl_t;

#define TEX_0_DATA	\
    int format[5];	\
    uint filter[4];	\
    int wrap[3];	\
    pfVec4 bcolor;	\
    int btype;		\
    pfVec2 ssp[4];	\
    float ssc;		\
    pfVec2 dsp[4];	\
    float dsc;		\
    int tdetail[2];	\
    int lmode[3];	\
    int losource[2];	\
    int lodest[2];	\
    int lsize[2];	\
    int image;		\
    int comp;		\
    int xsize;		\
    int ysize;		\
    int zsize;		\
    int load_image;	\
    int list_size;	\
    float frame;	\
    int num_levels;	\
    int udata;

#define TEX_1_DATA	\
    TEX_0_DATA		\
    int type;

#define TEX_DATA	\
    TEX_1_DATA		\
    int aniso_degree;

typedef struct {
    TEX_0_DATA
} tex_0_t;

typedef struct {
    TEX_1_DATA
} tex_1_t;

typedef struct {
    TEX_DATA
} tex_t;

typedef struct {
    float center[3];
    int clip_size;
    int virtual_size[3];
    int invalid_border;
    int virtual_LOD_offset;
    int effective_levels;
    int master;
    uint DTR_mode;
    float DTR_max_i_border;
    float LOD_range[2];
} cliptex_t;

typedef struct {
    int level;
    int obj;
    int type;
    int phase_margin;
    int phase_shift[3];
} cliplevel_t;

typedef struct {
    int level;
    int obj;
} level_t;


typedef struct tex_list_s {
    char *name;
    char *names[TEX_MAX_IMAGES];
    tex_t *t;
    cliptex_t *ct;
    pfTexture *tex;
    pfTexture *dtex;
    pfClipTexture *master;
    int *itlist;
    pfTexture **ptlist;
    pfObject **level_objs;
    level_t *levels;
    cliplevel_t *cliplevels;
    uint *image;
    uint *images[TEX_MAX_IMAGES];
    int  iimages[TEX_MAX_IMAGES];
    int  num_images;
    uint *load_image;
    struct tex_list_s *next;
} tex_list_t;

typedef struct {
    int mode;
    int component;
    float color[4];
    int udata;
} tenv_t;


typedef struct {
    float range[2];
    float bias[3];
    int udata;
} tlod_t;



#define GSET_0_DATA		\
    int ptype;			\
    int pcount;			\
    int llist;			\
    int vlist[3];		\
    int clist[3];		\
    int nlist[3];		\
    int tlist[3];		\
    int draw_mode[3];		\
    int gstate[2];		\
    float line_width;		\
    float point_size;		\
    int draw_bin;		\
    uint isect_mask;		\
    int hlight;			\
    int bbox_mode;		\
    pfBox bbox;			\
    int udata;

#define GSET_1_DATA		\
    GSET_0_DATA			\
    uint draw_order;		\
    int decal_plane;		\
    float dplane_normal[3];	\
    float dplane_offset;

#define GSET_2_DATA		\
    GSET_1_DATA			\
    int bbox_flux;

#define GSET_3_DATA             \
    GSET_2_DATA                 \
    int multi_tlist[3 * (PF_MAX_TEXTURES_19 - 1)];

#define GSET_4_DATA             \
    GSET_3_DATA                 \
    int appearance;



/*
 *	Allocate 7 slots for each texture unit. Ignore texture unit # 0
 *	because it is taken care of by the tlist variable above.
 */
#define GSET_DATA		\
    GSET_4_DATA			\
    int multi_tlist2[3 * (PF_MAX_TEXTURES_31 - PF_MAX_TEXTURES_19)];

typedef struct {
    GSET_DATA
} gset_t;

typedef struct {
    GSET_0_DATA
} gset_0_t;

typedef struct {
    GSET_1_DATA
} gset_1_t;

typedef struct {
    GSET_2_DATA
} gset_2_t;

typedef struct {
    GSET_3_DATA
} gset_3_t;

typedef struct {
    GSET_4_DATA
} gset_4_t;

typedef struct {
    pfMatrix mat;
    int justify;
    int char_size;
    int font;
    float spacing_scale[3];
    pfVec4 color;
    int gstate[2];
    uint isect_mask;
    pfBox bbox;
} string_t;

/*
 *  lists
 */
#define L_MTL		 0
#define L_TEX		 1
#define L_TENV		 2
#define L_GSTATE	 3
#define L_LLIST		 4
#define L_VLIST		 5
#define L_CLIST		 6
#define L_NLIST		 7
#define L_TLIST		 8
#define L_ILIST		 9
#define L_GSET		10
#define L_UDATA		11
#define L_NODE		12
#define L_FLIST		13
#define L_MORPH		14
#define L_LODSTATE	15
#define L_FOG		16
#define L_TGEN		17
#define L_LMODEL	18
#define L_LIGHT		19
#define L_CTAB		20
#define L_LPSTATE	21
#define L_HLIGHT	22
#define L_LSOURCE	23
#define L_FRUST		24
#define L_FONT		25
#define L_STRING	26
#define L_IMAGE		27
#define L_CUSTOM	28
#define L_TLOD		29
#define L_ASDDATA	30
#define L_QUEUE		31
#define L_ITILE		32
#define L_ICACHE	33
#define L_FLUX		34
#define L_ENGINE	35
#define L_UFUNC		36
#define L_UDATA_NAME	37
#define L_UDATA_LIST	38
#define L_SG_NAME	39
#define L_SHADER        40
#define L_IBR_TEX       41
#define L_APPEARANCE    42
#define L_MESH          43
#define L_GARRAY	44
#define L_VARRAY_1	45
#define L_VARRAY_2	46
#define L_VARRAY_4	47
#define L_EDGE		48
#define L_TOPO 		49
#define L_CURVE2D	50
#define L_DISCURVE2D    51
#define L_BOUNDARY      52
#define L_SOLID         53
#define L_GPROG		54
#define L_GPROGPARM	55
#define L_SCALAR        56
#define L_SHADOBJ       57
#define L_SHADPROG      58
#define L_COUNT		59

static const int list_conv[L_COUNT] =
{
    L_MTL,
    L_TEX,
    L_TENV,
    L_GSTATE,
    L_LLIST,
    L_VLIST,
    L_CLIST,
    L_NLIST,
    L_TLIST,
    L_ILIST,
    L_GSET,
    L_UDATA,
    L_NODE,
    L_FLIST,
    L_MORPH,
    L_LODSTATE,
    L_FOG,
    L_TGEN,
    L_LMODEL,
    L_LIGHT,
    L_CTAB,
    L_LPSTATE,
    L_HLIGHT,
    L_LSOURCE,
    L_FRUST,
    L_FONT,
    L_STRING,
    L_IMAGE,
    L_CUSTOM,
    L_TLOD,
    L_ASDDATA,
    L_QUEUE,
    L_ITILE,
    L_ICACHE,
    L_FLUX,
    L_ENGINE,
    L_UFUNC,
    L_UDATA_NAME,
    L_UDATA_LIST,
    L_SG_NAME,
    L_SHADER,
    L_IBR_TEX,
    L_APPEARANCE,
    L_MESH,
    L_GARRAY,
    L_VARRAY_1,
    L_VARRAY_2,
    L_VARRAY_4,
    L_EDGE,
    L_TOPO,
    L_CURVE2D,
    L_DISCURVE2D,
    L_BOUNDARY,
    L_SOLID,
    L_GPROG,
    L_GPROGPARM,
    L_SCALAR,
    L_SHADOBJ,
    L_SHADPROG,
};

static const char *l_name[L_COUNT] =
{
    "Material",
    "Texture",
    "TexEnv",
    "GeoState",
    "Length List",
    "Vertex List",
    "Color List",
    "Normal List",
    "TexCoord List",
    "Index List",
    "GeoSet",
    "User Data",
    "Node",
    "Other List",
    "Morph",
    "LOD State",
    "Fog",
    "Tex Gen",
    "Light Model",
    "Light",
    "Color Table",
    "Light Point State",
    "Highlight",
    "Light Source",
    "Frustum",
    "Font",
    "String",
    "Image",
    "Custom",
    "TexLOD",
    "ASD Data",
    "Queue",
    "ImageTile",
    "ImageCache",
    "Flux",
    "Engine",
    "User Func",
    "User Data Slot Name",
    "User Data List",
    "Flux Sync Group Name",
    "Shader",
    "IBR texture",
    "islAppearance",
    "Mesh",
    "GeoArray",
    "Vertex Array Data (bytes)",
    "Vertex Array Data (short)",
    "Vertex Array Data",
    "Edge",
    "Topo",
    "Curve2d",
    "DisCurve2d",
    "Boundary",
    "Solid",
    "GProgram",
    "GProgram parameters",
    "Scalar",
    "Shader Object",
    "Shader Program"
};


#define PFB_WRITE_LIST(id, func);					\
    if (glb->l_num[id])							\
    {									\
	list_t *lp;							\
	int buf[2];							\
	int start, end;							\
									\
	buf[0] = id;							\
	buf[1] = glb->l_num[id];					\
	fwrite(buf, sizeof(int), 2, glb->ofp);				\
	fseek(glb->ofp, sizeof(int), SEEK_CUR);				\
	start = (int)ftell(glb->ofp);					\
	lp = glb->l_list[id];						\
	while (lp)							\
	{								\
	    func(lp->data, glb);					\
	    lp = lp->next;						\
	}								\
	end = (int)ftell(glb->ofp);					\
	fseek(glb->ofp, start - (int)sizeof(int), SEEK_SET);		\
	buf[0] = end - start;						\
	fwrite(buf, sizeof(int), 1, glb->ofp);				\
	fseek(glb->ofp, end, SEEK_SET);					\
    }

#define PFB_WRITE_SLIST(id, func);					\
    if (glb->l_num[id])							\
    {									\
	list_t *lp;							\
	int buf[2];							\
	int start, end;							\
									\
	buf[0] = id;							\
	buf[1] = glb->l_num[id];					\
	fwrite(buf, sizeof(int), 2, glb->ofp);				\
	fseek(glb->ofp, sizeof(int), SEEK_CUR);				\
	start = (int)ftell(glb->ofp);					\
	lp = glb->l_list[id];						\
	while (lp)							\
	{								\
	    func(lp->data, lp->size, glb);				\
	    lp = lp->next;						\
	}								\
	end = (int)ftell(glb->ofp);					\
	fseek(glb->ofp, start - (int)sizeof(int), SEEK_SET);		\
	buf[0] = end - start;						\
	fwrite(buf, sizeof(int), 1, glb->ofp);				\
	fseek(glb->ofp, end, SEEK_SET);					\
    }



/*
 *  memory types
 */
#define MEM_ARENA	0
#define MEM_CBUF	1
#define MEM_FLUX	2



#define STATE_TRANSPARENCY	 1
#define STATE_ANTIALIAS		 2
#define STATE_DECAL		 3
#define STATE_ALPHAFUNC		 4
#define STATE_ENLIGHTING	 5
#define STATE_ENTEXTURE		 6
#define STATE_ENFOG		 7
#define STATE_CULLFACE		 8
#define STATE_ENWIREFRAME	 9
#define STATE_ENCOLORTABLE	10
#define STATE_ENHIGHLIGHTING	11
#define STATE_ENLPOINTSTATE	12
#define STATE_ENTEXGEN		13
#define STATE_ALPHAREF		14
#define STATE_FRONTMTL		15
#define STATE_BACKMTL		16
#define STATE_TEXTURE		17
#define STATE_TEXENV		18
#define STATE_FOG		19
#define STATE_LIGHTMODEL	20
#define STATE_LIGHTS		21
#define STATE_COLORTABLE	22
#define STATE_HIGHLIGHT		23
#define STATE_LPOINTSTATE	24
#define STATE_TEXGEN		25
#define STATE_ENTEXMAT		26
#define STATE_TEXMAT		27
#define STATE_ENTEXLOD		28
#define STATE_TEXLOD		29
#define STATE_VERTEX_PROGRAM	30
#define STATE_FRAGMENT_PROGRAM	31
#define STATE_ENVTXPROG		32
#define STATE_ENFRAGPROG	33
#define STATE_GPROGPARMS        34
#define STATE_SHADPROG          35
#define STATE_ENSHADPROG        36
#define STATE_END		-1


/*
 *  tables for materials
 */
static const int mtls_table[] = {3,
				 PFMTL_FRONT,
				 PFMTL_BACK,
				 PFMTL_BOTH};

static const int cmode_table[] = {7,
				  PFMTL_CMODE_OFF,
				  PFMTL_CMODE_AMBIENT_AND_DIFFUSE,
				  PFMTL_CMODE_AMBIENT,
				  PFMTL_CMODE_DIFFUSE,
				  PFMTL_CMODE_SPECULAR,
				  PFMTL_CMODE_EMISSION,
				  PFMTL_CMODE_COLOR};


/*
 *  tables for textures
 */
static const int txr_table[] = {3,
				PFTEX_REPEAT,
				PFTEX_CLAMP,
				PFTEX_SELECT};

static const int txef_table[] = {14,
				 PFTEX_PACK_8,
				 PFTEX_PACK_16,
				 PFTEX_BYTE,
				 PFTEX_UNSIGNED_BYTE,
				 PFTEX_SHORT,
				 PFTEX_UNSIGNED_SHORT,
				 PFTEX_INT,
				 PFTEX_UNSIGNED_INT,
				 PFTEX_FLOAT,
				 PFTEX_UNSIGNED_SHORT_5_5_5_1,
				 PFTEX_COMPRESSED_RGB_S3TC_DXT1,
				 PFTEX_COMPRESSED_RGBA_S3TC_DXT1,
				 PFTEX_COMPRESSED_RGBA_S3TC_DXT3,
				 PFTEX_COMPRESSED_RGBA_S3TC_DXT5
};

static const int txif_table[] = {29,
				 PFTEX_RGB_5,
				 PFTEX_RGB_4,
				 PFTEX_RGBA_4,
				 PFTEX_I_8,
				 PFTEX_IA_12,
				 PFTEX_I_12A_4,
				 PFTEX_RGBA_8,
				 PFTEX_RGB_12,
				 PFTEX_RGBA_12,
				 PFTEX_I_16,
				 PFTEX_IA_8,
				 PFTEX_RGB5_A1,

				 PFTEX_RGBA_32,
				 PFTEX_RGB_32,
				 PFTEX_A_32,
				 PFTEX_I_32,
				 PFTEX_L_32,
				 PFTEX_IA_32,
				 PFTEX_RGBA_F16,
				 PFTEX_RGB_F16,
				 PFTEX_A_F16,
				 PFTEX_I_F16,
				 PFTEX_L_F16,
				 PFTEX_IA_F16,

				 PFTEX_COMPRESSED_RGB_S3TC_DXT1,
				 PFTEX_COMPRESSED_RGBA_S3TC_DXT1,
				 PFTEX_COMPRESSED_RGBA_S3TC_DXT3,
				 PFTEX_COMPRESSED_RGBA_S3TC_DXT5,

				 PFTEX_RGB_8    /* SCR 917917 */
};


/*
 *  texture types
 */
#define TEXTYPE_TEXTURE		0
#define TEXTYPE_CLIPTEXTURE	1

#define BROKEN_SPLINE 500000.0f

static const int txll_table[] = {3,
				 PFTEX_LIST_APPLY,
				 PFTEX_LIST_AUTO_IDLE,
				 PFTEX_LIST_AUTO_SUBLOAD};

static const int txlb_table[] = {2,
				 PFTEX_BASE_APPLY,
				 PFTEX_BASE_AUTO_SUBLOAD};

static const int txls_table[] = {3,
				 PFTEX_SOURCE_IMAGE,
				 PFTEX_SOURCE_FRAMEBUFFER,
				 PFTEX_SOURCE_VIDEO};

#define COMPONMENT_MASK		0x00000f
#define TWO_BYTE_COMPONENTS	0x000010
#define FOUR_BYTE_COMPONENTS	0x000020
#define ROW_SIZE_MASK		0xffff00
#define ROW_SIZE_SHIFT		8
#define COMPONENT_ORDER_IGL	1
#define COMPONENT_ORDER_OGL	2
#define COMPONENT_ORDER		COMPONENT_ORDER_OGL

#define IS_PFI		0x00000001
#define IS_PFI_MULTI	0x00000002


/*
 *  tables for TexEnvs
 */
static const int tem_table[] = {6,
				PFTE_MODULATE,
				PFTE_BLEND,
				PFTE_DECAL,
				PFTE_ALPHA,
				PFTE_REPLACE,
				PFTE_ADD};

static const int tec_table[] = {8,
				PFTE_COMP_OFF,
				PFTE_COMP_I_GETS_R,
				PFTE_COMP_I_GETS_G,
				PFTE_COMP_I_GETS_B,
				PFTE_COMP_I_GETS_A,
				PFTE_COMP_IA_GETS_RG,
				PFTE_COMP_IA_GETS_BA,
				PFTE_COMP_I_GETS_I};

/*
 *  tables for TexGen
 */
static const int tgen_table[] = {7,
				 PFTG_OFF,
				 PFTG_OBJECT_LINEAR,
				 PFTG_EYE_LINEAR,
				 PFTG_EYE_LINEAR_IDENT,
				 PFTG_SPHERE_MAP,
				 PFTG_REFLECTION_MAP,
				 PFTG_NORMAL_MAP};


/*
 *  tables for GeoSets
 */
static const int gsb_table[] = {4,
				PFGS_OFF,
				PFGS_PER_VERTEX,
				PFGS_PER_PRIM,
				PFGS_OVERALL};

static const int gspt_table[] = {11,
				 PFGS_TRISTRIPS,
				 PFGS_TRIS,
				 PFGS_POINTS,
				 PFGS_LINES,
				 PFGS_LINESTRIPS,
				 PFGS_FLAT_LINESTRIPS,
				 PFGS_QUADS,
				 PFGS_FLAT_TRISTRIPS,
				 PFGS_POLYS,
				 PFGS_TRIFANS,
				 PFGS_FLAT_TRIFANS};


/*
 *  tables for User Data
 */
static const char hex_char[16] = {'0', '1', '2', '3', '4', '5', '6', '7',
				  '8', '9', 'a', 'b', 'c', 'd', 'e', 'f'};

/*
 *  tables for String
 */
static const int strj_table[] = {3,
				 PFSTR_LEFT,
				 PFSTR_CENTER,
				 PFSTR_RIGHT};

static const int strcs_table[] = {3,
				  PFSTR_CHAR,
				  PFSTR_SHORT,
				  PFSTR_INT};



/*
 *  tables for Nodes
 */
#define N_LIGHTPOINT	 0
#define N_TEXT		 1
#define N_GEODE		 2
#define N_BILLBOARD	 3
#define N_LIGHTSOURCE	 4
#define N_GROUP		 5
#define N_SCS		 6
#define N_DCS		 7
#define N_PARTITION	 8
#define N_SCENE		 9
#define N_SWITCH	10
#define N_LOD		11
#define N_SEQUENCE	12
#define N_LAYER		13
#define N_MORPH		14
#define N_ASD		15
#define N_FCS		16
#define N_DOUBLE_DCS	17
#define N_DOUBLE_FCS	18
#define N_DOUBLE_SCS	19
#define N_IBR_NODE	20
#define N_SUBDIV_SURFACE 21
#define N_TORUS	        22
#define N_NURB_SURFACE  23
#define N_NURB_CURVE2D  24
#define N_LINE2D	25
#define N_PIECEWISEPOLYCURVE2D 26
#define N_PIECEWISEPOLYSURFACE 27
#define N_PLANE_SURF	28
#define N_SPHERE_SURF   29
#define N_CONE          30
#define N_CYLINDER      31
#define N_LINE3D	32
#define N_NURB_CURVE3D  33
#define N_PIECEWISEPOLYCURVE3D 34
#define N_HSPLINE_SURFACE 35
#define N_SWEPT_SURFACE 36
#define N_FRENET_SWEPT_SURFACE 37
#define N_COONS         38
#define N_COMPOSITE_CURVE3D 39
#define N_CIRCLE2D	40
#define N_SUPERQUADCURVE2D 41
#define N_RULED         42
#define N_CIRCLE3D      43
#define N_SUPERQUADCURVE3D 44
#define N_ORIENTEDLINE3D 45
/* if you add anything here be sure to update the node_names array below */

#define N_CUSTOM		0x10000000
#define N_CUSTOM_MASK		0x0fff0000
#define N_NOT_CUSTOM_MASK	0x0000ffff
#define N_CUSTOM_SHIFT		16
#define N_CUSTOM_MAX		0x1000

static const char *node_names[] = {"LightPoint",
				   "Text",
				   "Geode",
				   "Billboard",
				   "LightSource",
				   "Group",
				   "SCS",
				   "DCS",
				   "Partition",
				   "Scene",
				   "Switch",
				   "LOD",
				   "Sequence",
				   "Layer",
				   "Morph",
				   "ASD",
				   "FCS",
				   "DoubleDCS",
				   "DoubleFCS",
				   "DoubleSCS",
				   "IBRnode",
				   "SubdivSurface",
				   "TorusSurface",
				   "NurbsSurface",
				   "NurbCurve2d",
				   "Line2d",
				   "PieceWisePolyCurve2d",
				   "PieceWisePolySurface",
				   "PlaneSurface",
				   "SphereSurface",
				   "ConeSurface",
				   "CylinderSurface",
				   "Line3d",
				   "NurbCurve3d",
				   "PieceWisePolyCurve3d",
				   "HsplineSurface",
				   "SweptSurface",
				   "FrenetSweptSurface",
				   "CoonsSurface",
				   "CompositeCurve3d",
				   "Circle2d",
				   "SuperQuadCurve2d",
				   "RuledSurface",
				   "Circle3d",
				   "SuperQuadCurve3d",
				   "OrientedLine3d",
};


#define GET_BUF(s) (((s) <= glb->buf_size)? glb->buf : set_buf_size((s), glb))

/*
 *  To be MP safe when globals are shared the pfb/pfa file format uses few
 *  non-constant globals.  Those that are used are truely global such as
 *  lists of shared state.  Transient globals that are used in loading or
 *  storing a single file are all stored in the following type of structure.
 *  This structure is malloced with each load or store and passed to all
 *  functions that need it.
 */
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



static void *(*pfb_read_func[L_COUNT])(pfa_global_t *glb) =
{
    pfb_read_mtl,
    pfb_read_tex,
    pfb_read_tenv,
    pfb_read_gstate,
    pfb_read_llist,
    pfb_read_vlist,
    pfb_read_clist,
    pfb_read_nlist,
    pfb_read_tlist,
    pfb_read_ilist,
    pfb_read_gset,
    PFA_DUMMY_READ,
    PFB_DUMMY_READ,
    pfb_read_flist,
    pfb_read_morph,
    pfb_read_lodstate,
    pfb_read_fog,
    pfb_read_tgen,
    pfb_read_lmodel,
    pfb_read_light,
    pfb_read_ctab,
    pfb_read_lpstate,
    PFB_DUMMY_READ,
    pfb_read_lsource,
    pfb_read_frust,
    pfb_read_font,
    pfb_read_string,
    pfb_read_image,
    pfb_read_custom,
    pfb_read_tlod,
    pfb_read_asddata,
    pfb_read_queue,
    pfb_read_itile,
    pfb_read_icache,
    pfb_read_flux,
    pfb_read_engine,
    pfb_read_ufunc,
    pfb_read_udata_name,
    pfb_read_udata_list,
    pfb_read_sg_name,
    pfb_read_shader,
    pfb_read_ibr_tex,
    pfb_read_appearance,
    pfb_read_mesh,
    pfb_read_geoArray,
    pfb_read_varray_1,
    pfb_read_varray_2,
    pfb_read_varray_4,
    PFB_DUMMY_READ, /* XXX Alex  was for edge */
    pfb_read_topo,
    pfb_read_curve2d_general,
    pfb_read_discurve2d,
    PFB_DUMMY_READ, /* XXX Alex was for boundary */
    PFB_DUMMY_READ, /* XXX Alex was for solid */
    pfb_read_gprogram,
    pfb_read_gprogramparms,
    pfb_read_scalar,
    pfb_read_shader_object,
    pfb_read_shader_program,
};


PFPFB_DLLEXPORT pfNode* pfdLoadFile_pfb(const char *fileName)
{
    pfNode *root;
    int i;
    char path[PF_MAXSTRING];
    int list_type, real_list_type, list_size;
    int buf[4];
    pfa_global_t *glb;
    int whichEndian = 1;

    glb = (pfa_global_t *)malloc(sizeof(pfa_global_t));
    bzero(glb, sizeof(pfa_global_t));

    glb->tessAction = tessAction;
    glb->compile_gl = compile_gl;
    glb->udfunc = copy_udfunc(udfunc_pfb);
    glb->dont_load_user_funcs = dont_load_user_funcs;
    if ((glb->share_gs_objects = share_gs_objects) == PF_ON)
	glb->share = pfdGetGlobalShare();

    pfbFileReadFunction.fread = fread;
    pfbFileReadFunction.fseek = fseek;
    pfbFileReadFunction.ftell = ftell;

    /*
     *  find the input file
     */
    if (!pfFindFile(fileName, path, R_OK))
    {
	pfNotify(PFNFY_WARN, PFNFY_RESOURCE,
		 "pfdLoadFile_pfb:  Could not find readable \"%s\".\n",
		 fileName);
	free(glb);
	return(FALSE);
    }

    /*
     *  open the input file for reading
     */
    if ((glb->ifp = fopen(path, "rb")) == NULL) {
	pfNotify(PFNFY_WARN, PFNFY_RESOURCE,
		 "pfdLoadFile_pfb:  Could not open \"%s\" for reading.\n",
		 path);
	free(glb);
	return(FALSE);
    }

    /*
     *  read the file
     */
    glb->arena = pfGetSharedArena();
    glb->read_error = 0;
    if (glb->num_custom_nodes = num_custom_nodes_pfb)
    {
	glb->custom_nodes = (custom_node_t *)malloc(num_custom_nodes_pfb *
						    sizeof(custom_node_t));
	bcopy(custom_nodes_pfb, glb->custom_nodes,
	      num_custom_nodes_pfb * sizeof(custom_node_t));
	for (i = 0; i < num_custom_nodes_pfb; i++)
	    glb->custom_nodes[i].name = strdup(custom_nodes_pfb[i].name);
    }
	set_buf_size(512, glb);

	/* determine machine's endianness */
	if(*(char *)&whichEndian == 1)
	{
	    pfNotify(PFNFY_DEBUG, PFNFY_PRINT, "machine is little-endian\n");
	}
	else
	{
	    pfNotify(PFNFY_DEBUG, PFNFY_PRINT, "machine is big-endian\n");
	}

    /*
     *  read header
     */
    fread(buf, sizeof(int), 4, glb->ifp);



	/* determine file's endianness */
	if(buf[0] == PFB_MAGIC_NUMBER)
	{
		/* use normal fread() */
		r_swap = False;
	}
	else if(buf[0] == PFB_MAGIC_NUMBER_LE)
	{
		/* use swapped fread() */
		pfNotify(PFNFY_DEBUG, PFNFY_PRINT, "file is opposite endian, swapping bytes\n");
		r_swap = True;
		P_32_SWAP(&buf[0]);
		P_32_SWAP(&buf[1]);
		P_32_SWAP(&buf[2]);
		P_32_SWAP(&buf[3]);
	}
	else if(buf[0] == PFB_MAGIC_ENCODED)
	{
		r_swap = False;
		if (crypt_key_pfb == NULL)
		{
	    pfNotify(PFNFY_WARN, PFNFY_PRINT,
		     "%s: Can't read \"%s\" because PFPFB_CRYPT_KEY is not set",
		     "pfdLoadFile_pfb", path);
	    free(glb);
	    return(FALSE);
		}
		i = (int)(crypt_key_pfb[0] * sizeof(uint) + sizeof(uint));
		glb->crypt_key = (uint *)malloc(i);
		bcopy(crypt_key_pfb, glb->crypt_key, i);
		glb->decrypt_func = decrypt_func_pfb;
    }
	else if(buf[0] == PFB_MAGIC_ENCODED_LE)
	{
		r_swap = True;
		P_32_SWAP(&buf[0]);
		P_32_SWAP(&buf[1]);
		P_32_SWAP(&buf[2]);
		P_32_SWAP(&buf[3]);

		if (crypt_key_pfb == NULL)
		{
	    pfNotify(PFNFY_WARN, PFNFY_PRINT,
		     "%s: Can't read \"%s\" because PFPFB_CRYPT_KEY is not set",
		     "pfdLoadFile_pfb", path);
	    free(glb);
	    return(FALSE);
		}
		i = (int)(crypt_key_pfb[0] * sizeof(uint) + sizeof(uint));
		glb->crypt_key = (uint *)malloc(i);
		bcopy(crypt_key_pfb, glb->crypt_key, i);
		glb->decrypt_func = decrypt_func_pfb;
	}
    else
    {
		pfNotify(PFNFY_WARN, PFNFY_PRINT,
			 "pfdLoadFile_pfb:  \"%s\" Is not a .pfb file.\n",
			 path);
		free(glb);
		return(FALSE);
    }

    if (glb->crypt_key)
	pfNotify(PFNFY_NOTICE, PFNFY_PRINT,
		 "pfdLoadFile_pfb: Loading ENCRYPTED \"%s\"", path);
    else
	pfNotify(PFNFY_NOTICE, PFNFY_PRINT,
		 "pfdLoadFile_pfb: Loading \"%s\"", path);

    if ((glb->version = buf[1]) > PFB_VERSION_NUMBER)
    {
	pfNotify(PFNFY_WARN, PFNFY_PRINT,
		 "pfdLoadFile_pfb:  \"%s\" has a newer pfb version number [%d].\n",
		 path, buf[1]);
	pfNotify(PFNFY_WARN, PFNFY_PRINT, "It may not load correctly.\n");
    }

    if(glb->version >= PFBV_MAX_TEXTURES_8)
      glb->maxTextures = PF_MAX_TEXTURES_31; /* which is == 8 */
    else if(glb->version >= PFBV_MULTITEXTURE)
      glb->maxTextures = PF_MAX_TEXTURES_19; /* which is == 4 */
    else
      glb->maxTextures = 1; /* not really used but god to set just in case */

    pfNotify(PFNFY_DEBUG, PFNFY_INTERNAL,
        "pfdLoadFile_pfb: .pfb File Version is %d\n", glb->version);
    fseek(glb->ifp, buf[3], SEEK_SET);
    /*
     *  read lists
     */
    while (!glb->read_error && pfb_fread(buf, sizeof(int), 3, glb->ifp) == 3)
    {
	list_type = buf[0];
	list_size = buf[1];

	if (list_type < 0 || list_type >= L_COUNT)
	{
	    pfNotify(PFNFY_WARN, PFNFY_PRINT,
		     "%s:  Encountered an unknown list type \"%d\".\n",
		     "pfdLoadFile_pfb",  list_type);
	    pfNotify(PFNFY_WARN, PFNFY_MORE, "This list will be skipped.\n");
	    pfNotify(PFNFY_WARN, PFNFY_MORE,
		     "This file will probably not display properly.\n");
	    fseek(glb->ifp, buf[2], SEEK_CUR);
	    break;
	}

	real_list_type = list_conv[list_type];

	glb->rl_list[real_list_type] = (void *)malloc(list_size *
						      sizeof(void *));
	glb->l_num[real_list_type] = list_size;

	if (list_type == L_NODE)
	{
	    glb->children = (int **)malloc(list_size * sizeof(int *));
	    for (i = 0; i < list_size && !glb->read_error; i++) {
	        PFASSERTDEBUG(list_type < (sizeof(pfa_read_func) / sizeof(pfa_read_func[0])));
		glb->rl_list[list_type][i] = pfb_read_node(i, glb);
	    }

	    /* If the first incarnation of shaders is not supported, then
	       L_NODE is the last possible list. If you add another list to
	       the end, break out of the while loop elsewhere */
	    if((glb->version < PFBV_SHADER) || (glb->version >= PFBV_REMOVE_SHADER) && (glb->version < PFBV_SURFACES))
	      break;

	}
	else if (list_type == L_HLIGHT)
	{
	    glb->hlight_gstates = (int *)malloc(list_size * sizeof(int));
	    for (i = 0; i < list_size && !glb->read_error; i++)
		glb->rl_list[list_type][i] = pfb_read_hlight(i, glb);
	}
	else if (list_type == L_UDATA)
	{
	    glb->udi = (udata_info_t *)malloc(list_size * sizeof(udata_info_t));
	    for (i = 0; i < list_size && !glb->read_error; i++)
		glb->rl_list[list_type][i] = pfb_read_udata(i, glb);
	}
	else
	{
	  for (i = 0; i < list_size && !glb->read_error; i++)
	    glb->rl_list[real_list_type][i] = pfb_read_func[list_type](glb);

	  /*
	    For pfb versions between PFBV_SHADER(inclusive) and
	    PFBV_REMOVE_SHADER(exclusive), L_SHADER is the last possible list type.
	    Break out of the list reading loop here if such a list has been
	    read.
	   */
	  if((glb->version >= PFBV_SHADER) && (glb->version < PFBV_REMOVE_SHADER)
	     && (list_type == (L_SHADER)))
	    break;

	}
    }

    if (!glb->read_error)
    {
	/*
	 *  connect nodes to their children
	 */
	connect_nodes(glb);

	/*
	 *  set root node
	 */
	if (glb->l_num[L_NODE]) {
	    root = glb->rl_list[L_NODE][0];
        }
	else
	{
	    glb->read_error = 1;
	    pfNotify(PFNFY_WARN, PFNFY_PRINT,
		     "pfdLoadFile_pfb:  No nodes found.\n");
	}
    }

    /*
     *  close the file
     */
    fclose(glb->ifp);

    /*
     * tessellate the file
     */
    if(glb->surface_count > 0 && getenv("PF_LOADER_FORCE_TESS"))
      tessellate_root(root, glb);

    /*
     *  warn about errors
     */
    if (glb->read_error)
    {
	pfNotify(PFNFY_WARN, PFNFY_PRINT,
		 "pfdLoadFile_pfb:  Read error.\n");
	pfNotify(PFNFY_WARN, PFNFY_PRINT,
		 "pfdLoadFile_pfb:  Aborting read of \"%s\".\n", path);
	root = NULL;
    }

    /*
     *  free temporary memory used in creating the file.
     */
    free_load_data(glb);

    return(root);
}



static int *set_buf_size(int size, pfa_global_t *glb)
{
    if (glb->buf_size < size)
    {
	if (glb->buf)
	    free(glb->buf);
	glb->buf = (int *)malloc(size * sizeof(int));
	glb->buf_size = size;
    }

    return(glb->buf);
}

static void *pfb_read_mtl(pfa_global_t *glb)
{
    pfMaterial *mtl;
    mtl_t m;

    pfb_fread(&m, sizeof(mtl_t), 1, glb->ifp);

    mtl = pfNewMtl(glb->arena);

    pfMtlSide(mtl, mtls_table[m.side]);
    pfMtlAlpha(mtl, m.alpha);
    pfMtlShininess(mtl, m.shininess);
    pfMtlColor(mtl, PFMTL_AMBIENT, m.ambient[0], m.ambient[1], m.ambient[2]);
    pfMtlColor(mtl, PFMTL_DIFFUSE, m.diffuse[0], m.diffuse[1], m.diffuse[2]);
    pfMtlColor(mtl, PFMTL_SPECULAR,
	       m.specular[0], m.specular[1], m.specular[2]);
    pfMtlColor(mtl, PFMTL_EMISSION,
	       m.emission[0], m.emission[1], m.emission[2]);
    pfMtlColorMode(mtl, mtls_table[m.cmode[0]], cmode_table[m.cmode[1]]);
    if (m.udata != -1)
	set_udata((pfObject *)mtl, m.udata, glb);

    return(share_obj((pfObject *)mtl, glb));
}



static void *pfb_read_tex(pfa_global_t *glb)
{
    int size;
    tex_t *t;
    tex_list_t *tl;



    tl = (tex_list_t *)malloc(sizeof(tex_list_t));

    pfb_fread(&size, sizeof(int), 1, glb->ifp);
    if (size == -1)
	tl->name = NULL;
    else
    {
	tl->name = (char *)malloc(size+1);
	pfb_fread(tl->name, 1, size, glb->ifp);
	tl->name[size] = '\0';
    }

    tl->t = t = (tex_t *)malloc(sizeof(tex_t));

    t -> aniso_degree = 1;
    if (glb->version >= PFBV_ANISOTROPY)
	pfb_fread(t, sizeof(tex_t), 1, glb->ifp);
    else
    if (glb->version >= PFBV_CLIPTEXTURE)
	pfb_fread(t, sizeof(tex_1_t), 1, glb->ifp);
    else
    {
	pfb_fread(t, sizeof(tex_0_t), 1, glb->ifp);
	t->type = TEXTYPE_TEXTURE;
    }

    if (t->list_size > 0)
    {
	tl->itlist = malloc(t->list_size * sizeof(int));
	pfb_fread(tl->itlist, sizeof(int), t->list_size, glb->ifp);
    }
    else
	tl->itlist = NULL;

    if (t->type == TEXTYPE_TEXTURE)
    {
	tl->ct = NULL;
	tl->cliplevels = NULL;

	if (t->num_levels > 0)
	{
	    tl->levels = (level_t *)malloc(t->num_levels * sizeof(level_t));
	    pfb_fread(tl->levels, sizeof(level_t), t->num_levels, glb->ifp);
	}
	else
	    tl->levels = NULL;
    }
    else /* (t->type == TEXTYPE_CLIPTEXTURE) */
    {
	tl->levels = NULL;
	tl->ct = (cliptex_t *)malloc(sizeof(cliptex_t));
	pfb_fread(tl->ct, sizeof(cliptex_t), 1, glb->ifp);

	if (t->num_levels > 0)
	{
	    tl->cliplevels = (cliplevel_t *)malloc(t->num_levels *
						   sizeof(cliplevel_t));
	    pfb_fread(tl->cliplevels, sizeof(cliplevel_t), t->num_levels, glb->ifp);
	}
	else
	    tl->cliplevels = NULL;
    }

    if((t->format[4] >> 2) == 1)
    {
	int i;

	/* cube map */
	pfb_fread(&tl->num_images, sizeof(int), 1, glb->ifp);

	for(i=0; i<tl->num_images; i++)
	{
	    pfb_fread(&tl->iimages[i], sizeof(int), 1, glb->ifp);

	    pfb_fread(&size, sizeof(int), 1, glb->ifp);

	    if(size > 0)
	    {
	        tl->names[i] = (char *)malloc(size+1);
		pfb_fread(tl->names[i], 1, size, glb->ifp);
		tl->names[i][size] = '\0';
	    }
	    else
	        tl->names[i] = NULL;
	}
    }
    else
	tl->num_images = 0;

    return(share_tex(tl, glb));
}


static void *pfb_read_tenv(pfa_global_t *glb)
{
    pfTexEnv *tenv;
    tenv_t t;

    pfb_fread(&t, sizeof(tenv_t), 1, glb->ifp);

    tenv = pfNewTEnv(glb->arena);
    pfTEnvMode(tenv, tem_table[t.mode]);
    pfTEnvComponent(tenv, tec_table[t.component]);
    pfTEnvBlendColor(tenv, t.color[0], t.color[1], t.color[2], t.color[3]);
    if (t.udata != -1)
	set_udata((pfObject *)tenv, t.udata, glb);

    return(share_obj((pfObject *)tenv, glb));
}


static void *pfb_read_gstate(pfa_global_t *glb)
{
    pfGeoState *gstate;
    uint64_t imask;
    int i, j;
    int t1, t2, t3;
    int buf_size, buf_pos;
    int end_of_states;
    int *buf;

    pfb_fread(&buf_size, sizeof(int), 1, glb->ifp);
    buf = glb->buf;
	pfb_fread(buf, sizeof(int), buf_size, glb->ifp);

    gstate = pfNewGState(glb->arena);

#ifndef WIN32
    imask = 0xffffffffffffffffLL;
#else
    imask = 0xffffffffffffffffL;
#endif

    buf_pos = 0;
    end_of_states = buf_size - 1;
    while (buf_pos < end_of_states)
    {
	i = buf[buf_pos++];
	imask &= ~gst_table[i];

	switch (i)
	{
	    /*
	     *  Modes
	     */
	    case STATE_TRANSPARENCY:
		pfGStateMode(gstate, gst_table[i], tr_table[buf[buf_pos++]]);
		break;
	    case STATE_ANTIALIAS:
		pfGStateMode(gstate, gst_table[i], aa_table[buf[buf_pos++]]);
		break;
	    case STATE_DECAL:
		t1 = buf[buf_pos++];
		t2 = buf[buf_pos++];
		t3 = buf[buf_pos++];
		pfGStateMode(gstate, gst_table[i],
			     decal_table[t1] |
			     (t2 << PFDECAL_LAYER_SHIFT) |
			     ((t3)? PFDECAL_LAYER_OFFSET : 0));
		break;
	    case STATE_ALPHAFUNC:
		pfGStateMode(gstate, gst_table[i], af_table[buf[buf_pos++]]);
		break;
	    case STATE_CULLFACE:
		pfGStateMode(gstate, gst_table[i], cf_table[buf[buf_pos++]]);
		break;

	    case STATE_ENTEXTURE:
	    case STATE_ENTEXGEN:
	    case STATE_ENTEXLOD:
	    case STATE_ENTEXMAT:
		/*
		//
		// This skips a warning message from pfGStateMultiMode when
		// Hardware has less than PF_MAX_TEXTURES_19 texture units.
		*/
		if (oo_table[buf[buf_pos++]])
		    pfGStateMode(gstate, gst_table[i], 1);

		if (glb->version >= PFBV_MULTITEXTURE)
		{
		  for (j = 1 ; j < glb->maxTextures ; j ++)
			if (oo_table[buf[buf_pos++]] == PF_ON)
			    pfGStateMultiMode(gstate, gst_table[i], j, PF_ON);
		}
		break;

	    case STATE_ENLIGHTING:
	    case STATE_ENFOG:
	    case STATE_ENWIREFRAME:
	    case STATE_ENCOLORTABLE:
	    case STATE_ENHIGHLIGHTING:
	    case STATE_ENLPOINTSTATE:
	    case STATE_ENVTXPROG:
	    case STATE_ENFRAGPROG:
	    case STATE_ENSHADPROG:
		pfGStateMode(gstate, gst_table[i], oo_table[buf[buf_pos++]]);
		break;

	    /*
	     *  Values
	     */
	    case STATE_ALPHAREF:
		pfGStateVal(gstate, gst_table[i], ((float *)buf)[buf_pos++]);
		break;

	    /*
	     *  Attributes
	     */
	    case STATE_FRONTMTL:
	    case STATE_BACKMTL:
		pfGStateAttr(gstate, gst_table[i],
			     glb->rl_list[L_MTL][buf[buf_pos++]]);
		break;
	    case STATE_TEXTURE:
		pfGStateAttr(gstate, gst_table[i],
			     glb->rl_list[L_TEX][buf[buf_pos++]]);
		if (glb->version >= PFBV_MULTITEXTURE)
		{
		    for (j = 1 ; j < glb->maxTextures ; j ++)
			if (buf[buf_pos] >= 0)
			    pfGStateMultiAttr(gstate, gst_table[i], j,
				 glb->rl_list[L_TEX][buf[buf_pos++]]);
			else
			    buf_pos++;
		}
		break;
	    case STATE_TEXENV:
		pfGStateAttr(gstate, gst_table[i],
			     glb->rl_list[L_TENV][buf[buf_pos++]]);
		if (glb->version >= PFBV_MULTITEXTURE)
		{
		    for (j = 1 ; j < glb->maxTextures ; j ++)
			if (buf[buf_pos] >= 0)
			    pfGStateMultiAttr(gstate, gst_table[i], j,
				     glb->rl_list[L_TENV][buf[buf_pos++]]);
			else
			    buf_pos++;
		}
		break;
	    case STATE_FOG:
		pfGStateAttr(gstate, gst_table[i],
			     glb->rl_list[L_FOG][buf[buf_pos++]]);
		break;
	    case STATE_LIGHTMODEL:
		pfGStateAttr(gstate, gst_table[i],
			     glb->rl_list[L_LMODEL][buf[buf_pos++]]);
		break;
	    case STATE_LIGHTS:
		{
		    pfLight *lights[PF_MAX_LIGHTS];
		    int lcount, j;

		    lcount = buf[buf_pos++];
		    for (j = 0; j < lcount; j++)
		    {
			if ((t1 = buf[buf_pos++]) != -1)
			    lights[j] = glb->rl_list[L_LIGHT][t1];
			else
			    lights[j] = NULL;
		    }
		    for (; j < PF_MAX_LIGHTS; j++)
			lights[j] = NULL;

		    pfGStateAttr(gstate, gst_table[i], lights);
		}
		break;
	    case STATE_COLORTABLE:
		pfGStateAttr(gstate, gst_table[i],
			     glb->rl_list[L_CTAB][buf[buf_pos++]]);
		break;
	    case STATE_HIGHLIGHT:
		pfGStateAttr(gstate, gst_table[i],
			     glb->rl_list[L_HLIGHT][buf[buf_pos++]]);
		break;
	    case STATE_LPOINTSTATE:
		pfGStateAttr(gstate, gst_table[i],
			     glb->rl_list[L_LPSTATE][buf[buf_pos++]]);
		break;
	    case STATE_TEXGEN:
		pfGStateAttr(gstate, gst_table[i],
			     glb->rl_list[L_TGEN][buf[buf_pos++]]);
		if (glb->version >= PFBV_MULTITEXTURE)
		{
		    for (j = 1 ; j < glb->maxTextures ; j ++)
			if (buf[buf_pos] >= 0)
			    pfGStateMultiAttr(gstate, gst_table[i], j,
				     glb->rl_list[L_TGEN][buf[buf_pos++]]);
			else
			    buf_pos++;
		}
		break;
	    case STATE_TEXLOD:
		pfGStateAttr(gstate, gst_table[i],
			     glb->rl_list[L_TLOD][buf[buf_pos++]]);
		if (glb->version >= PFBV_MULTITEXTURE)
		{
		    for (j = 1 ; j < glb->maxTextures ; j ++)
			if (buf[buf_pos] >= 0)
			    pfGStateMultiAttr(gstate, gst_table[i], j,
				 glb->rl_list[L_TLOD][buf[buf_pos++]]);
			else
			    buf_pos++;
		}
		break;
	    case STATE_SHADPROG:
	        pfGStateAttr(gstate, gst_table[i],
			     glb->rl_list[L_SHADPROG][buf[buf_pos++]]);
		break;
	    case STATE_VERTEX_PROGRAM:
	    case STATE_FRAGMENT_PROGRAM:
	        /*pfNotify(PFNFY_ALWAYS, PFNFY_PRINT, "Pointer to prog:   0x%x",
		  glb->rl_list[L_GPROG][buf[buf_pos]]);*/
		pfGStateAttr(gstate, gst_table[i],
			     glb->rl_list[L_GPROG][buf[buf_pos++]]);
		break;
	    case STATE_GPROGPARMS:
	        {
		    int count, j, ix, pindex;

		    count = buf[buf_pos++];

		    for(j=0; j<count; j++)
		    {
			ix = buf[buf_pos++];
			pindex = buf[buf_pos++];
		      pfGStateMultiAttr(gstate, gst_table[i], ix,
					glb->rl_list[L_GPROGPARM][pindex]);
		    }
		    break;
		}
	    case STATE_TEXMAT:
		{
		    pfMatrix *m;

		    m = (pfMatrix *)pfMalloc(sizeof(pfMatrix), glb->arena);

		    if (glb->version < PFBV_MULTITEXTURE)
		    {
			(*m)[0][0] = ((float *)buf)[buf_pos++];
			(*m)[0][1] = ((float *)buf)[buf_pos++];
			(*m)[0][2] = ((float *)buf)[buf_pos++];
			(*m)[0][3] = ((float *)buf)[buf_pos++];
			(*m)[1][0] = ((float *)buf)[buf_pos++];
			(*m)[1][1] = ((float *)buf)[buf_pos++];
			(*m)[1][2] = ((float *)buf)[buf_pos++];
			(*m)[1][3] = ((float *)buf)[buf_pos++];
			(*m)[2][0] = ((float *)buf)[buf_pos++];
			(*m)[2][1] = ((float *)buf)[buf_pos++];
			(*m)[2][2] = ((float *)buf)[buf_pos++];
			(*m)[2][3] = ((float *)buf)[buf_pos++];
			(*m)[3][0] = ((float *)buf)[buf_pos++];
			(*m)[3][1] = ((float *)buf)[buf_pos++];
			(*m)[3][2] = ((float *)buf)[buf_pos++];
			(*m)[3][3] = ((float *)buf)[buf_pos++];
			pfGStateAttr(gstate, gst_table[i], m);
		    }
		    else
		    {
			for (j = 0 ; j < glb->maxTextures ; j ++)
			{
			    if (buf[buf_pos++])
			    {
				(*m)[0][0] = ((float *)buf)[buf_pos++];
				(*m)[0][1] = ((float *)buf)[buf_pos++];
				(*m)[0][2] = ((float *)buf)[buf_pos++];
				(*m)[0][3] = ((float *)buf)[buf_pos++];
				(*m)[1][0] = ((float *)buf)[buf_pos++];
				(*m)[1][1] = ((float *)buf)[buf_pos++];
				(*m)[1][2] = ((float *)buf)[buf_pos++];
				(*m)[1][3] = ((float *)buf)[buf_pos++];
				(*m)[2][0] = ((float *)buf)[buf_pos++];
				(*m)[2][1] = ((float *)buf)[buf_pos++];
				(*m)[2][2] = ((float *)buf)[buf_pos++];
				(*m)[2][3] = ((float *)buf)[buf_pos++];
				(*m)[3][0] = ((float *)buf)[buf_pos++];
				(*m)[3][1] = ((float *)buf)[buf_pos++];
				(*m)[3][2] = ((float *)buf)[buf_pos++];
				(*m)[3][3] = ((float *)buf)[buf_pos++];
				pfGStateMultiAttr(gstate, gst_table[i], j, m);
			    }
			}
		    }
		}
		break;
	}
    }

    t1 = buf[buf_pos++];
    if (t1 != -1)
	set_udata((pfObject *)gstate, t1, glb);

    pfGStateInherit(gstate, imask);

    return(share_obj((pfObject *)gstate, glb));
}



static void *pfb_read_slist_header(void **data, int unit_size, int *size,
				   pfa_global_t *glb)
{
    int buf[3];

    pfb_fread(&buf, sizeof(int), 3, glb->ifp);

    *size = buf[0];

    switch (buf[1])	/* Memory type */
    {
	case MEM_ARENA:
	    *data = pfMalloc(buf[0] * unit_size, glb->arena);
	    return(*data);
	case MEM_CBUF:
	    {
		pfCycleBuffer *cbuf;

		cbuf = pfNewCBuffer(buf[0] * unit_size, glb->arena);
		*data = pfGetCurCBufferData(cbuf);
		pfCBufferChanged(cbuf);
		if (buf[2] != -1)
		    set_udata((pfObject *)cbuf, buf[2], glb);
		return(cbuf);
	    }
	case MEM_FLUX:
	    return(glb->rl_list[L_FLUX][buf[2]]);
    }
    return NULL;
}


static void *pfb_read_llist(pfa_global_t *glb)
{
    void *rbuf;
    int size;
    int *llist;

    rbuf = pfb_read_slist_header((void **)(&llist), sizeof(int), &size, glb);
    if (size > 0)
	pfb_fread(llist, sizeof(int), size, glb->ifp);
    return(rbuf);
}


static void *pfb_read_vlist(pfa_global_t *glb)
{
    void *rbuf;
    int size;
    pfVec3 *vlist;

    rbuf = pfb_read_slist_header((void **)(&vlist), sizeof(pfVec3), &size, glb);
    if (size > 0)
    {
	pfb_fread(vlist, sizeof(pfVec3), size, glb->ifp);
	if (glb->crypt_key)
	    glb->decrypt_func((int)(size * sizeof(pfVec3)), glb->crypt_key,
			      vlist);
    }

    return(rbuf);
}




static void *pfb_read_clist(pfa_global_t *glb)
{
    void *rbuf;
    int size;
    pfVec4 *clist;

    rbuf = pfb_read_slist_header((void **)(&clist), sizeof(pfVec4), &size, glb);
    if (size > 0)
	pfb_fread(clist, sizeof(pfVec4), size, glb->ifp);

    return(rbuf);
}




static void *pfb_read_nlist(pfa_global_t *glb)
{
    void *rbuf;
    int size;
    pfVec3 *nlist;

    rbuf = pfb_read_slist_header((void **)(&nlist), sizeof(pfVec3), &size, glb);
    if (size > 0)
	pfb_fread(nlist, sizeof(pfVec3), size, glb->ifp);
    return(rbuf);
}



static void *pfb_read_tlist(pfa_global_t *glb)
{
    void *rbuf;
    int size;
    pfVec2 *tlist;

    rbuf = pfb_read_slist_header((void **)(&tlist), sizeof(pfVec2), &size, glb);
    if (size > 0)
	pfb_fread(tlist, sizeof(pfVec2), size, glb->ifp);
    return(rbuf);
}


static void *pfb_read_ilist(pfa_global_t *glb)
{
    void *rbuf;
    int size;
    ushort *ilist;

    rbuf = pfb_read_slist_header((void **)(&ilist), sizeof(ushort), &size, glb);
    if (size > 0)
	pfb_fread(ilist, sizeof(ushort), size, glb->ifp);
    return(rbuf);
}



static void *pfb_read_gset(pfa_global_t *glb)
{
    pfGeoSet 	*gset;
    gset_t 	g;
    int		i, j;

    if (glb->version >= PFBV_MAX_TEXTURES_8) // 31
        pfb_fread(&g, sizeof(gset_t), 1, glb->ifp);
    else if (glb->version >= PFBV_SHADER_V2) //26
        pfb_fread(&g, sizeof(gset_4_t), 1, glb->ifp);
    else if(glb->version >= PFBV_MULTITEXTURE) //19
	pfb_fread(&g, sizeof(gset_3_t), 1, glb->ifp);
    else if (glb->version >= PFBV_GSET_BBOX_FLUX) //8
	pfb_fread(&g, sizeof(gset_2_t), 1, glb->ifp);
    else if (glb->version >= PFBV_GSET_DO_DP) //5
	pfb_fread(&g, sizeof(gset_1_t), 1, glb->ifp);
    else
	pfb_fread(&g, sizeof(gset_0_t), 1, glb->ifp);

    gset = pfNewGSet(glb->arena);

    pfGSetPrimType(gset, gspt_table[g.ptype]);
    pfGSetNumPrims(gset, g.pcount);
    if (g.llist != -1)
	pfGSetPrimLengths(gset, glb->rl_list[L_LLIST][g.llist]);
    pfGSetAttr(gset, PFGS_COORD3, gsb_table[g.vlist[0]],
	       (g.vlist[1] == -1)? NULL : glb->rl_list[L_VLIST][g.vlist[1]],
	       (g.vlist[2] == -1)? NULL : glb->rl_list[L_ILIST][g.vlist[2]]);
    pfGSetAttr(gset, PFGS_COLOR4, gsb_table[g.clist[0]],
	       (g.clist[1] == -1)? NULL : glb->rl_list[L_CLIST][g.clist[1]],
	       (g.clist[2] == -1)? NULL : glb->rl_list[L_ILIST][g.clist[2]]);
    pfGSetAttr(gset, PFGS_NORMAL3, gsb_table[g.nlist[0]],
	       (g.nlist[1] == -1)? NULL : glb->rl_list[L_NLIST][g.nlist[1]],
	       (g.nlist[2] == -1)? NULL : glb->rl_list[L_ILIST][g.nlist[2]]);
    pfGSetAttr(gset, PFGS_TEXCOORD2, gsb_table[g.tlist[0]],
	       (g.tlist[1] == -1)? NULL : glb->rl_list[L_TLIST][g.tlist[1]],
	       (g.tlist[2] == -1)? NULL : glb->rl_list[L_ILIST][g.tlist[2]]);
    pfGSetDrawMode(gset, PFGS_FLATSHADE, oo_table[g.draw_mode[0]]);
    pfGSetDrawMode(gset, PFGS_WIREFRAME, oo_table[g.draw_mode[1]]);
    if (glb->compile_gl == PFPFB_COMPILE_GL_ON ||
	(glb->compile_gl == PFPFB_COMPILE_GL_AS_SAVED &&
	 oo_table[g.draw_mode[2]] == PF_ON))
	pfGSetDrawMode(gset, PFGS_COMPILE_GL, PF_ON);
    if (g.gstate[0] != -1)
	pfGSetGState(gset, glb->rl_list[L_GSTATE][g.gstate[0]]);
    if (g.gstate[1] != -1)
	pfGSetGStateIndex(gset, g.gstate[1]);
    pfGSetLineWidth(gset, g.line_width);
    pfGSetPntSize(gset, g.point_size);
    pfGSetDrawBin(gset, g.draw_bin);
    pfGSetIsectMask(gset, g.isect_mask,
		    (PFTRAV_SELF | PFTRAV_IS_CACHE), PF_SET);
    if (g.hlight != -1)
	pfGSetHlight(gset, glb->rl_list[L_HLIGHT][g.hlight]);
    pfGSetBBox(gset, &g.bbox, bound_table[g.bbox_mode]);
    if (g.udata != -1)
	set_udata((pfObject *)gset, g.udata, glb);

    if (glb->version >= PFBV_GSET_DO_DP)
    {
	pfGSetDrawOrder(gset, g.draw_order);
	if (g.decal_plane != -1)
	{
	    pfPlane *plane;

	    plane = (pfPlane *)pfMalloc(sizeof(pfPlane), glb->arena);
	    PFCOPY_VEC3(plane->normal, g.dplane_normal);
	    plane->offset = g.dplane_offset;
	    pfGSetDecalPlane(gset, plane);
	}
    }
    if (glb->version >= PFBV_GSET_BBOX_FLUX)
    {
	if (g.bbox_flux != -1)
	    pfGSetBBoxFlux(gset, glb->rl_list[L_FLUX][g.bbox_flux]);
    }

    if (glb->version >= PFBV_MULTITEXTURE)
    {
	/*
	 *	To retain backwards compatibility, we store texture attr's
	 *	for texture unit # 0 in tlist, and texture attributes for
	 *	texture units #1, #2, ... in multi_tlist.
	 *
	 *	we process multi_tlist only if the pfb format version is
	 *	late enough.
	 */

        int numIters =
	  (glb->version >= PFBV_MAX_TEXTURES_8) ? glb->maxTextures : 4;
        int multi_tlist[(PF_MAX_TEXTURES_31-1) * 3];

	memcpy(multi_tlist,g.multi_tlist,sizeof(int)*3*3);
	memcpy(multi_tlist + 3*3, g.multi_tlist2, sizeof(int)*4*3);

	for (i = 1 ; i < numIters ; i ++)
	{
	    j = (i - 1) * 3;
	    if (gsb_table[multi_tlist[j]] != PFGS_OFF)
		pfGSetMultiAttr(gset, PFGS_TEXCOORD2, i,
		   gsb_table[multi_tlist[j]],
		   (multi_tlist[j + 1] == -1) ?
			NULL : glb->rl_list[L_TLIST][multi_tlist[j + 1]],
		   (multi_tlist[j + 2] == -1) ?
			NULL : glb->rl_list[L_ILIST][multi_tlist[j + 2]]);
	}
    }

    if(glb->version >= PFBV_SHADER_V2) {
      if(g.appearance >= 0) {
	islAppearance *a = glb->rl_list[L_APPEARANCE][g.appearance];
	pfGSetAppearance(gset, a);
      }
    }

    return(gset);
}


static void *pfb_read_image(pfa_global_t *glb)
{
    uint *image;
    int buf[5];
    int flipBeforeDecryptFlag = (r_swap && glb->crypt_key != NULL) ? 1 : 0;

    pfb_fread(buf, sizeof(int), 5, glb->ifp);
    image = pfMalloc(buf[0], glb->arena);
    pfb_fread(image, 1, buf[0], glb->ifp);

    if (glb->crypt_key)
    {
      if(flipBeforeDecryptFlag)
	  image = flip_components(image, buf[0], 4, buf[2], buf[4]);

      glb->decrypt_func(buf[0], glb->crypt_key, image);
    }

    if(flipBeforeDecryptFlag)
      image = flip_components(image, buf[0], 4, buf[2], buf[4]);
    else if(buf[3] != COMPONENT_ORDER)
      image = flip_components(image, buf[0], buf[1], buf[2], buf[4]);

    return(image);
}


static void *pfb_read_string(pfa_global_t *glb)
{
    pfString *string;
    string_t s;
    char *str;
    int size;

    pfb_fread(&s, sizeof(string_t), 1, glb->ifp);
    pfb_fread(&size, sizeof(int), 1, glb->ifp);
    if (size > 0)
    {
	str = pfMalloc(size, glb->arena);
	pfb_fread(str, 1, size, glb->ifp);
    }

    string = pfNewString(glb->arena);
    pfStringMat(string, s.mat);
    pfStringMode(string, PFSTR_JUSTIFY, strj_table[s.justify]);
    pfStringMode(string, PFSTR_CHAR_SIZE, strcs_table[s.char_size]);
    if (s.font != -1)
	pfStringFont(string, glb->rl_list[L_FONT][s.font]);
    pfStringSpacingScale(string, s.spacing_scale[0], s.spacing_scale[1],
			 s.spacing_scale[2]);
    pfStringColor(string, s.color[0], s.color[1], s.color[2], s.color[3]);
    if (s.gstate[0] != -1)
	pfStringGState(string, glb->rl_list[L_GSTATE][s.gstate[0]]);
    pfStringIsectMask(string, s.isect_mask,
		      (PFTRAV_SELF | PFTRAV_IS_CACHE), PF_SET);
    if (size != -1)
	pfStringString(string, str);
    pfStringBBox(string, &s.bbox);

    return(string);
}



static void *pfb_read_node(int node_num, pfa_global_t *glb)
{
    int i, count, valuesLeft;
    int t1, t2, t3;
    float f1;
    pfVec3 v1;
    void *node;
    int node_type, custom_id;
    custom_node_t *custom;
    int buf_size, buf_pos;
    int *buf;

    pfb_fread(&buf_size, sizeof(int), 1, glb->ifp);
    buf = GET_BUF(buf_size);
    pfb_fread(buf, sizeof(int), buf_size, glb->ifp);

    buf_pos = 0;
    node_type = buf[buf_pos++];
    node = NULL;
    if (node_type & N_CUSTOM)
    {
	custom_id = (node_type & N_CUSTOM_MASK) >> N_CUSTOM_SHIFT;
	if (custom = glb->rl_list[L_CUSTOM][custom_id])
	{
	    if (custom->new_func == NULL)
	    {
		pfNotify(PFNFY_WARN, PFNFY_PRINT,
			 "%s Custom node type \"%s\" has no new func.",
			 "pfdLoadFile_pfb: ", custom->name);
		custom = NULL;
	    }
	    else if (custom->load_func == NULL)
	    {
		pfNotify(PFNFY_WARN, PFNFY_PRINT,
			 "%s Custom node type \"%s\" has no load func.",
			 "pfdLoadFile_pfb: ", custom->name);
		custom = NULL;
	    }
	    else
		node = custom->new_func();
	}
    }
    else
	custom_id = -1;
    node_type &= N_NOT_CUSTOM_MASK;

    switch (node_type)
    {
	case N_LIGHTPOINT:
	    /* Obsolete */
	    break;
	case N_TEXT:
	    if (node == NULL)
		node = pfNewText();
	    count = buf[buf_pos++];
	    for (i = 0; i < count; i++)
	    {
		pfAddString((pfText *)node,
			    glb->rl_list[L_STRING][buf[buf_pos++]]);
	    }
	    break;
	case N_GEODE:
	    if (node == NULL)
		node = pfNewGeode();
	    count = buf[buf_pos++];
	    break;
        case N_SUBDIV_SURFACE:
	    if (node == NULL)
		node = pfNewSubdivSurface(glb->arena);

	    valuesLeft = buf[buf_pos++];

	    /* read pfRep stuff */
	    {
		pfVec3 vec;
		pfMatrix m;
		int     x,y;

		for(i=0; i<3; i++)
		    vec[i] = ((float *)buf)[buf_pos++];

		pfRepOrigin((pfRep *)node, vec);

		for(y=0; y<4; y++)
		    for(x=0; x<4; x++)
			m[y][x] = ((float *)buf)[buf_pos++];

		pfRepOrient((pfRep *)node, m);
		valuesLeft -= 3 + 16;
	    }

	    /* flags */
	    pfSubdivSurfaceFlags((pfSubdivSurface *)node, 0xffffffff, 0); /* set all to 0 */
	    pfSubdivSurfaceFlags((pfSubdivSurface *)node, buf[buf_pos++], 1);
	    valuesLeft--;

	    pfSubdivSurfaceVal((pfSubdivSurface *)node,
			       PFSB_SUBDIVISION_METHOD, buf[buf_pos++]);
	    valuesLeft--;

	    pfSubdivSurfaceVal((pfSubdivSurface *)node,
			       PFSB_SUBDIVISION_LEVEL, buf[buf_pos++]);
	    valuesLeft--;

	    /* mesh */
	    pfSubdivSurfaceMesh((pfSubdivSurface *)node,
				glb->rl_list[L_MESH][buf[buf_pos++]]);
	    valuesLeft--;

	    count = buf[buf_pos++];
	    valuesLeft--;

	    buf_pos += valuesLeft;
	    break;

        case N_TORUS:
	    if(node == NULL)
	      node = pfNewTorusSurface();

	    buf_pos++; /* ZZZ Alex -- BAD BAD BAD .. don't understand
			  why we have to skip one value here ... */

	    pfb_read_parasurface(glb,(pfParaSurface *)node,&buf_pos);

	    pfTorusSurfaceMinorRadius((pfTorusSurface *)node,((float *)buf)[buf_pos++]);
	    pfTorusSurfaceMajorRadius((pfTorusSurface *)node,((float *)buf)[buf_pos++]);

	    count = buf[buf_pos++];
	    break;

        case N_SPHERE_SURF:
	    if(node == NULL)
	      node = pfNewSphereSurface();

	    buf_pos++; /* ZZZ Alex -- BAD BAD BAD .. don't understand
			  why we have to skip one value here ... */

	    pfb_read_parasurface(glb,(pfParaSurface *)node,&buf_pos);

	    pfSphereSurfaceRadius((pfSphereSurface *)node, ((float *)buf)[buf_pos++]);

	    count = buf[buf_pos++];
	    break;

        case N_CONE:
	    if(node == NULL)
	      node = pfNewConeSurface();

	    buf_pos++; /* ZZZ Alex -- BAD BAD BAD .. don't understand
			  why we have to skip one value here ... */

	    pfb_read_parasurface(glb,(pfParaSurface *)node,&buf_pos);

	    pfConeSurfaceRadius((pfConeSurface *)node, ((float *)buf)[buf_pos++]);
	    pfConeSurfaceHeight((pfConeSurface *)node, ((float *)buf)[buf_pos++]);

	    count = buf[buf_pos++];
	    break;

        case N_CYLINDER:
	    if(node == NULL)
	      node = pfNewCylinderSurface();

	    buf_pos++; /* ZZZ Alex -- BAD BAD BAD .. don't understand
			  why we have to skip one value here ... */

	    pfb_read_parasurface(glb,(pfParaSurface *)node,&buf_pos);

	    pfCylinderSurfaceRadius((pfCylinderSurface *)node,
				    ((float *)buf)[buf_pos++]);
	    pfCylinderSurfaceHeight((pfCylinderSurface *)node,
				    ((float *)buf)[buf_pos++]);

	    count = buf[buf_pos++];
	    break;

        case N_NURB_CURVE2D:
	    /* read nurb curve 2d */
	    if(node == NULL)
	      node = pfNewNurbCurve2d();

	    buf_pos++; /* ZZZ Alex -- BAD BAD BAD .. don't understand
			  why we have to skip one value here ... */

	    buf_pos += pfb_read_nurb_curve2d(glb, (pfNurbCurve2d *)node);

	    count = buf[buf_pos++];
	    break;

        case N_NURB_SURFACE:
	    if(node == NULL)
	      node = pfNewNurbSurface();

	    buf_pos++; /* ZZZ Alex -- BAD BAD BAD .. don't understand
			  why we have to skip one value here ... */

	    pfb_read_parasurface(glb,(pfParaSurface *)node, &buf_pos);

	    {
	      int uKnotCount, vKnotCount;
	      int uSize, vSize, ii, jj;
	      pfVec4 pt;
	      pfNurbSurface *nurbs = (pfNurbSurface *)node;

	      uKnotCount = buf[buf_pos++];
	      vKnotCount = buf[buf_pos++];
	      uSize = buf[buf_pos++];
	      vSize = buf[buf_pos++];

	      /* read ctrl pts */
	      for(ii=0; ii<vSize; ii++) {
		for(jj=0; jj<uSize; jj++) {
		  pt[0] = ((float *)buf)[buf_pos++];
		  pt[1] = ((float *)buf)[buf_pos++];
		  pt[2] = ((float *)buf)[buf_pos++];
		  pt[3] = ((float *)buf)[buf_pos++];

		  pfNurbSurfaceControlHull4(nurbs,jj,ii,pt);
		}
	      }

	      /* read u knot vector */
	      for(ii=0; ii < uKnotCount; ii++)
		pfNurbSurfaceUknot(nurbs,ii,((float *)buf)[buf_pos++]);

	      /* read v knot vector */
	      for(ii=0; ii < vKnotCount; ii++)
		pfNurbSurfaceVknot(nurbs,ii,((float *)buf)[buf_pos++]);
	    }

	    count = buf[buf_pos++];
	    break;

        case N_HSPLINE_SURFACE:
	    if(node == NULL)
	      node = pfNewHsplineSurface();

	    buf_pos++; /* ZZZ Alex -- BAD BAD BAD .. don't understand
			  why we have to skip one value here ... */

	    pfb_read_parasurface(glb,(pfParaSurface *)node, &buf_pos);

	    {
	      int uKnotCount, vKnotCount;
	      pfBool cylindrical;
	      pfHsplineSurface *hSurf = (pfHsplineSurface *)node;
	      pfReal *p, *tu, *tv, *tuv, *uu, *vv;
	      int stride;

	      uKnotCount = buf[buf_pos++];
	      vKnotCount = buf[buf_pos++];
	      cylindrical = buf[buf_pos++];

	      pfHsplineSurfaceCylindrical(hSurf, cylindrical);

	      stride = uKnotCount * vKnotCount * 3;

	      p   = &((float *)buf)[buf_pos];
	      tu  = p + stride;
	      tv  = tu + stride;
	      tuv = tv + stride;
	      uu  = tuv + stride;
	      vv  = uu + uKnotCount;

	      buf_pos += 4 * stride + uKnotCount + vKnotCount;
	      pfHsplineSurfaceAll(hSurf, p, tu, tv, tuv, uu, vv,
				  uKnotCount, vKnotCount);
	    }

	    count = buf[buf_pos++];

	    break;

        case N_PLANE_SURF:
	    if(node == NULL)
	      node = pfNewPlaneSurface();

	    buf_pos++; /* ZZZ Alex -- BAD BAD BAD .. don't understand
			  why we have to skip one value here ... */

	    pfb_read_parasurface(glb,(pfParaSurface *)node, &buf_pos);

	    {
	      pfReal vals[5];

	      vals[0] = ((float *)buf)[buf_pos++];
	      vals[1] = ((float *)buf)[buf_pos++];
	      vals[2] = ((float *)buf)[buf_pos++];
	      vals[3] = ((float *)buf)[buf_pos++];
	      vals[4] = ((float *)buf)[buf_pos++];

	      pfPlaneSurfacePoint1((pfPlaneSurface *)node,
				vals[0],vals[1],vals[2],vals[3],vals[4]);

	      vals[0] = ((float *)buf)[buf_pos++];
	      vals[1] = ((float *)buf)[buf_pos++];
	      vals[2] = ((float *)buf)[buf_pos++];
	      vals[3] = ((float *)buf)[buf_pos++];

	      pfPlaneSurfacePoint2((pfPlaneSurface *)node,
				vals[0],vals[1],vals[2],vals[3]);

	      vals[0] = ((float *)buf)[buf_pos++];
	      vals[1] = ((float *)buf)[buf_pos++];
	      vals[2] = ((float *)buf)[buf_pos++];
	      vals[3] = ((float *)buf)[buf_pos++];

	      pfPlaneSurfacePoint3((pfPlaneSurface *)node,
				vals[0],vals[1],vals[2],vals[3]);
	    }

	    count = buf[buf_pos++];
	    break;

        case N_PIECEWISEPOLYSURFACE:
	  /* ZZZ Alex */
	    if(node == NULL)
	      node = pfNewPieceWisePolySurface();

	    buf_pos++; /* ZZZ Alex -- BAD BAD BAD .. don't understand
			  why we have to skip one value here ... */

	    pfb_read_parasurface(glb,(pfParaSurface *)node, &buf_pos);

	    {
	      int uPatchCount, vPatchCount, uOrder, vOrder, u, v, uu, vv;
	      pfVec3 cHull;
	      pfPieceWisePolySurface *ppSurf = (pfPieceWisePolySurface *)node;

	      uPatchCount = buf[buf_pos++];
	      vPatchCount = buf[buf_pos++];

	      for(v=0; v<vPatchCount; v++) {
		for(u=0; u<uPatchCount; u++) {
		  uOrder = buf[buf_pos++];
		  vOrder = buf[buf_pos++];
		for(vv=0; vv<vOrder; vv++) {
		  for(uu=0; uu<uOrder; uu++) {
		    cHull[0] = ((float *)buf)[buf_pos++];
		    cHull[1] = ((float *)buf)[buf_pos++];
		    cHull[2] = ((float *)buf)[buf_pos++];

		    pfPieceWisePolySurfaceControlHull(ppSurf,
						      u, v, uu, vv, &cHull);
		  }
		}
		}
	      }
	    }

	    count = buf[buf_pos++];

	    break;

        case N_FRENET_SWEPT_SURFACE:
	  if(node == NULL)
	    node = pfNewFrenetSweptSurface();

	    buf_pos++; /* ZZZ Alex -- BAD BAD BAD .. don't understand
			  why we have to skip one value here ... */

	    pfb_read_parasurface(glb,(pfParaSurface *)node, &buf_pos);

	    {
	      int crossId, pathId, scalarId;
	      pfCurve3d *crossCurve = NULL, *pathCurve = NULL;
	      pfScalar *scalar = NULL;
	      pfFrenetSweptSurface *frenet = (pfFrenetSweptSurface *)node;

	      crossId = buf[buf_pos++];
	      pathId  = buf[buf_pos++];
	      scalarId= buf[buf_pos++];

	      if(crossId  > -1) crossCurve = glb->rl_list[L_NODE][crossId];
	      if(pathId   > -1) pathCurve  = glb->rl_list[L_NODE][pathId];
	      if(scalarId > -1) scalar     = glb->rl_list[L_SCALAR][scalarId];

	      pfFrenetSweptSurfaceSet(frenet, crossCurve, pathCurve, scalar);
	    }

	    count = buf[buf_pos++];

	    break;
        case N_SWEPT_SURFACE:
	  if(node == NULL)
	    node = pfNewSweptSurface();
	  buf_pos++; /* ZZZ Alex -- BAD BAD BAD .. don't understand
			why we have to skip one value here ... */

	  pfb_read_parasurface(glb,(pfParaSurface *)node, &buf_pos);
	  {
	    int crossId, pathId, tId, bId, scalarId;
	    pfCurve3d *crossCurve = NULL, *pathCurve = NULL, *tCurve = NULL, *bCurve = NULL;
	    pfScalar *scalar = NULL;
	    pfSweptSurface *swept = (pfSweptSurface *)node;

	    crossId = buf[buf_pos++];
	    pathId  = buf[buf_pos++];
	    tId     = buf[buf_pos++];
	    bId     = buf[buf_pos++];
	    scalarId= buf[buf_pos++];

	    if(crossId  > -1) crossCurve = glb->rl_list[L_NODE][crossId];
	    if(pathId   > -1) pathCurve  = glb->rl_list[L_NODE][pathId];
	    if(tId      > -1) tCurve     = glb->rl_list[L_NODE][tId];
	    if(bId      > -1) bCurve     = glb->rl_list[L_NODE][bId];
	    if(scalarId > -1) scalar     = glb->rl_list[L_SCALAR][scalarId];

	    if(crossCurve) pfSweptSurfaceCrossSection(swept, crossCurve);
	    if(pathCurve)  pfSweptSurfacePath(swept, pathCurve);
	    if(tCurve)     pfSweptSurfaceT(swept, tCurve);
	    if(bCurve)     pfSweptSurfaceB(swept, bCurve);
	    if(scalar)     pfSweptSurfaceProf(swept, scalar);
	  }

	  count = buf[buf_pos++];

	  break;

        case N_COONS:
	  if(node == NULL)
	    node = pfNewCoonsSurface();
	  buf_pos++; /* ZZZ Alex -- BAD BAD BAD .. don't understand
			why we have to skip one value here ... */

	  pfb_read_parasurface(glb,(pfParaSurface *)node, &buf_pos);
	  {
	    int rId, lId, bId, tId;
	    pfCurve3d *rCurve = NULL, *lCurve = NULL, *bCurve = NULL, *tCurve = NULL;
	    pfCoonsSurface *coons = (pfCoonsSurface *)node;

	    rId = buf[buf_pos++];
	    lId = buf[buf_pos++];
	    bId = buf[buf_pos++];
	    tId = buf[buf_pos++];

	    if(rId > -1) rCurve = glb->rl_list[L_NODE][rId];
	    if(lId > -1) lCurve = glb->rl_list[L_NODE][lId];
	    if(bId > -1) bCurve = glb->rl_list[L_NODE][bId];
	    if(tId > -1) tCurve = glb->rl_list[L_NODE][tId];

	    if(rCurve) pfCoonsSurfaceRight(coons, rCurve);
	    if(lCurve) pfCoonsSurfaceLeft(coons, lCurve);
	    if(bCurve) pfCoonsSurfaceBottom(coons, bCurve);
	    if(tCurve) pfCoonsSurfaceTop(coons, tCurve);
	  }
	  count = buf[buf_pos++];
	  break;

        case N_RULED:
	  if(node == NULL)
	    node = pfNewRuledSurface();
	  buf_pos++; /* ZZZ Alex -- BAD BAD BAD .. don't understand
			why we have to skip one value here ... */

	  pfb_read_parasurface(glb,(pfParaSurface *)node, &buf_pos);
	  {
	    int curve1_id, curve2_id;
	    pfCurve3d *c1 = NULL, *c2 = NULL;
	    pfRuledSurface *ruled = (pfRuledSurface *)node;

	    curve1_id = buf[buf_pos++];
	    curve2_id = buf[buf_pos++];

	    if(curve1_id > -1) c1 = glb->rl_list[L_NODE][curve1_id];
	    if(curve2_id > -1) c2 = glb->rl_list[L_NODE][curve2_id];

 	    if(c1) pfRuledSurfaceCurve1(ruled, c1);
 	    if(c2) pfRuledSurfaceCurve2(ruled, c2);
	  }
	  count = buf[buf_pos++];
	  break;

        case N_LINE3D:
        case N_ORIENTEDLINE3D:
	  if(node == NULL)
	    if(node_type == N_LINE3D)
	      node = pfNewLine3d();
	    else
	      node = pfNewOrientedLine3d();

	  buf_pos++; /* ZZZ Alex */
	  pfb_read_curve3d(glb,(pfCurve3d *)node, &buf_pos);
	  {
	    pfReal x, y, z, t;

	    x = ((float *)buf)[buf_pos++];
	    y = ((float *)buf)[buf_pos++];
	    z = ((float *)buf)[buf_pos++];
	    t = ((float *)buf)[buf_pos++];
	    pfLine3dPoint1((pfLine3d *)node, x, y, z, t);

	    x = ((float *)buf)[buf_pos++];
	    y = ((float *)buf)[buf_pos++];
	    z = ((float *)buf)[buf_pos++];
	    t = ((float *)buf)[buf_pos++];
	    pfLine3dPoint2((pfLine3d *)node, x, y, z, t);

	    if(node_type == N_ORIENTEDLINE3D) {
	      x = ((float *)buf)[buf_pos++];
	      y = ((float *)buf)[buf_pos++];
	      z = ((float *)buf)[buf_pos++];
	      pfOrientedLine3dUpPoint((pfOrientedLine3d *)node,
				      x, y, z);
	    }

	  }
	  count = buf[buf_pos++];
	  break;

        case N_CIRCLE3D:
	  if(node == NULL)
	    node = pfNewCircle3d();

	  buf_pos++; /* ZZZ Alex */
	  pfb_read_curve3d(glb,(pfCurve3d *)node, &buf_pos);
	  {
	    pfReal radius;

	    radius = ((float *)buf)[buf_pos++];
	    pfCircle3dRadius((pfCircle3d *)node, radius);
	  }
	  count = buf[buf_pos++];
	  break;

        case N_SUPERQUADCURVE3D:
	  if(node == NULL)
	    node = pfNewSuperQuadCurve3d();

	  buf_pos++; /* ZZZ Alex */
	  pfb_read_curve3d(glb,(pfCurve3d *)node, &buf_pos);
	  {
	    pfReal radius, exponent;

	    radius = ((float *)buf)[buf_pos++];
	    exponent = ((float *)buf)[buf_pos++];
	    pfSuperQuadCurve3dRadius((pfSuperQuadCurve3d *)node, radius);
	    pfSuperQuadCurve3dExponent((pfSuperQuadCurve3d *)node, exponent);
	  }
	  count = buf[buf_pos++];
	  break;

        case N_COMPOSITE_CURVE3D:
	  if(node == NULL)
	    node = pfNewCompCurve3d();
	  buf_pos++;
	  pfb_read_curve3d(glb,(pfCurve3d *)node, &buf_pos);
	  {
	    int surfId = -1, curveId = -1;
	    pfParaSurface *surface = NULL;
	    pfCurve2d     *curve   = NULL;

	    surfId = buf[buf_pos++];
	    curveId = buf[buf_pos++];

	    if(surfId  > -1) surface = glb->rl_list[L_NODE][surfId];
	    if(curveId > -1) curve   = glb->rl_list[L_CURVE2D][curveId]; /* XXX Alex -- look in L_NODE instead?*/

	    pfCompCurve3dSet((pfCompositeCurve3d *)node, surface, curve);
	  }
	  count = buf[buf_pos++];
	  break;

        case N_NURB_CURVE3D:
	    if(node == NULL)
	      node = pfNewNurbCurve3d();
	    buf_pos++;
	    pfb_read_curve3d(glb, (pfCurve3d *)node, &buf_pos);
	    {
	      pfRVec4 vec;
	      int nn, ii;
	      pfNurbCurve3d *nc = (pfNurbCurve3d *)node;
              pfReal beginT, endT;

	      beginT = pfGetCurve3dBeginT((pfCurve3d *)nc);
              endT   = pfGetCurve3dEndT  ((pfCurve3d *)nc);

	      nn = buf[buf_pos++];
	      if(nn > 0) {
		for(ii=0; ii<nn; ii++) {
		  vec[0] =  ((float *)buf)[buf_pos++];
		  vec[1] =  ((float *)buf)[buf_pos++];
		  vec[2] =  ((float *)buf)[buf_pos++];
		  vec[3] =  ((float *)buf)[buf_pos++];
		  pfNurbCurve3dControlHull((pfNurbCurve3d *)nc, ii, vec);
		}
	      }

	      nn = buf[buf_pos++];
	      if(nn > 0) {
		for(ii=0; ii<nn; ii++)
		  pfNurbCurve3dKnot((pfNurbCurve3d *)nc, ii,
				    ((float *)buf)[buf_pos++]);
	      }

	      pfCurve3dBeginT((pfCurve3d *)nc, beginT);
	      pfCurve3dEndT  ((pfCurve3d *)nc, endT);
	    }
	    count = buf[buf_pos++];
	    break;

	case N_BILLBOARD:
        case N_IBR_NODE:
	    if (node == NULL)
		if (node_type == N_IBR_NODE)
		    node = pfNewIBRnode();
		else
		    node = pfNewBboard();
	    count = buf[buf_pos++];
	    if (count == BB_POS_FLUX)
	    {
		pfBboardPosFlux((pfBillboard *)node,
				(pfFlux*)glb->rl_list[L_FLUX][buf[buf_pos++]]);
	    }
	    else
	    {
		for (i = 0; i < count; i++)
		{
		    v1[0] = ((float *)buf)[buf_pos++];
		    v1[1] = ((float *)buf)[buf_pos++];
		    v1[2] = ((float *)buf)[buf_pos++];
		    pfBboardPos((pfBillboard *)node, i, v1);
		}
	    }
	    pfBboardMode((pfBillboard *)node, PFBB_ROT,
			 bbr_table[buf[buf_pos++]]);
	    v1[0] = ((float *)buf)[buf_pos++];
	    v1[1] = ((float *)buf)[buf_pos++];
	    v1[2] = ((float *)buf)[buf_pos++];
	    pfBboardAxis((pfBillboard *)node, v1);
	    if (node_type == N_IBR_NODE)
	    {
		float a1, a2;
		int n, j;
		pfIBRtexture *IBRtex;

		IBRtex = glb->rl_list[L_IBR_TEX][buf[buf_pos++]];
		pfIBRnodeIBRtexture((pfIBRnode *)node, IBRtex);


		n = buf[buf_pos++];

		for(i=0; i<n; i++)
		{
		    a1 = ((float *)buf)[buf_pos++];
		    a2 = ((float *)buf)[buf_pos++];
		    pfIBRnodeAngles((pfIBRnode *)node, i, a1, a2);
		}

		if (glb->version >= PFBV_VERSION2_6)
		{
		  n = buf[buf_pos++];

		  pfIBRnodeFlags((pfIBRnode *)node, 0xffffffff, 0); /* set all to 0 */
		  pfIBRnodeFlags((pfIBRnode *)node, n, 1); /* set those that are set in 'n' */

		  if(pfGetIBRtextureFlags(IBRtex, PFIBR_USE_PROXY) ||
		     (n & PFIBRN_TEXCOORDS_DEFINED))
		  {
		    int       count, numGroups, viewsPerGroup;
		    int       t, v;
		    pfVec2    ***texCoords;

		    /* printf("reading proxy tex coords\n"); */

		    /* read the proxy texture coordinates */

		    /* read the number of geosets and the number of textures
		     */
		    count = buf[buf_pos++];
		    numGroups = buf[buf_pos++];
		    viewsPerGroup = buf[buf_pos++];

		    texCoords = (pfVec2 ***)pfMalloc(sizeof(pfVec2**) *
						     numGroups,
						     pfGetSharedArena());

		    /* for each view or groups of views */
		    for(t=0; t<numGroups; t++)
		    {
		      texCoords[t] =
			  (pfVec2 **)pfMalloc(sizeof(pfVec2*) *
					      count * viewsPerGroup,
					      pfGetSharedArena());
		      /* for each geoset */
		      for(i=0; i<count; i++)
		      {

			/* read the number of vertices in each geoset */
			/* determine the number of vertices */
			n = buf[buf_pos++];

			for(j=0; j<viewsPerGroup; j++)
			{
			    if(n == 0)
			    {
				texCoords[t][i*viewsPerGroup + j] = 0;
				continue;
			    }

			    texCoords[t][i*viewsPerGroup + j] =
				(pfVec2 *)pfMalloc(sizeof(pfVec2) * n,
						   pfGetSharedArena());

			    for(v=0; v<n; v++)
			    {
				texCoords[t][i*viewsPerGroup + j][v][0] = ((float *)buf)[buf_pos++];
				texCoords[t][i*viewsPerGroup + j][v][1] = ((float *)buf)[buf_pos++];
			    }
			}
		      }
		    }

		    /* set proxy coordinates */
		    pfIBRnodeProxyTexCoords((pfIBRnode *)node, texCoords);
		  }
		}
	    }
	    break;
	case N_LIGHTSOURCE:
	    node = glb->rl_list[L_LSOURCE][buf[buf_pos++]];
	    break;
	case N_GROUP:
	    if (node == NULL)
		node = pfNewGroup();
	    break;
	case N_SCS:
	case N_DCS:
	    {
		pfMatrix m;
		uint m_type;

		if (node_type == N_DCS)
		{
		    m_type = ((uint *)buf)[buf_pos++];
		    if (m_type == CS_UNCONSTRAINED)
			m_type = PFDCS_UNCONSTRAINED;
		    else
			m_type = from_table(mat_table, m_type);
		}

		m[0][0] = ((float *)buf)[buf_pos++];
		m[0][1] = ((float *)buf)[buf_pos++];
		m[0][2] = ((float *)buf)[buf_pos++];
		m[0][3] = ((float *)buf)[buf_pos++];
		m[1][0] = ((float *)buf)[buf_pos++];
		m[1][1] = ((float *)buf)[buf_pos++];
		m[1][2] = ((float *)buf)[buf_pos++];
		m[1][3] = ((float *)buf)[buf_pos++];
		m[2][0] = ((float *)buf)[buf_pos++];
		m[2][1] = ((float *)buf)[buf_pos++];
		m[2][2] = ((float *)buf)[buf_pos++];
		m[2][3] = ((float *)buf)[buf_pos++];
		m[3][0] = ((float *)buf)[buf_pos++];
		m[3][1] = ((float *)buf)[buf_pos++];
		m[3][2] = ((float *)buf)[buf_pos++];
		m[3][3] = ((float *)buf)[buf_pos++];

		if (node_type == N_SCS)
		    node = pfNewSCS(m);
		else
		{
		    if (node == NULL)
			node = pfNewDCS();
		    pfDCSMat((pfDCS *)node, m);
		    pfDCSMatType((pfDCS *)node, m_type);
		}
	    }
	    break;
	case N_FCS:
	    {
		int flux_id;
		uint m_type;

		flux_id = buf[buf_pos++];
		m_type = ((uint *)buf)[buf_pos++];
		if (m_type == CS_UNCONSTRAINED)
		    m_type = PFFCS_UNCONSTRAINED;
		else
		    m_type = from_table(mat_table, m_type);

		if (node == NULL)
		    node = pfNewFCS(glb->rl_list[L_FLUX][flux_id]);
		pfFCSMatType((pfFCS *)node, m_type);
	    }
	    break;
	case N_DOUBLE_SCS:
	case N_DOUBLE_DCS:
	    {
		pfMatrix4d m;
		double	dbuff[16];
		int	dbuff_index;
		uint m_type;

		if (node_type == N_DOUBLE_DCS)
		{
		    m_type = ((uint *)buf)[buf_pos++];
		    if (m_type == CS_UNCONSTRAINED)
			m_type = PFDCS_UNCONSTRAINED;
		    else
			m_type = from_table(mat_table, m_type);
		}

		/*
		 *	Must memcpy to temp buffer because buf[buf_pos] may
		 *	not be on a double-word boundary.
	 	 */
		memcpy (dbuff, & buf[buf_pos], 16 * sizeof (double));
		buf_pos += 32; /* 16 double-words */

		dbuff_index = 0;
		m[0][0] = dbuff[dbuff_index ++];
		m[0][1] = dbuff[dbuff_index ++];
		m[0][2] = dbuff[dbuff_index ++];
		m[0][3] = dbuff[dbuff_index ++];
		m[1][0] = dbuff[dbuff_index ++];
		m[1][1] = dbuff[dbuff_index ++];
		m[1][2] = dbuff[dbuff_index ++];
		m[1][3] = dbuff[dbuff_index ++];
		m[2][0] = dbuff[dbuff_index ++];
		m[2][1] = dbuff[dbuff_index ++];
		m[2][2] = dbuff[dbuff_index ++];
		m[2][3] = dbuff[dbuff_index ++];
		m[3][0] = dbuff[dbuff_index ++];
		m[3][1] = dbuff[dbuff_index ++];
		m[3][2] = dbuff[dbuff_index ++];
		m[3][3] = dbuff[dbuff_index ++];

		if (node_type == N_DOUBLE_SCS)
		    node = pfNewDoubleSCS(m);
		else
		{
		    if (node == NULL)
			node = pfNewDoubleDCS();
		    pfDoubleDCSMat((pfDoubleDCS *)node, m);
		    pfDoubleDCSMatType((pfDoubleDCS *)node, m_type);
		}
	    }
	    break;
	case N_DOUBLE_FCS:
	    {
		int flux_id;
		uint m_type;

		flux_id = buf[buf_pos++];
		m_type = ((uint *)buf)[buf_pos++];
		if (m_type == CS_UNCONSTRAINED)
		    m_type = PFFCS_UNCONSTRAINED;
		else
		    m_type = from_table(mat_table, m_type);

		if (node == NULL)
		    node = pfNewDoubleFCS(glb->rl_list[L_FLUX][flux_id]);
		pfDoubleFCSMatType((pfDoubleFCS *)node, m_type);
	    }
	    break;
	case N_PARTITION:
	    if (node == NULL)
		node = pfNewPart();
	    if (buf[buf_pos++])
	    {
		v1[0] = ((float *)buf)[buf_pos++];
		v1[1] = ((float *)buf)[buf_pos++];
		v1[2] = ((float *)buf)[buf_pos++];
		pfPartAttr((pfPartition *)node, PFPART_MIN_SPACING, v1);
	    }
	    if (buf[buf_pos++])
	    {
		v1[0] = ((float *)buf)[buf_pos++];
		v1[1] = ((float *)buf)[buf_pos++];
		v1[2] = ((float *)buf)[buf_pos++];
		pfPartAttr((pfPartition *)node, PFPART_MAX_SPACING, v1);
	    }
	    if (buf[buf_pos++])
	    {
		v1[0] = ((float *)buf)[buf_pos++];
		v1[1] = ((float *)buf)[buf_pos++];
		v1[2] = ((float *)buf)[buf_pos++];
		pfPartAttr((pfPartition *)node, PFPART_ORIGIN, v1);
	    }
	    pfPartVal((pfPartition *)node, PFPART_FINENESS,
		      ((float *)buf)[buf_pos++]);
	    break;
	case N_SCENE:
	    if (node == NULL)
		node = pfNewScene();
	    t1 = buf[buf_pos++];
	    t2 = buf[buf_pos++];
	    if (t1 != -1)
		pfSceneGState((pfScene *)node, glb->rl_list[L_GSTATE][t1]);
	    if (t2 != -1)
		pfSceneGStateIndex((pfScene *)node, t2);
	    break;
	case N_SWITCH:
	    if (node == NULL)
		node = pfNewSwitch();
	    t1 = buf[buf_pos++];
	    if (t1 == PFB_SWITCH_OFF)
		pfSwitchVal((pfSwitch*)node, PFSWITCH_OFF);
	    else if (t1 == PFB_SWITCH_ON)
		pfSwitchVal((pfSwitch*)node, PFSWITCH_ON);
	    else
		pfSwitchVal((pfSwitch*)node, t1);
	    if (glb->version >= PFBV_SWITCH_VAL_FLUX)
	    {
		t1 = buf[buf_pos++];
		if (t1 != -1)
		    pfSwitchValFlux((pfSwitch*)node, glb->rl_list[L_FLUX][t1]);
	    }
	    break;
	case N_LOD:
	    if (node == NULL)
		node = pfNewLOD();
	    count = buf[buf_pos++];
	    for (i = 0; i <= count; i++)
		pfLODRange((pfLOD *)node, i, ((float *)buf)[buf_pos++]);
	    for (i = 0; i <= count; i++)
		pfLODTransition((pfLOD *)node, i, ((float *)buf)[buf_pos++]);
	    v1[0] = ((float *)buf)[buf_pos++];
	    v1[1] = ((float *)buf)[buf_pos++];
	    v1[2] = ((float *)buf)[buf_pos++];
	    pfLODCenter((pfLOD *)node, v1);
	    t1 = buf[buf_pos++];
	    t2 = buf[buf_pos++];
	    if (t1 != -1)
		pfLODLODState((pfLOD *)node, glb->rl_list[L_LODSTATE][t1]);
	    if (t2 != -1)
		pfLODLODStateIndex((pfLOD *)node, t2);
	    break;
	case N_SEQUENCE:
	    if (node == NULL)
		node = pfNewSeq();
	    count = buf[buf_pos++];
	    for (i = 0; i < count; i++)
		pfSeqTime((pfSequence *)node, i, ((float *)buf)[buf_pos++]);
	    t1 = buf[buf_pos++];
	    t2 = buf[buf_pos++];
	    t3 = buf[buf_pos++];
	    pfSeqInterval((pfSequence *)node, sqi_table[t1], t2, t3);
	    f1 = ((float *)buf)[buf_pos++];
	    t1 = buf[buf_pos++];
	    pfSeqDuration((pfSequence *)node, f1, t1);
	    pfSeqMode((pfSequence *)node, sqm_table[buf[buf_pos++]]);
	    break;
	case N_LAYER:
	    if (node == NULL)
		node = pfNewLayer();
	    t1 = buf[buf_pos++];
	    t2 = buf[buf_pos++];
	    t3 = buf[buf_pos++];
	    pfLayerMode((pfLayer *)node,
			layer_table[t1] |
			(t2 << PFDECAL_LAYER_SHIFT) |
			(t3 ? PFDECAL_LAYER_OFFSET : 0));
	    break;
	case N_MORPH:
	    node = glb->rl_list[L_MORPH][buf[buf_pos++]];
	    break;
	case N_ASD:
	    {
		int bind, size, which, attr_type, attr;
        int loop;
        int inner;
        /* blocksize assumed to be of floats */
        int blockSize = 0;
        asd_face_t *tmpFace;
        asd_lodrange_t *tmpRange;
        asd_vert_t *tmpVert;
        float *tmpAttr;

        printf ("Reading an ASD\n");

		if (node == NULL)
		    node = pfNewASD();

		bind = buf[buf_pos++];
		size = buf[buf_pos++];
		attr = buf[buf_pos++];
        if (r_swap)
        for (loop=0; loop < size; loop++)
        {
            tmpRange = (asd_lodrange_t *) &((pfASDLODRange*)glb->rl_list[L_ASDDATA][attr])[loop];
            P_32_SWAP(&tmpRange->switchin);
            P_32_SWAP(&tmpRange->morph);
        }
		if (attr != -1)
		    pfASDAttr((pfASD *)node, PFASD_LODS, bind, size,
			      glb->rl_list[L_ASDDATA][attr]);

		bind = buf[buf_pos++];
		size = buf[buf_pos++];
		attr = buf[buf_pos++];
        if (r_swap)
        for (loop=0; loop < size; loop++)
        {
            tmpVert = (asd_vert_t*) &((pfASDVert*)glb->rl_list[L_ASDDATA][attr])[loop];
            P_32_SWAP(&tmpVert->v0[0]);
            P_32_SWAP(&tmpVert->v0[1]);
            P_32_SWAP(&tmpVert->v0[2]);
            P_32_SWAP(&tmpVert->vd[0]);
            P_32_SWAP(&tmpVert->vd[1]);
            P_32_SWAP(&tmpVert->vd[2]);
            P_32_SWAP(&tmpVert->neighborid[0]);
            P_32_SWAP(&tmpVert->neighborid[1]);
            P_32_SWAP(&tmpVert->vertid);
        }
		if (attr != -1)
		    pfASDAttr((pfASD *)node, PFASD_COORDS, bind, size,
			      glb->rl_list[L_ASDDATA][attr]);

		bind = buf[buf_pos++];
		size = buf[buf_pos++];
		attr = buf[buf_pos++];
        if ((attr != -1) && (r_swap))
            for (loop=0; loop < size; loop++)
            {
                tmpFace = (asd_face_t*) &((pfASDFace*)glb->rl_list[L_ASDDATA][attr])[loop];

                /* int fields */
                P_32_SWAP(&tmpFace->level);
                P_32_SWAP(&tmpFace->tsid);
                P_32_SWAP(&tmpFace->vert[0]);
                P_32_SWAP(&tmpFace->vert[1]);
                P_32_SWAP(&tmpFace->vert[2]);
                P_32_SWAP(&tmpFace->attr[0]);
                P_32_SWAP(&tmpFace->attr[1]);
                P_32_SWAP(&tmpFace->attr[2]);
                P_32_SWAP(&tmpFace->refvert[0]);
                P_32_SWAP(&tmpFace->refvert[1]);
                P_32_SWAP(&tmpFace->refvert[2]);
                P_32_SWAP(&tmpFace->sattr[0]);
                P_32_SWAP(&tmpFace->sattr[1]);
                P_32_SWAP(&tmpFace->sattr[2]);
                P_32_SWAP(&tmpFace->child[0]);
                P_32_SWAP(&tmpFace->child[1]);
                P_32_SWAP(&tmpFace->child[2]);
                P_32_SWAP(&tmpFace->child[3]);
                /* ushort fields */
                P_16_SWAP(&tmpFace->gstateid);
                P_16_SWAP(&tmpFace->mask);
            }
		if (attr != -1)
		    pfASDAttr((pfASD *)node, PFASD_FACES, bind, size,
			      glb->rl_list[L_ASDDATA][attr]);

		attr_type = buf[buf_pos++];
		size = buf[buf_pos++];
		attr = buf[buf_pos++];
		if (attr != -1)
		{
		    which = 0;
		    if (attr_type & ASD_ATTR_NORMALS)
            {
			    which |= PFASD_NORMALS;
                blockSize += 6;
            }
		    if (attr_type & ASD_ATTR_COLORS)
            {
			    which |= PFASD_COLORS;
                blockSize += 8;
            }
		    if (attr_type & ASD_ATTR_TCOORDS)
            {
			    which |= PFASD_TCOORDS;
                blockSize += 4;
            }
            if (r_swap)
            {
                tmpAttr = (float*)glb->rl_list[L_ASDDATA][attr];
                for (loop=0; loop < size; loop++)
                    for (inner=0; inner < blockSize; inner++)
                    {
                        P_32_SWAP(tmpAttr);
                        tmpAttr++;
                    }
            }
		    pfASDAttr((pfASD *)node, PFASD_OVERALL_ATTR, which, size,
			      glb->rl_list[L_ASDDATA][attr]);
		}

		attr_type = buf[buf_pos++];
		size = buf[buf_pos++];
		attr = buf[buf_pos++];
		if (attr != -1)
		{
		    which = 0;
            blockSize = 0;
		    if (attr_type & ASD_ATTR_NORMALS)
            {
                blockSize += 6;
			    which |= PFASD_NORMALS;
            }
		    if (attr_type & ASD_ATTR_COLORS)
            {
			    which |= PFASD_COLORS;
                blockSize += 8;
            }
		    if (attr_type & ASD_ATTR_TCOORDS)
            {
			    which |= PFASD_TCOORDS;
                blockSize += 4;
            }
            if (r_swap)
            {
                tmpAttr = (float*)glb->rl_list[L_ASDDATA][attr];
                for (loop=0; loop < size; loop++)
                    for (inner=0; inner < blockSize; inner++)
                    {
                        P_32_SWAP(tmpAttr);
                        tmpAttr++;
                    }
            }
		    pfASDAttr((pfASD *)node, PFASD_PER_VERTEX_ATTR, which, size,
			      glb->rl_list[L_ASDDATA][attr]);
		}

		pfASDNumBaseFaces((pfASD *)node, buf[buf_pos++]);
		t1 = buf[buf_pos++];
		t2 = 0;
		if (t1 != -1)
		{
		    if (t1 & ASD_ATTR_NORMALS)
			t2 |= PFASD_NORMALS;
		    if (t1 & ASD_ATTR_COLORS)
			t2 |= PFASD_COLORS;
		    if (t1 & ASD_ATTR_TCOORDS)
			t2 |= PFASD_TCOORDS;
		}
		pfASDMorphAttrs((pfASD *)node, t2);
		if (glb->version >= PFBV_ASD_GSTATES)
		{
		    count = buf[buf_pos++];
		    if (count > 0)
		    {
			pfGeoState **gsa = (pfGeoState**)
					    malloc(sizeof(pfGeoState*) * count);
			for (i = 0; i < count; i++)
			{
			    if ((t1 = buf[buf_pos++]) != -1)
				gsa[i] = glb->rl_list[L_GSTATE][t1];
			    else
				gsa[i] = NULL;
			}
			pfASDGStates((pfASD*)node, gsa, count);
			free(gsa);
		    }
		}
		else
		{
		    if ((t1 = buf[buf_pos++]) != -1)
		    {
			pfGeoState **gsa = (pfGeoState**)
					    malloc(sizeof(pfGeoState*));
			*gsa = glb->rl_list[L_GSTATE][t1];
			pfASDGStates((pfASD*)node, gsa, 1);
			free(gsa);
		    }
		}
/* XXXX probably should add morphweightconstraint to buf */
		pfASDMaxMorphDepth((pfASD *)node, buf[buf_pos++], 0);
		pfASDEvalMethod((pfASD *)node, asd_em_table[buf[buf_pos++]]);
		if ((t1 = buf[buf_pos++]) != -1)
		    pfASDEvalFunc((pfASD *)node, glb->rl_list[L_UFUNC][t1]);
#if 0
		if (glb->version >= PFBV_ASD_SYNC_GROUP)
		{
		    t1 = buf[buf_pos++];
		    pfASDSyncGroup((pfASD *)node,
				   *(uint*)&glb->rl_list[L_SG_NAME][t1]);
		}
#endif
	   	{
                    char *e = getenv("_PFASD_CLIPRINGS");
                    int _PFASD_CLIPRINGS = (e ? *e ? atoi(e) : -1 : 0);
pfNotify(PFNFY_INTERNAL_DEBUG, PFNFY_PRINT, "_PFASD_CLIPRINGS %d", _PFASD_CLIPRINGS);
                    if(_PFASD_CLIPRINGS)
                        pfdASDClipring(node, _PFASD_CLIPRINGS);
                }

		pfASDConfig((pfASD *)node);
        /* pfPrint((pfASD*)node, NULL, PFPRINT_VB_DEBUG, NULL); */
	    }
	    break;
    }

    if (pfIsOfType(node, pfGetGroupClassType()))
    {
	count = buf[buf_pos++];
	glb->children[node_num] = (int *)malloc((count+1) * sizeof(int));
	glb->children[node_num][0] = count;
	for (i = 1; i <= count; i++)
	    glb->children[node_num][i] = buf[buf_pos++];
    }
    else if (pfIsOfType(node, pfGetGeodeClassType()))
    {
	for (i = 0; i < count; i++){
	    if(glb->version >= PFBV_GEOARRAY){	/* Check hack for geoArray */
		int t = buf[buf_pos++];
	        pfAddGSet((pfGeode *)node,
		          (t & PFB_GARRAY_IXBIT ?
			   glb->rl_list[L_GARRAY][t ^ PFB_GARRAY_IXBIT]:
			   glb->rl_list[L_GSET][t]));
	    } else {
		pfAddGSet((pfGeode *)node, glb->rl_list[L_GSET][buf[buf_pos++]]);
	    }
	}
    }

    pfNodeTravMask(node, PFTRAV_ISECT, ((uint *)buf)[buf_pos++],
		   PFTRAV_SELF, PF_SET);
    pfNodeTravMask(node, PFTRAV_APP, ((uint *)buf)[buf_pos++],
		   PFTRAV_SELF, PF_SET);
    pfNodeTravMask(node, PFTRAV_CULL, ((uint *)buf)[buf_pos++],
		   PFTRAV_SELF, PF_SET);
    pfNodeTravMask(node, PFTRAV_DRAW, ((uint *)buf)[buf_pos++],
		   PFTRAV_SELF, PF_SET);

    if (glb->version >= PFBV_UFUNC)
    {
	if (buf[buf_pos++] == 1)
	{
	    /*
	     *  has trav funcs and/or trav data
	     */
	    void *pre, *post;

	    if ((t1 = buf[buf_pos++]) != -1)
		pre = glb->rl_list[L_UFUNC][t1];
	    else
		pre = NULL;
	    if ((t1 = buf[buf_pos++]) != -1)
		post = glb->rl_list[L_UFUNC][t1];
	    else
		post = NULL;
	    if (pre || post)
		pfNodeTravFuncs(node, PFTRAV_APP, pre, post);
	    if ((t1 = buf[buf_pos++]) != -1)
		set_trav_data(node, PFTRAV_APP, t1, glb);

	    if ((t1 = buf[buf_pos++]) != -1)
		pre = glb->rl_list[L_UFUNC][t1];
	    else
		pre = NULL;
	    if ((t1 = buf[buf_pos++]) != -1)
		post = glb->rl_list[L_UFUNC][t1];
	    else
		post = NULL;
	    if (pre || post)
		pfNodeTravFuncs(node, PFTRAV_CULL, pre, post);
	    if ((t1 = buf[buf_pos++]) != -1)
		set_trav_data(node, PFTRAV_CULL, t1, glb);

	    if ((t1 = buf[buf_pos++]) != -1)
		pre = glb->rl_list[L_UFUNC][t1];
	    else
		pre = NULL;
	    if ((t1 = buf[buf_pos++]) != -1)
		post = glb->rl_list[L_UFUNC][t1];
	    else
		post = NULL;
	    if (pre || post)
		pfNodeTravFuncs(node, PFTRAV_DRAW, pre, post);
	    if ((t1 = buf[buf_pos++]) != -1)
		set_trav_data(node, PFTRAV_DRAW, t1, glb);

	    if ((t1 = buf[buf_pos++]) != -1)
		pre = glb->rl_list[L_UFUNC][t1];
	    else
		pre = NULL;
	    if ((t1 = buf[buf_pos++]) != -1)
		post = glb->rl_list[L_UFUNC][t1];
	    else
		post = NULL;
	    if (pre || post)
		pfNodeTravFuncs(node, PFTRAV_ISECT, pre, post);
	    if ((t1 = buf[buf_pos++]) != -1)
		set_trav_data(node, PFTRAV_ISECT, t1, glb);
	}
    }

    if ((i = buf[buf_pos++]) != -1)
	set_udata((pfObject *)node, i, glb);

    if (glb->version >= PFBV_NODE_BSPHERE)
    {
	if ((t1 = bound_table[buf[buf_pos++]]) != PFBOUND_DYNAMIC)
	{
	    pfSphere sphere;

	    sphere.center[0] = ((float *)buf)[buf_pos++];
	    sphere.center[1] = ((float *)buf)[buf_pos++];
	    sphere.center[2] = ((float *)buf)[buf_pos++];
	    sphere.radius = ((float *)buf)[buf_pos++];
	    pfNodeBSphere(node, &sphere, t1);
	}
    }

    if (glb->version >= PFBV_SHADER)
    {
      /* add this node to the list of nodes that have
       * shaders applied to them if necessary.
       */
      int numShadersApplied = buf[buf_pos++];

      /* add to list of nodes that have shaders applied to them */
      /*for(i=0; i<numShadersApplied; i++) {
	shaderID = buf[buf_pos++];
	shadedNodeListAdd(node, shaderID ,glb);
	}
      */

      buf_pos += numShadersApplied;
    }

    pfb_fread(&buf_size, sizeof(int), 1, glb->ifp);
    if (buf_size != -1)
    {
	char name[PF_MAXSTRING];

	pfb_fread(name, 1, buf_size, glb->ifp);
	name[buf_size] = '\0';
	pfNodeName(node, name);
    }

    if (custom_id != -1)
    {
	int size;

	pfb_fread(&size, sizeof(int), 1, glb->ifp);
	if (custom)
	{
	    int start;

	    start = (int)pfbFileReadFunction.ftell(glb->ifp);

	    glb->data_total = 0;
	    custom->load_func(node, glb);

	    if (glb->data_total != size)
	    {
		/*
		 *  The wrong amount of data was loaded by the users function.
		 */
		pfNotify(PFNFY_WARN, PFNFY_PRINT,
			 "%s  Custom node load function failed.\n",
			 "pfdLoadFile_pfb:");
		pfNotify(PFNFY_WARN, PFNFY_PRINT,
			 "%s  Loaded %d bytes of data.\n",
			 "pfdLoadFile_pfb:", glb->data_total);
		pfNotify(PFNFY_WARN, PFNFY_PRINT,
			 "%s  Should have loaded %d bytes of data.\n",
			 "pfdLoadFile_pfb:", size);
		pfbFileReadFunction.fseek(glb->ifp, start + size, SEEK_SET);
	    }
	}
	else
	{
	    pfbFileReadFunction.fseek(glb->ifp, size, SEEK_CUR);
	    pfNotify(PFNFY_WARN, PFNFY_PRINT,
		     "%s Unable to load custom node.", "pfdLoadFile_pfb: ");
	}
    }

    return(node);
}


PFPFB_DLLEXPORT int pfdStoreFile_pfb(pfNode *root, const char *fileName)
{
    int i;
    pfa_global_t *glb;
    int buf[4];

    glb = (pfa_global_t *)malloc(sizeof(pfa_global_t));
    bzero(glb, sizeof(pfa_global_t));

    glb->maxTextures = PF_MAX_TEXTURES_31; /* which is == 8 */

    /*
     *  open the output file for writing
     */
    if ((glb->ofp = fopen(fileName, "wb")) == NULL)
    {
	pfNotify(PFNFY_WARN, PFNFY_RESOURCE,
		 "pfdStoreFile_pfb:  Could not open \"%s\" for writing\n",
		 fileName);
	free(glb);
	return(FALSE);
    }

    if (crypt_key_pfb != NULL)
    {
	i = (int)(crypt_key_pfb[0] * sizeof(uint) + sizeof(uint));
	glb->crypt_key = (uint *)malloc(i);
	bcopy(crypt_key_pfb, glb->crypt_key, i);
	glb->encrypt_func = encrypt_func_pfb;
    }

    if (glb->crypt_key)
	pfNotify(PFNFY_NOTICE, PFNFY_PRINT,
		 "pfdStoreFile_pfb: Storing ENCRYPTED \"%s\"", fileName);
    else
	pfNotify(PFNFY_NOTICE, PFNFY_PRINT,
		 "pfdStoreFile_pfb: Storing \"%s\"", fileName);

    glb->save_texture_image = save_texture_image;
    glb->save_texture_path = save_texture_path;
    glb->save_texture_pfi = save_texture_pfi;
    glb->disable_rep_save = disable_rep_save;
    glb->subdivsurface_save_geosets = subdivsurface_save_geosets;
    glb->num_udata_slots = pfGetNumNamedUserDataSlots();
    glb->udfunc = copy_udfunc(udfunc_pfb);
    if (glb->num_custom_nodes = num_custom_nodes_pfb)
    {
	glb->custom_nodes = (custom_node_t *)malloc(num_custom_nodes_pfb *
						    sizeof(custom_node_t));
	bcopy(custom_nodes_pfb, glb->custom_nodes,
	      num_custom_nodes_pfb * sizeof(custom_node_t));
	for (i = 0; i < num_custom_nodes_pfb; i++)
	    glb->custom_nodes[i].name = strdup(custom_nodes_pfb[i].name);
    }
    set_buf_size(512, glb);

    /*
     *  Count the number of, and make lists of pfGeoStates, pfGeoSets, and
     *  pfNodes.
     */
    descend_node(root, glb);
    really_descend_morphs(glb);
    really_descend_unknown_datas(glb);

    /*
     *  write header
     */
	if (glb->crypt_key)
		buf[0] = PFB_MAGIC_ENCODED;
    else
		buf[0] = PFB_MAGIC_NUMBER;
    buf[1] = PFB_VERSION_NUMBER;
    buf[2] = 1;
    buf[3] = sizeof(int) * 4;
    fwrite(buf, sizeof(int), 4, glb->ofp);

    /*
     *  write lists
     */
    PFB_WRITE_LIST(L_UFUNC, pfb_write_ufunc);
    pfb_write_custom_list(glb);
    PFB_WRITE_LIST(L_SG_NAME, pfb_write_sg_name);
    if (glb->max_udata_slot > 1)
    {
	PFB_WRITE_LIST(L_UDATA_NAME, pfb_write_udata_name);
	PFB_WRITE_LIST(L_UDATA_LIST, pfb_write_udata_list);
    }
    PFB_WRITE_LIST(L_UDATA, pfb_write_udata);
    PFB_WRITE_LIST(L_FLUX, pfb_write_flux);
    PFB_WRITE_SLIST(L_LLIST, pfb_write_llist);
    PFB_WRITE_SLIST(L_VLIST, pfb_write_vlist);
    PFB_WRITE_SLIST(L_CLIST, pfb_write_clist);
    PFB_WRITE_SLIST(L_NLIST, pfb_write_nlist);
    PFB_WRITE_SLIST(L_TLIST, pfb_write_tlist);
    PFB_WRITE_SLIST(L_ILIST, pfb_write_ilist);
    PFB_WRITE_SLIST(L_FLIST, pfb_write_flist);
    PFB_WRITE_LIST(L_ENGINE, pfb_write_engine);
    PFB_WRITE_SLIST(L_IMAGE, pfb_write_image);
    PFB_WRITE_LIST(L_QUEUE, pfb_write_queue);
    PFB_WRITE_LIST(L_ITILE, pfb_write_itile);
    PFB_WRITE_LIST(L_ICACHE, pfb_write_icache);
    PFB_WRITE_LIST(L_MTL, pfb_write_mtl);
    PFB_WRITE_LIST(L_LMODEL, pfb_write_lmodel);
    PFB_WRITE_LIST(L_LIGHT, pfb_write_light);
    PFB_WRITE_LIST(L_TLOD, pfb_write_tlod);
    PFB_WRITE_LIST(L_GPROG, pfb_write_gprogram);
    PFB_WRITE_LIST(L_GPROGPARM, pfb_write_gprogramparms);
    PFB_WRITE_LIST(L_TEX, pfb_write_tex);
    PFB_WRITE_LIST(L_IBR_TEX, pfb_write_ibr_tex);
    PFB_WRITE_LIST(L_TENV, pfb_write_tenv);
    PFB_WRITE_LIST(L_TGEN, pfb_write_tgen);
    PFB_WRITE_LIST(L_FOG, pfb_write_fog);
    PFB_WRITE_LIST(L_CTAB, pfb_write_ctab);
    PFB_WRITE_LIST(L_LPSTATE, pfb_write_lpstate);
    PFB_WRITE_LIST(L_HLIGHT, pfb_write_hlight);
    PFB_WRITE_LIST(L_SHADOBJ, pfb_write_shader_object);
    PFB_WRITE_LIST(L_SHADPROG, pfb_write_shader_program);
    PFB_WRITE_LIST(L_GSTATE, pfb_write_gstate);
    PFB_WRITE_SLIST(L_APPEARANCE, pfb_write_appearance);
    PFB_WRITE_SLIST(L_ASDDATA, pfb_write_asddata);
    PFB_WRITE_LIST(L_MORPH, pfb_write_morph);
    PFB_WRITE_LIST(L_FRUST, pfb_write_frust);
    PFB_WRITE_LIST(L_LSOURCE, pfb_write_lsource);
    PFB_WRITE_LIST(L_GSET, pfb_write_gset);
    PFB_WRITE_SLIST(L_VARRAY_1, pfb_write_varray_1);
    PFB_WRITE_SLIST(L_VARRAY_2, pfb_write_varray_2);
    PFB_WRITE_SLIST(L_VARRAY_4, pfb_write_varray_4);
    PFB_WRITE_LIST(L_GARRAY, pfb_write_geoArray);
    PFB_WRITE_LIST(L_LODSTATE, pfb_write_lodstate);
    PFB_WRITE_LIST(L_FONT, pfb_write_font);
    PFB_WRITE_LIST(L_STRING, pfb_write_string);
    PFB_WRITE_LIST(L_MESH, pfb_write_mesh);
    PFB_WRITE_LIST(L_CURVE2D, pfb_write_curve2d_general);
    PFB_WRITE_LIST(L_DISCURVE2D, pfb_write_discurve2d);
    PFB_WRITE_LIST(L_SCALAR, pfb_write_scalar);
    PFB_WRITE_LIST(L_TOPO, pfb_write_topo);
    PFB_WRITE_SLIST(L_NODE, pfb_write_node);


    /*
     *  close the file
     */
    fclose(glb->ofp);
    /*
     *  free temporary memory used in creating the file.
     */
    free_store_data(glb);

    return(TRUE);
}


static void descend_node(pfNode *node, pfa_global_t *glb)
{
    int i, num;
    void *data;
    pfNodeTravFuncType pre, post;

    /* we need to descend the para surface before we add it to the list! */
    if(glb->disable_rep_save == 0 &&
       pfIsOfType(node, pfGetParaSurfaceClassType())) {
      if(find_in_list(L_NODE, node, glb) == -1)
	descend_parasurface((pfParaSurface *)node,glb);
    }

    if (add_to_list(L_NODE, node, glb))

    {
	if (pfIsOfType(node, pfGetGroupClassType()))
	{
	    if (pfIsOfType(node, pfGetLODClassType()))
	    {
		if (data = pfGetLODLODState((pfLOD *)node))
		    add_to_list(L_LODSTATE, data, glb);
	    }
	    else if (pfIsOfType(node, pfGetMorphClassType()))
		descend_morph((pfMorph *)node, glb);
	    else if (pfIsOfType(node, pfGetSceneClassType()))
	    {
		if (data = pfGetSceneGState((pfScene *)node))
		    descend_gstate(data, glb);
	    }
	    else if (pfIsOfType(node, pfGetFCSClassType()))
		descend_flux(pfGetFCSFlux((pfFCS *)node), glb);
	    else if (pfIsOfType(node, pfGetDoubleFCSClassType()))
		descend_flux(pfGetDoubleFCSFlux((pfDoubleFCS *)node), glb);

	    num = pfGetNumChildren((pfGroup *)node);

	    for (i = 0; i < num; i++)
		descend_node(pfGetChild((pfGroup *)node, i), glb);
	}
	else if (pfIsOfType(node, pfGetGeodeClassType()))
	{
	    if (pfIsOfType(node, pfGetBboardClassType()))
	    {
		if (data = pfGetBboardPosFlux((pfBillboard *)node))
		    descend_flux((pfFlux*)data, glb);

		if(pfIsOfType(node, pfGetIBRnodeClassType()))
		{
		    descend_ibr_tex(pfGetIBRnodeIBRtexture((pfIBRnode *)node),
				    glb);
		}

		num = pfGetNumGSets((pfGeode *)node);
	    }
	    else if (pfIsOfType(node, pfGetSubdivSurfaceClassType()))
	    {
		if(glb->subdivsurface_save_geosets)
		{
		    /* like a geode */
		    num = pfGetNumGSets((pfGeode *)node);
		}
		else
		{
		    descend_mesh(pfGetSubdivSurfaceMesh((pfSubdivSurface *)node),
				 glb);

		    num = 0; /* do not descent geosets */
		}
	    }
	    else if(glb->disable_rep_save == 0 &&
		    pfIsOfType(node, pfGetParaSurfaceClassType()))
	    {
	      /* don't descend here ... do it earlier so that
	       * all the elements which rely on it get placed
	       * in the list first.
	       */
	      num = pfGetNumGSets((pfGeode *)node);
	    }
	    else if(glb->disable_rep_save == 0 &&
		    pfIsOfType(node, pfGetCompCurve3dClassType()))
	    {
	      pfParaSurface *s =
	        pfGetCompCurve3dParaSurface((pfCompositeCurve3d *)node);
	      pfCurve2d     *c =
	        pfGetCompCurve3dCurve2d((pfCompositeCurve3d *)node);

	      if(s) add_to_list(L_NODE, s, glb);
	      /* XXX Alex -- or should we add 'em to L_NODE ? */
	      if(c) add_to_list(L_CURVE2D, s, glb);
	      num = pfGetNumGSets((pfGeode *)node);
	    }
	    else
		num = pfGetNumGSets((pfGeode *)node);

	    for (i = 0; i < num; i++)
		descend_gset(pfGetGSet((pfGeode *)node, i), glb);
	}
	else if (pfIsOfType(node, pfGetLPointClassType()))
	{
	    descend_gset(pfGetLPointGSet((pfLightPoint *)node), glb);
	}
	else if (pfIsOfType(node, pfGetLSourceClassType()))
	{
	    add_to_list(L_LSOURCE, node, glb);
	    if (data = pfGetLSourceAttr((pfLightSource *)node, PFLS_SHADOW_TEX))
		descend_tex(data, glb);
	    if (data = pfGetLSourceAttr((pfLightSource *)node, PFLS_PROJ_TEX))
		descend_tex(data, glb);
	    if (data = pfGetLSourceAttr((pfLightSource *)node, PFLS_PROJ_FOG))
		add_to_list(L_FOG, data, glb);
	    if (data = pfGetLSourceAttr((pfLightSource *)node, PFLS_PROJ_FRUST))
		add_to_list(L_FRUST, data, glb);
	}
	else if (pfIsOfType(node, pfGetTextClassType()))
	{
	    pfString *string;

	    num = pfGetNumStrings((pfText *)node);

	    for (i = 0; i < num; i++)
		if (string = pfGetString((pfText *)node, i))
		    descend_string(string, glb);
	}
	else if (pfIsOfType(node, pfGetASDClassType()))
	{
	    int bind, size, o_size, pv_size, o_sizeof, pv_sizeof;
	    void *attr, *o_attr, *pv_attr;
	    pfASDEvalFuncType efunc;

	    pfGetASDAttr((pfASD *)node, PFASD_LODS, &bind, &size, &attr);
	    if (attr)
		add_to_slist(L_ASDDATA, attr, size * (int)sizeof(pfASDLODRange),
			     glb);
	    pfGetASDAttr((pfASD *)node, PFASD_COORDS, &bind, &size, &attr);
	    if (attr)
		add_to_slist(L_ASDDATA, attr, size * (int)sizeof(pfASDVert), glb);
	    pfGetASDAttr((pfASD *)node, PFASD_FACES, &bind, &size, &attr);
	    if (attr)
		add_to_slist(L_ASDDATA, attr, size * (int)sizeof(pfASDFace), glb);

	    o_attr = pv_attr = NULL;
	    o_sizeof = 0;
	    pv_sizeof = 0;
	    pfGetASDAttr((pfASD *)node, PFASD_PER_VERTEX_ATTR, &bind, &size, &attr);
	    if (attr && size && bind)
	    {
		pv_attr = attr;
		pv_size = size;
		if (bind &PFASD_NORMALS)
		{
		    pv_sizeof += 6 * sizeof(float);
		}
		if(bind&PFASD_COLORS)
		{
		    pv_sizeof += 8 * sizeof(float);
		}
		if(bind&PFASD_TCOORDS)
		{
		    pv_sizeof += 4 * sizeof(float);
		}
	    }
	    pfGetASDAttr((pfASD *)node, PFASD_OVERALL_ATTR,  &bind, &size, &attr);
	    if (attr && size && bind)
	    {
		o_attr = attr;
		o_size = size;
		if (bind &PFASD_NORMALS)
		{
		    o_sizeof += 6 * sizeof(float);
		}
		if(bind&PFASD_COLORS)
		{
		    o_sizeof += 8 * sizeof(float);
		}
		if(bind&PFASD_TCOORDS)
		{
		    o_sizeof += 4 * sizeof(float);
		}
	    }

	    if (o_attr)
		add_to_slist(L_ASDDATA, o_attr, o_size * o_sizeof, glb);
	    if (pv_attr)
		add_to_slist(L_ASDDATA, pv_attr, pv_size * pv_sizeof, glb);

	    num = pfGetASDNumGStates((pfASD *)node);
	    for (i = 0; i < num; i++)
		if (data = pfGetASDGState((pfASD *)node, i))
		    descend_gstate(data, glb);

	    if (efunc = pfGetASDEvalFunc((pfASD *)node))
		descend_ufunc(efunc, "pfASD eval", glb);

#if 0
	    sg = pfGetASDSyncGroup((pfASD *)node);
	    add_to_list(L_SG_NAME, (void*)pfGetFluxSyncGroupName(sg), glb);
#endif
	}
	else
	{
	    /* XXX unknown node type */
	}

	pfGetNodeTravFuncs(node, PFTRAV_APP, &pre, &post);
	if (pre)
	    descend_ufunc(pre, "pfNode pre app trav", glb);
	if (post)
	    descend_ufunc(post, "pfNode post app trav", glb);
	pfGetNodeTravFuncs(node, PFTRAV_CULL, &pre, &post);
	if (pre)
	    descend_ufunc(pre, "pfNode pre cull trav", glb);
	if (post)
	    descend_ufunc(post, "pfNode post cull trav", glb);
	pfGetNodeTravFuncs(node, PFTRAV_DRAW, &pre, &post);
	if (pre)
	    descend_ufunc(pre, "pfNode pre draw trav", glb);
	if (post)
	    descend_ufunc(post, "pfNode post draw trav", glb);
	pfGetNodeTravFuncs(node, PFTRAV_ISECT, &pre, &post);
	if (pre)
	    descend_ufunc(pre, "pfNode pre isect trav", glb);
	if (post)
	    descend_ufunc(post, "pfNode post isect trav", glb);

	if (data = pfGetNodeTravData(node, PFTRAV_APP))
	    descend_udata(data, 0, node, glb);
	if (data = pfGetNodeTravData(node, PFTRAV_CULL))
	    descend_udata(data, 0, node, glb);
	if (data = pfGetNodeTravData(node, PFTRAV_DRAW))
	    descend_udata(data, 0, node, glb);
	if (data = pfGetNodeTravData(node, PFTRAV_ISECT))
	    descend_udata(data, 0, node, glb);
    }
}


static void descend_gset(pfGeoSet *gset, pfa_global_t *glb)
{
    /*
     * this could be a geoArray.
     */
    if(pfIsOfType(gset, pfGetGArrayClassType())){
	descend_geoArray((pfGeoArray*)gset, glb);
	return;
    }


    if (add_to_list(L_GSET, gset, glb))
    {
	pfGeoState *gstate;
	int lcount, *llist;
	int bind;
	int vcount, cncount;
	pfVec4 *clist;
	pfVec3 *nlist, *vlist;
	pfVec2 *tlist;
	ushort *ilist;
	int prim_type, pcount;
	int min, max;
	int i;
	pfHighlight *hlight;
	pfFlux *flux;
	islAppearance *appearance;

	prim_type = pfGetGSetPrimType(gset);
	pcount = pfGetGSetNumPrims(gset);

	if (llist = pfGetGSetPrimLengths(gset))
	{
	    for (i = 0, lcount = 0; i < pcount; i++)
		lcount += PF_ABS(llist[i]);
	    add_to_slist(L_LLIST, llist, pcount, glb);
	}

	switch (prim_type)
	{
	    case PFGS_POINTS:
		vcount = cncount = pcount;
		break;
	    case PFGS_LINES:
		vcount = cncount = pcount * 2;
		break;
	    case PFGS_TRIS:
		vcount = cncount = pcount * 3;
		break;
	    case PFGS_QUADS:
		vcount = cncount = pcount * 4;
		break;
	    case PFGS_LINESTRIPS:
	    case PFGS_TRISTRIPS:
	    case PFGS_TRIFANS:
	    case PFGS_POLYS:
		vcount = cncount = lcount;
		break;
	    case PFGS_FLAT_LINESTRIPS:
		vcount = lcount;
		cncount = lcount - pcount;
		break;
	    case PFGS_FLAT_TRISTRIPS:
	    case PFGS_FLAT_TRIFANS:
		vcount = lcount;
		cncount = lcount - pcount * 2;
		break;
	}

	/*
	 *  PFGS_COORD3
	 */
	pfGetGSetAttrLists(gset, PFGS_COORD3, (void **)&vlist, &ilist);
	if (vlist)
	{
	    if (ilist)
	    {
		pfGetGSetAttrRange(gset, PFGS_COORD3, &min, &max);
		add_to_slist(L_ILIST, ilist, vcount, glb);
		add_to_slist(L_VLIST, vlist, max+1, glb);
	    }
	    else
		add_to_slist(L_VLIST, vlist, vcount, glb);
	    if (flux = pfGetFlux(vlist))
		descend_flux(flux, glb);
	}

	/*
	 *  PFGS_COLOR4
	 */
	if ((bind = pfGetGSetAttrBind(gset, PFGS_COLOR4)) != PFGS_OFF)
	{
	    pfGetGSetAttrLists(gset, PFGS_COLOR4, (void **)&clist, &ilist);
	    if (ilist)
	    {
		pfGetGSetAttrRange(gset, PFGS_COLOR4, &min, &max);
		switch (bind)
		{
		    case PFGS_OVERALL:
			add_to_slist(L_ILIST, ilist, 1, glb);
			add_to_slist(L_CLIST, clist, max+1, glb);
			break;
		    case PFGS_PER_PRIM:
			add_to_slist(L_ILIST, ilist, pcount, glb);
			add_to_slist(L_CLIST, clist, max+1, glb);
			break;
		    case PFGS_PER_VERTEX:
			add_to_slist(L_ILIST, ilist, cncount, glb);
			add_to_slist(L_CLIST, clist, max+1, glb);
			break;
		}
	    }
	    else
	    {
		switch (bind)
		{
		    case PFGS_OVERALL:
			add_to_slist(L_CLIST, clist, 1, glb);
			break;
		    case PFGS_PER_PRIM:
			add_to_slist(L_CLIST, clist, pcount, glb);
			break;
		    case PFGS_PER_VERTEX:
			add_to_slist(L_CLIST, clist, cncount, glb);
			break;
		}
	    }
	    if (clist && (flux = pfGetFlux(clist)))
		descend_flux(flux, glb);
	}

	/*
	 *  PFGS_NORMAL3
	 */
	if ((bind = pfGetGSetAttrBind(gset, PFGS_NORMAL3)) != PFGS_OFF)
	{
	    pfGetGSetAttrLists(gset, PFGS_NORMAL3, (void **)&nlist, &ilist);
	    if (ilist)
	    {
		pfGetGSetAttrRange(gset, PFGS_NORMAL3, &min, &max);
		switch (bind)
		{
		    case PFGS_OVERALL:
			add_to_slist(L_ILIST, ilist, 1, glb);
			add_to_slist(L_NLIST, nlist, max+1, glb);
			break;
		    case PFGS_PER_PRIM:
			add_to_slist(L_ILIST, ilist, pcount, glb);
			add_to_slist(L_NLIST, nlist, max+1, glb);
			break;
		    case PFGS_PER_VERTEX:
			add_to_slist(L_ILIST, ilist, cncount, glb);
			add_to_slist(L_NLIST, nlist, max+1, glb);
			break;
		}
	    }
	    else
	    {
		switch (bind)
		{
		    case PFGS_OVERALL:
			add_to_slist(L_NLIST, nlist, 1, glb);
			break;
		    case PFGS_PER_PRIM:
			add_to_slist(L_NLIST, nlist, pcount, glb);
			break;
		    case PFGS_PER_VERTEX:
			add_to_slist(L_NLIST, nlist, cncount, glb);
			break;
		}
	    }
	    if (nlist && (flux = pfGetFlux(nlist)))
		descend_flux(flux, glb);
	}

	/*
	 *  PFGS_TEXCOORD2 - Do for all texture units.
	 */
        for (i = 0 ; i < glb->maxTextures ; i ++)
	{
	    if (pfGetGSetMultiAttrBind(gset, PFGS_TEXCOORD2, i) ==
							PFGS_PER_VERTEX)
	    {
		pfGetGSetMultiAttrLists(gset, PFGS_TEXCOORD2, i,
					(void **)&tlist, &ilist);
		if (ilist)
		{
		    pfGetGSetMultiAttrRange(gset, PFGS_TEXCOORD2, i,
						&min, &max);
		    add_to_slist(L_ILIST, ilist, vcount, glb);
		    add_to_slist(L_TLIST, tlist, max+1, glb);
		}
		else
		    add_to_slist(L_TLIST, tlist, vcount, glb);
		if (tlist && (flux = pfGetFlux(tlist)))
		    descend_flux(flux, glb);
	    }
	}

	if (gstate = pfGetGSetGState(gset))
	    descend_gstate(gstate, glb);

	if (hlight = pfGetGSetHlight(gset))
	    descend_hlight(hlight, glb);

	if (flux = pfGetGSetBBoxFlux(gset))
	    descend_flux(flux, glb);

	if(appearance = pfGetGSetAppearance(gset))
	  descend_appearance(appearance, glb);
    }
}


static void descend_gstate(pfGeoState *gstate, pfa_global_t *glb)
{
    int		i;

    if (add_to_list(L_GSTATE, gstate, glb))
    {
	uint64_t imask;
	void *data;

	imask = pfGetGStateInherit(gstate);

	if (!(imask & PFSTATE_FRONTMTL))
	{
	    data = pfGetGStateAttr(gstate, PFSTATE_FRONTMTL);
	    add_to_list(L_MTL, data, glb);
	}

	if (!(imask & PFSTATE_BACKMTL))
	{
	    data = pfGetGStateAttr(gstate, PFSTATE_BACKMTL);
	    add_to_list(L_MTL, data, glb);
	}

	if (!(imask & PFSTATE_LIGHTMODEL))
	{
	    data = pfGetGStateAttr(gstate, PFSTATE_LIGHTMODEL);
	    add_to_list(L_LMODEL, data, glb);
	}

	if (!(imask & PFSTATE_LIGHTS))
	{
	    int i;
	    pfLight **lights;

	    lights = pfGetGStateAttr(gstate, PFSTATE_LIGHTS);
	    for (i = 0; i < PF_MAX_LIGHTS; i++)
		if (lights[i])
		    add_to_list(L_LIGHT, lights[i], glb);
	}

	if (!(imask & PFSTATE_TEXTURE))
	{
	    for (i = 0 ; i < glb->maxTextures ; i ++)
	    {
	        data = pfGetGStateMultiAttr(gstate, PFSTATE_TEXTURE, i);
		if (data)
		    descend_tex(data, glb);
	    }
	}

	if (!(imask & PFSTATE_TEXENV))
	{
	    for (i = 0 ; i < glb->maxTextures ; i ++)
	    {
	        data = pfGetGStateMultiAttr(gstate, PFSTATE_TEXENV, i);
		if (data)
		    add_to_list(L_TENV, data, glb);
	    }
	}

	if (!(imask & PFSTATE_FOG))
	{
	    data = pfGetGStateAttr(gstate, PFSTATE_FOG);
	    add_to_list(L_FOG, data, glb);
	}

	if (!(imask & PFSTATE_TEXGEN))
	{
	    for (i = 0 ; i < glb->maxTextures ; i ++)
	    {
	        data = pfGetGStateMultiAttr(gstate, PFSTATE_TEXGEN, i);
		if (data)
		    add_to_list(L_TGEN, data, glb);
	    }
	}

	if (!(imask & PFSTATE_TEXLOD))
	{
	    for (i = 0 ; i < glb->maxTextures ; i ++)
	    {
	        data = pfGetGStateMultiAttr(gstate, PFSTATE_TEXLOD, i);
		if (data)
		    add_to_list(L_TLOD, data, glb);
	    }
	}

	if (!(imask & PFSTATE_VTXPROG))
	{
	    data = pfGetGStateAttr(gstate, PFSTATE_VTXPROG);
	    if (data)
	        add_to_list(L_GPROG, data, glb);
	}

	if (!(imask & PFSTATE_FRAGPROG))
	{
	    data = pfGetGStateAttr(gstate, PFSTATE_FRAGPROG);
	    if (data)
	        add_to_list(L_GPROG, data, glb);
	}

	if (!(imask & PFSTATE_GPROGPARMS))
	{
	    for(i=0; i<PF_N_GPPARMS; i++)
	        if(data = pfGetGStateMultiAttr(gstate, PFSTATE_GPROGPARMS, i))
		    add_to_list(L_GPROGPARM, data, glb);
	}

	if (!(imask & PFSTATE_COLORTABLE))
	{
	    data = pfGetGStateAttr(gstate, PFSTATE_COLORTABLE);
	    add_to_list(L_CTAB, data, glb);
	}

	if (!(imask & PFSTATE_HIGHLIGHT))
	{
	    descend_hlight(pfGetGStateAttr(gstate, PFSTATE_HIGHLIGHT), glb);
	}

	if (!(imask & PFSTATE_LPOINTSTATE))
	{
	    descend_lpstate(pfGetGStateAttr(gstate, PFSTATE_LPOINTSTATE), glb);
	}

	if (!(imask & PFSTATE_SHADPROG))
	{
	    void *obj = NULL;
	    int n;

	    data = pfGetGStateAttr(gstate, PFSTATE_SHADPROG);
	    if (data) {
	        add_to_list(L_SHADPROG, data, glb);
		n = pfGetSProgNumShaders((pfShaderProgram *)data);
		for(i=0; i<n; i++) {
		  obj = pfGetSProgShader((pfShaderProgram *)data, i);
		  if(obj)
		    add_to_list(L_SHADOBJ, obj, glb);
		}

	    }
	}

    }
}


static void descend_tex(pfTexture *tex, pfa_global_t *glb)
{
    pfTexture *child_tex;
    const char *name;
    uint *image, *load_image;
    int comp, ns, nt, nr;
    pfList *tlist;
    int save_image, is_pfi;
    int save_image2[TEX_MAX_IMAGES];
    int i, count;
    int is_cliptexture;

    if (find_in_list(L_TEX, tex, glb) != -1)
	return;

    is_pfi = is_pfi_tex(tex);

    /*
     *  If we are not always saving images, see if we can find
     *  the texture file by it's name.
     */
    save_image = TRUE;
    name = pfGetTexName(tex);
    if (glb->save_texture_pfi == PF_ON)
    {
	if (name != NULL)
	    save_image = FALSE;
    }
    else if (glb->save_texture_image == PF_OFF)
    {
	if (name)
	{
	    char path[PF_MAXSTRING];

	    if (pfFindFile(name, path, R_OK))
		save_image = FALSE;	/* don't save the image */
	}
    }

    for(i=0; i<TEX_MAX_IMAGES; i++)
    {
	pfGetTexMultiImage(tex, &image, i, &comp, &ns, &nt, &nr);
	if(image)
	{
	    save_image2[i] = TRUE;

	    name = pfGetTexMultiName(tex, i);
	    if (glb->save_texture_pfi == PF_ON)
	    {
		if (name != NULL)
		    save_image2[i] = FALSE;
	    }
	    else if (glb->save_texture_image == PF_OFF)
	    {
		if (name)
		{
		    char path[PF_MAXSTRING];

		    if (pfFindFile(name, path, R_OK))
			save_image2[i] = FALSE;	/* don't save the image */
		}
	    }
	}
    }

    if (is_cliptexture = pfIsOfType(tex, pfGetClipTextureClassType()))
    {
	child_tex = (pfTexture *)pfGetClipTextureMaster((pfClipTexture *)tex);
	if (child_tex)
	    descend_tex(child_tex, glb);
    }
    else
    {
	if (save_image)
	{
	    pfGetTexImage(tex, &image, &comp, &ns, &nt, &nr);
	    if (pfGetTexFormat(tex, PFTEX_EXTERNAL_FORMAT) == PFTEX_PACK_16)
		comp |= TWO_BYTE_COMPONENTS;
	    if (pfGetTexFormat(tex, PFTEX_EXTERNAL_FORMAT) == PFTEX_PACK_32)
		comp |= FOUR_BYTE_COMPONENTS;
	    comp |= ns << 8;

	    /*
	     *  save the texture load image if it exists
	     */
	    load_image = pfGetTexLoadImage(tex);
	    if (load_image)
		add_to_slist(L_IMAGE, load_image, comp, glb);

	    if (image)
		add_to_slist(L_IMAGE, image, comp, glb);
	}

	for(i=0; i<TEX_MAX_IMAGES; i++)
	    if (save_image2[i])
	    {
		pfGetTexMultiImage(tex, &image, i, &comp, &ns, &nt, &nr);
		if (pfGetTexFormat(tex, PFTEX_EXTERNAL_FORMAT) ==
		    PFTEX_PACK_16)
		    comp |= TWO_BYTE_COMPONENTS;
		if (pfGetTexFormat(tex, PFTEX_EXTERNAL_FORMAT) ==
		    PFTEX_PACK_32)
		    comp |= FOUR_BYTE_COMPONENTS;
		comp |= ns << 8;

		/*
		 *  no texture load image if exists for textures with multiple images
		 */

		if (image)
		    add_to_slist(L_IMAGE, image, comp, glb);

		save_image = TRUE; /* so that we descend texture levels */
	    }


	/*
	 *  Descend texture level textures.
	 */
	if (!(is_pfi || glb->save_texture_pfi == PF_ON) || save_image)
	    for (i = 1; i <= 32; i++)
	    {
		if (child_tex = pfGetTexLevel(tex, i))
		    descend_tex(child_tex, glb);
	    }
    }

    /*
     *  Descend detail texture.
     */
    if (child_tex = pfGetTexDetailTex(tex))
	descend_tex(child_tex, glb);

    /*
     *  Desend textures from pfTexList
     */
    if (tlist = pfGetTexList(tex))
    {
	/*
	 *  If the texture list is not from a multi image pfi, or
	 *  we are saving images.
	 */
	if (!(is_pfi & IS_PFI_MULTI) || save_image)
	{
	    count = pfGetNum(tlist);
	    for (i = 0; i < count; i++)
		descend_tex(pfGet(tlist, i), glb);
	}
    }

    /*
     *  Now that we have added all sub textures of this texture, add it
     *  to the texture list.
     */
    add_to_list(L_TEX, tex, glb);

    if (is_cliptexture)
    {
	pfObject *level_obj;

	/*
	 *  Descend cliptexture level objects.
	 */
	for (i = -32; i <= 32; i++)
	{
	    if (level_obj = pfGetClipTextureLevel((pfClipTexture *)tex, i))
	    {
		if (pfIsOfType(level_obj, pfGetImageCacheClassType()))
		    descend_icache((pfImageCache *)level_obj, glb);
		else
		    descend_itile((pfImageTile *)level_obj, glb);
	    }
	}
    }
}


static void pfb_write_mtl(pfMaterial *mtl, pfa_global_t *glb)
{
    int f_cm, b_cm;
    mtl_t m;

    m.side = find_in_table(mtls_table, pfGetMtlSide(mtl));
    m.alpha =  pfGetMtlAlpha(mtl);
    m.shininess =  pfGetMtlShininess(mtl);
    pfGetMtlColor(mtl, PFMTL_AMBIENT,
		  &m.ambient[0], &m.ambient[1], &m.ambient[2]);
    pfGetMtlColor(mtl, PFMTL_DIFFUSE,
		  &m.diffuse[0], &m.diffuse[1], &m.diffuse[2]);
    pfGetMtlColor(mtl, PFMTL_SPECULAR,
		  &m.specular[0], &m.specular[1], &m.specular[2]);
    pfGetMtlColor(mtl, PFMTL_EMISSION,
		  &m.emission[0], &m.emission[1], &m.emission[2]);
    f_cm = pfGetMtlColorMode(mtl, PFMTL_FRONT);
    b_cm = pfGetMtlColorMode(mtl, PFMTL_BACK);
    if (f_cm == b_cm)
    {
	m.cmode[0] = find_in_table(mtls_table, PFMTL_BOTH);
	m.cmode[1] = find_in_table(cmode_table, f_cm);
    }
    else
    {
	m.cmode[0] = find_in_table(mtls_table, PFMTL_FRONT);
	m.cmode[1] = find_in_table(cmode_table, f_cm);
    }
    m.udata = get_udata((pfObject*)mtl, glb);

    fwrite(&m, sizeof(mtl_t), 1, glb->ofp);
}


static int save_tex_image(pfTexture *tex, const char **name_ptr,
			  pfa_global_t *glb)
{
    const char *name;
    char *s, *buf;
    int found, save_image, save_pfi;

    /*
     *  First see if we can find a texture file by it's name.
     */
    if (name = pfGetTexName(tex))
    {
	buf = (char *)GET_BUF(PF_MAXSTRING);

	found = pfFindFile(name, buf, R_OK);

	if (glb->save_texture_pfi == PF_ON)
	{
	    save_image = 0;

	    if ((s = strrchr(name, '.')) == NULL)
	    {
		strcpy(buf, name);
		strcat(buf, ".pfi");
		save_pfi = TRUE;
	    }
	    else if (strcmp(s, ".pfi"))
	    {
		strcpy(buf, name);
		s = strrchr(buf, '.');
		strcpy(s, ".pfi");
		save_pfi = TRUE;
	    }
	    else if (!found)
	    {
		strcpy(buf, name);
		save_pfi = TRUE;
	    }
	    else
		save_pfi = FALSE;

	    if (glb->save_texture_path == PF_ON)
		name = buf;
	    else
	    {
		if (name = strrchr(buf, '/'))
		    name++;
		else
		    name = buf;
	    }

	    *name_ptr = name;

	    if (save_pfi)
		pfSaveTexFile(tex, name);
	}
	else if (glb->save_texture_image == PF_OFF && found)
	{
	    save_image = 0;

	    if (glb->save_texture_path == PF_ON)
		*name_ptr = name;
	    else
	    {
		if (s = strrchr(name, '/'))
		    s++;
		else
		    s = (char *)name;
		*name_ptr = s;
	    }
	}
	else
	{
	    save_image = 1;
	    *name_ptr = name;
	}
    }
    else
    {
	save_image = 1;
	*name_ptr = NULL;
    }

    return(save_image);
}


static int save_tex_multi_image(pfTexture *tex, const char **name_ptr,
				int imageIndex, pfa_global_t *glb)
{
    const char *name;
    char *s, *buf;
    int found, save_image, save_pfi;

    /*
     *  First see if we can find a texture file by it's name.
     */
    if (name = pfGetTexMultiName(tex, imageIndex))
    {
	buf = (char *)GET_BUF(PF_MAXSTRING);

	found = pfFindFile(name, buf, R_OK);

	if (glb->save_texture_pfi == PF_ON)
	{
	    save_image = 0;

	    if ((s = strrchr(name, '.')) == NULL)
	    {
		strcpy(buf, name);
		strcat(buf, ".pfi");
		save_pfi = TRUE;
	    }
	    else if (strcmp(s, ".pfi"))
	    {
		strcpy(buf, name);
		s = strrchr(buf, '.');
		strcpy(s, ".pfi");
		save_pfi = TRUE;
	    }
	    else if (!found)
	    {
		strcpy(buf, name);
		save_pfi = TRUE;
	    }
	    else
		save_pfi = FALSE;

	    if (glb->save_texture_path == PF_ON)
		name = buf;
	    else
	    {
		if (name = strrchr(buf, '/'))
		    name++;
		else
		    name = buf;
	    }

	    *name_ptr = name;

	    if (save_pfi)
		pfSaveMultiTexFile(tex, name, imageIndex);
	}
	else if (glb->save_texture_image == PF_OFF && found)
	{
	    save_image = 0;

	    if (glb->save_texture_path == PF_ON)
		*name_ptr = name;
	    else
	    {
		if (s = strrchr(name, '/'))
		    s++;
		else
		    s = (char *)name;
		*name_ptr = s;
	    }
	}
	else
	{
	    save_image = 1;
	    *name_ptr = name;
	}
    }
    else
    {
	save_image = 1;
	*name_ptr = NULL;
    }

    return(save_image);
}



static void pfb_write_tex(pfTexture *tex, pfa_global_t *glb)
{
    pfTexture *child_tex, *base_tex;
    tex_t t;
    const char *name;
    pfList *tlist;
    int *itlist;
    int ilevels[63][2];
    int is_pfi, save_image;
    int i;

    if (pfIsOfType(tex, pfGetClipTextureClassType()))
	t.type = TEXTYPE_CLIPTEXTURE;
    else
	t.type = TEXTYPE_TEXTURE;

    is_pfi = is_pfi_tex(tex);

    base_tex = tex;

    if (save_image = save_tex_image(tex, &name, glb))
    {
	uint *image;

	pfGetTexImage(tex, &image, &t.comp, &t.xsize, &t.ysize, &t.zsize);
	t.image = find_in_list(L_IMAGE, image, glb);
    }
    if(pfGetTexFormat(tex, PFTEX_CUBE_MAP))
    {
	save_image = TRUE;
	for(i=0; i<TEX_MAX_IMAGES; i++)
	    if (!save_tex_multi_image(tex, &name, i, glb))
		save_image = FALSE;
    }
    if(!save_image)
    {
	t.image = t.comp = t.xsize = t.ysize = t.zsize = -1;

	if (is_pfi & IS_PFI_MULTI)
	{
	    /*
	     *  If this texture is from a multi image pfi file,
	     *  we want to save the state of a texture in the texture list.
	     */
	    tlist = pfGetTexList(tex);
	    tex = pfGet(tlist, 0);
	}
    }

    pfb_write_name(name, glb);

    t.format[0] = find_in_table(txif_table,
				pfGetTexFormat(tex, PFTEX_INTERNAL_FORMAT));
    t.format[1] = find_in_table(txef_table,
				pfGetTexFormat(tex, PFTEX_EXTERNAL_FORMAT));
    t.format[2] = find_in_table(oo_table,
				pfGetTexFormat(tex, PFTEX_DETAIL_TEXTURE));
    t.format[3] = find_in_table(oo_table,
				pfGetTexFormat(tex, PFTEX_SUBLOAD_FORMAT));
    t.format[4] = find_in_table(oo_table,
				pfGetTexFormat(tex, PFTEX_FAST_DEFINE))
	| ((pfGetTexFormat(tex, PFTEX_CUBE_MAP) ? 1 : 0) << 2);
    t.filter[0] = to_table(txf_table, pfGetTexFilter(tex, PFTEX_MINFILTER));
    t.filter[1] = to_table(txf_table, pfGetTexFilter(tex, PFTEX_MAGFILTER));
    t.filter[2] = to_table(txf_table,
			   pfGetTexFilter(tex, PFTEX_MAGFILTER_ALPHA));
    t.filter[3] = to_table(txf_table,
			   pfGetTexFilter(tex, PFTEX_MAGFILTER_COLOR));
    t.wrap[0] = find_in_table(txr_table, pfGetTexRepeat(tex, PFTEX_WRAP_R));
    t.wrap[1] = find_in_table(txr_table, pfGetTexRepeat(tex, PFTEX_WRAP_S));
    t.wrap[2] = find_in_table(txr_table, pfGetTexRepeat(tex, PFTEX_WRAP_T));
    pfGetTexBorderColor(tex, &t.bcolor);
    t.btype = find_in_table(txb_table, pfGetTexBorderType(tex));
    pfGetTexSpline(tex, PFTEX_SHARPEN_SPLINE, t.ssp, &t.ssc);
    pfGetTexSpline(tex, PFTEX_DETAIL_SPLINE, t.dsp, &t.dsc);
#ifndef XXX_FIXED_TEX_SPLINE_BUG
    t.ssp[0][0] = 0.0f; t.ssp[0][1] = 0.0f;
    t.ssp[1][0] = 0.0f; t.ssp[1][1] = 0.0f;
    t.ssp[2][0] = 0.0f; t.ssp[2][1] = 0.0f;
    t.ssp[3][0] = 0.0f; t.ssp[3][1] = 0.0f;
    t.ssc = BROKEN_SPLINE;
    t.dsp[0][0] = 0.0f; t.dsp[0][1] = 0.0f;
    t.dsp[1][0] = 0.0f; t.dsp[1][1] = 0.0f;
    t.dsp[2][0] = 0.0f; t.dsp[2][1] = 0.0f;
    t.dsp[3][0] = 0.0f; t.dsp[3][1] = 0.0f;
    t.dsc = BROKEN_SPLINE;
#endif
    pfGetTexDetail(tex, &i, &child_tex);
    if (child_tex == NULL)
    {
	t.tdetail[0] = 0;
	t.tdetail[1] = -1;
    }
    else
    {
	t.tdetail[0] = i;
	t.tdetail[1] = find_in_list(L_TEX, child_tex, glb);
    }
    t.lmode[0] = find_in_table(txls_table,
			       pfGetTexLoadMode(tex, PFTEX_LOAD_SOURCE));
    t.lmode[1] = find_in_table(txlb_table,
			       pfGetTexLoadMode(tex, PFTEX_LOAD_BASE));
    t.lmode[2] = find_in_table(txll_table,
			       pfGetTexLoadMode(tex, PFTEX_LOAD_LIST));
    pfGetTexLoadOrigin(tex, PFTEX_ORIGIN_SOURCE,
		       &t.losource[0], &t.losource[1]);
    pfGetTexLoadOrigin(tex, PFTEX_ORIGIN_DEST, &t.lodest[0], &t.lodest[1]);
    pfGetTexLoadSize(tex, &t.lsize[0], &t.lsize[1]);
    t.load_image = find_in_list(L_IMAGE, pfGetTexLoadImage(tex), glb);
    t.frame = pfGetTexFrame(base_tex);
    if (tlist = pfGetTexList(tex))
    {
	t.list_size = pfGetNum(tlist);
	itlist = malloc(t.list_size * sizeof(int));
	for (i = 0; i < t.list_size; i++)
	    itlist[i] = find_in_list(L_TEX, pfGet(tlist, i), glb);
    }
    else
	t.list_size = 0;
    t.num_levels = 0;
    if (!pfGetTexFormat(tex, PFTEX_GEN_MIPMAP_FORMAT))
    {
	if (!(is_pfi || glb->save_texture_pfi == PF_ON) || save_image)
	    for (i = 1; i <= 32; i++)
	    {
		if (child_tex = pfGetTexLevel(tex, i))
		{
		    ilevels[t.num_levels][0] = i;
		    ilevels[t.num_levels][1] = find_in_list(L_TEX, child_tex,
							    glb);
		    t.num_levels++;
		}
	    }
    }
    t.udata = get_udata((pfObject*)base_tex, glb);
    t.aniso_degree = pfGetTexAnisotropy(tex);

    fwrite(&t, sizeof(tex_t), 1, glb->ofp);
    if (t.list_size > 0)
    {
	fwrite(itlist, sizeof(int), t.list_size, glb->ofp);
	free(itlist);
    }

	if (t.type == TEXTYPE_TEXTURE)
	{
		if (t.num_levels > 0)
		fwrite(ilevels, sizeof(int) * 2, t.num_levels, glb->ofp);
	}
	else
	if (t.type == TEXTYPE_CLIPTEXTURE)
	{
		cliptex_t	ct;
		pfTexture	*mtex;

		pfGetClipTextureCenter ((pfClipTexture*)tex, (int*)&(ct.center[0]), (int*)&(ct.center[1]), (int*)&(ct.center[2]));
		ct.clip_size = pfGetClipTextureClipSize ((pfClipTexture*)tex );
		pfGetClipTextureVirtualSize ((pfClipTexture*)tex, ct.virtual_size, ct.virtual_size + 1, ct.virtual_size + 2);
		ct.invalid_border = pfGetClipTextureInvalidBorder ((pfClipTexture*)tex);
		ct.virtual_LOD_offset = pfGetClipTextureVirtualLODOffset ((pfClipTexture*)tex);
		ct.effective_levels = pfGetClipTextureNumEffectiveLevels ((pfClipTexture*)tex);
		mtex = (pfTexture*)pfGetClipTextureMaster ((pfClipTexture*)tex);
		if (!mtex)
			ct.master = -1;
		else
			ct.master = find_in_list (L_TEX, mtex, glb);

		ct.DTR_mode = pfGetClipTextureDTRMode ((pfClipTexture*)tex);
		ct.DTR_max_i_border = 0;
		pfGetClipTextureLODRange ((pfClipTexture*)tex, ct.LOD_range, ct.LOD_range + 1);

		fwrite(&ct, sizeof ct, 1, glb->ofp);

		if (t.num_levels > 0)
		{
			cliplevel_t		cliplevels[100];
			pfObject		*obj;

			for (i = 0; i < t.num_levels; i ++)
			{
				cliplevels[i].level = i;
				obj = pfGetClipTextureLevel ((pfClipTexture*)tex, i);
				if (pfIsOfType (obj, pfGetImageCacheClassType()))
				{
					cliplevels[i].obj = find_in_list (L_ICACHE, obj, glb);
					cliplevels[i].type = L_ICACHE;
				}
				else
				{
					cliplevels[i].obj = find_in_list (L_ITILE, obj, glb);
					cliplevels[i].type = L_ITILE;
				}

				cliplevels[i].phase_margin = pfGetClipTextureLevelPhaseMargin ((pfClipTexture*)tex, i);
				pfGetClipTextureLevelPhaseShift ((pfClipTexture*)tex, i, cliplevels[i].phase_shift, cliplevels[i].phase_shift + 1, cliplevels[i].phase_shift + 2);

			}

			fwrite (cliplevels, sizeof (cliplevel_t), t.num_levels, glb->ofp);
		}
	}

    if((t.format[4] >> 2) == 1)
    {
	int  im;

	i = TEX_MAX_IMAGES;
	fwrite (&i, sizeof (int), 1, glb->ofp);

	for(i=0; i<TEX_MAX_IMAGES; i++)
	{
	    if (save_tex_multi_image(tex, &name, i, glb))
	    {
		uint *image;

		pfGetTexMultiImage(tex, &image, i,
				   &t.comp, &t.xsize, &t.ysize, &t.zsize);
		im = find_in_list(L_IMAGE, image, glb);
	    }
	    else
		im = -1;

	    fwrite (&im, sizeof (int), 1, glb->ofp);

	    pfb_write_name(name, glb);
	}
    }
}


static void pfb_write_mesh(pfMesh *mesh, pfa_global_t *glb)
{
    int    c, f, nf, v, nv, nb, nnb, lines;
    float  grids[3];
    pfBox  *bbox;
    pfSphere *bsphere;
    float  epsilon;
    pfMeshFace *face;
    pfMeshVertex *vert;
    pfMeshVertexNeighbor *neighbor;
    pfVec2 *texCoord;
    pfVec3 *coord;
    int    buf_size;
    int    *buf;

    /* to be easily upgradeable */
    determineLengthOfMesh(mesh, &lines, &buf_size);

    buf = GET_BUF(buf_size);
    buf_size = 0;

    /* length of vertex (without neighbors),
       length of vertex neighbor, length of face (without face vertices),
       length of face vertex */
    buf[buf_size++] = (6<<24) + (5<<16) + (4<<8) + 3;

    /* flags */
    buf[buf_size++] = pfGetMeshFlags(mesh, 0xffffffff);

    /* gsetlist ignored - no dynamic updates via gsets after loading */

    /* bbox */
    bbox = pfGetMeshBBox(mesh);
    for(c=0; c<3; c++)
	((float *)buf)[buf_size++] = bbox->min[c];
    for(c=0; c<3; c++)
	((float *)buf)[buf_size++] = bbox->max[c];

    /* grid: bsphere and sizes */
    bsphere = pfGetMeshGridBsphere(mesh);
    for(c=0; c<3; c++)
	((float *)buf)[buf_size++] = bsphere->center[c];
    ((float *)buf)[buf_size++] = bsphere->radius;

    pfGetMeshVal(mesh, PFM_VERTEX_GRID_SIZE_X, &grids[0]);
    pfGetMeshVal(mesh, PFM_VERTEX_GRID_SIZE_Y, &grids[1]);
    pfGetMeshVal(mesh, PFM_VERTEX_GRID_SIZE_Z, &grids[2]);

    for(c=0; c<3; c++)
	buf[buf_size++] = (int)grids[c];

    /* epsilon */
    pfGetMeshVal(mesh, PFM_EPSILON, &epsilon);
    ((float *)buf)[buf_size++] = epsilon;

    /* vertices */
    nv = pfGetMeshNumVertices(mesh);
    buf[buf_size++] = nv;

    for(v = 0; v < nv; v++)
    {
	vert = pfGetMeshVertex(mesh, v);

	/* flags */
	buf[buf_size++] = pfGetMeshVertexFlags(vert, 0xffffffff);

	/* coords (coords ptr is not saved, it is NULL after loading) */
	coord = pfGetMeshVertexCoord(vert);
	for(c=0; c<3; c++)
	    ((float *)buf)[buf_size++] = coord[0][c];

	/* next vertex */
	buf[buf_size++] = pfGetMeshVertexNextVertex(vert);

	/* neighbors */
	nnb = pfGetMeshVertexNumNeighbors(vert);
	buf[buf_size++] = nnb;

	for(nb = 0; nb < nnb; nb++)
	{
	    neighbor = pfGetMeshVertexNeighbor(vert, nb);

	    buf[buf_size++] = neighbor->vertex;
	    buf[buf_size++] = neighbor->face;
	    buf[buf_size++] = neighbor->edgeType;
	    buf[buf_size++] = neighbor->prev;
	    buf[buf_size++] = neighbor->next;
	}
    }


    /* faces */
    nf = pfGetMeshNumFaces(mesh);
    buf[buf_size++] = nf;

    for(f = 0; f < nf; f++)
    {
	face = pfGetMeshFace(mesh, f);

	/* flags and part */
	buf[buf_size++] = pfGetMeshFaceFlags(face, 0xffffffff);
	buf[buf_size++] = pfGetMeshFacePart(face);

	/* geostate */
        buf[buf_size++] = find_in_list(L_GSTATE, pfGetMeshFaceGState(face),
				       glb);

	/* vertices and texCoords */
	nv = pfGetMeshFaceNumVerts(face);
	buf[buf_size++] = nv;

	for(v = 0; v < nv; v++)
	{
	    buf[buf_size++] = pfGetMeshFaceVertex(face, v);

	    texCoord = pfGetMeshFaceTexCoord(face, v);
	    ((float *)buf)[buf_size++] = texCoord[0][0];
	    ((float *)buf)[buf_size++] = texCoord[0][1];
	}
    }

    fwrite(&buf_size, sizeof(int), 1, glb->ofp);
    fwrite(buf, sizeof(int), buf_size, glb->ofp);
}


static void pfb_write_tenv(pfTexEnv *tenv, pfa_global_t *glb)
{
    tenv_t t;

    t.mode = find_in_table(tem_table, pfGetTEnvMode(tenv));
    t.component = find_in_table(tec_table, pfGetTEnvComponent(tenv));
    pfGetTEnvBlendColor(tenv,
			&t.color[0], &t.color[1], &t.color[2], &t.color[3]);
    t.udata = get_udata((pfObject*)tenv, glb);

    fwrite(&t, sizeof(tenv_t), 1, glb->ofp);
}



static void pfb_write_tgen(pfTexGen *tgen, pfa_global_t *glb)
{
    tgen_t t;

    t.mode_s = find_in_table(tgen_table, pfGetTGenMode(tgen, PF_S));
    t.mode_t = find_in_table(tgen_table, pfGetTGenMode(tgen, PF_T));
    t.mode_r = find_in_table(tgen_table, pfGetTGenMode(tgen, PF_R));
    t.mode_q = find_in_table(tgen_table, pfGetTGenMode(tgen, PF_Q));
    pfGetTGenPlane(tgen, PF_S,
		   &t.plane_s[0], &t.plane_s[1], &t.plane_s[2], &t.plane_s[3]);
    pfGetTGenPlane(tgen, PF_T,
		   &t.plane_t[0], &t.plane_t[1], &t.plane_t[2], &t.plane_t[3]);
    pfGetTGenPlane(tgen, PF_R,
		   &t.plane_r[0], &t.plane_r[1], &t.plane_r[2], &t.plane_r[3]);
    pfGetTGenPlane(tgen, PF_Q,
		   &t.plane_q[0], &t.plane_q[1], &t.plane_q[2], &t.plane_q[3]);
    t.udata = get_udata((pfObject*)tgen, glb);

    fwrite(&t, sizeof(tgen_t), 1, glb->ofp);
}


static void pfb_write_gstate(pfGeoState *gstate, pfa_global_t *glb)
{
    uint64_t imask, state;
    int i, j;
    int mode;
    void *data;
    int buf_size;
    int *buf;

    buf_size = 0;
    buf = glb->buf;
    imask = pfGetGStateInherit(gstate);

    for (i = 1; i <= gst_table[0]; i++)
    {
	if (!(imask & (state = gst_table[i])))
	{
	    buf[buf_size++] = i;
	    switch (i)
	    {
		/*
		 *  Modes
		 */
		case STATE_TRANSPARENCY:
		    mode = pfGetGStateMode(gstate, state);
		    buf[buf_size++] = find_in_table(tr_table, mode);
		    break;
		case STATE_ANTIALIAS:
		    mode = pfGetGStateMode(gstate, state);
		    buf[buf_size++] = find_in_table(aa_table, mode);
		    break;
		case STATE_DECAL:
		    mode = pfGetGStateMode(gstate, state);
		    buf[buf_size++] = find_in_table(decal_table,
						    mode & PFDECAL_MODE_MASK);
		    buf[buf_size++] = (mode & PFDECAL_LAYER_MASK) >>
				      PFDECAL_LAYER_SHIFT;
		    buf[buf_size++] = (mode & PFDECAL_LAYER_OFFSET)? 1 : 0;
		    break;
		case STATE_ALPHAFUNC:
		    mode = pfGetGStateMode(gstate, state);
		    buf[buf_size++] = find_in_table(af_table, mode);
		    break;
		case STATE_CULLFACE:
		    mode = pfGetGStateMode(gstate, state);
		    buf[buf_size++] = find_in_table(cf_table, mode);
		    break;

		case STATE_ENTEXTURE:
		case STATE_ENTEXGEN:
		case STATE_ENTEXLOD:
		case STATE_ENTEXMAT:
		    for (j = 0 ; j < glb->maxTextures ; j ++)
		    {
		        mode = pfGetGStateMultiMode(gstate, state, j);
			buf[buf_size++] = find_in_table(oo_table, mode);
		    }
		    break;
		case STATE_ENLIGHTING:
		case STATE_ENFOG:
		case STATE_ENWIREFRAME:
		case STATE_ENCOLORTABLE:
		case STATE_ENHIGHLIGHTING:
		case STATE_ENLPOINTSTATE:
		case STATE_ENVTXPROG:
		case STATE_ENFRAGPROG:
	        case STATE_ENSHADPROG:
		    mode = pfGetGStateMode(gstate, state);
		    buf[buf_size++] = find_in_table(oo_table, mode);
		    break;

		/*
		 *  Values
		 */
		case STATE_ALPHAREF:
		    ((float *)buf)[buf_size++] = pfGetGStateVal(gstate, state);
		    break;

		/*
		 *  Attributes
		 */
		case STATE_FRONTMTL:
		    data = pfGetGStateAttr(gstate, state);
		    buf[buf_size++] = find_in_list(L_MTL, data, glb);
		    break;
		case STATE_BACKMTL:
		    data = pfGetGStateAttr(gstate, state);
		    buf[buf_size++] = find_in_list(L_MTL, data, glb);
		    break;
		case STATE_TEXTURE:
		  for (j = 0 ; j < glb->maxTextures ; j ++)
		    {
		        data = pfGetGStateMultiAttr(gstate, state, j);
		        if (data)
			  buf[buf_size++] = find_in_list(L_TEX, data, glb);
		        else
			  buf[buf_size++] = (-1);
		    }
		    break;
		case STATE_TEXENV:
		  for (j = 0 ; j < glb->maxTextures ; j ++)
		    {
		        data = pfGetGStateMultiAttr(gstate, state, j);
			if (data)
			  buf[buf_size++] = find_in_list(L_TENV, data, glb);
			else
			  buf[buf_size++] = (-1);
		    }
		    break;
		case STATE_FOG:
		    data = pfGetGStateAttr(gstate, state);
		    buf[buf_size++] = find_in_list(L_FOG, data, glb);
		    break;
		case STATE_LIGHTMODEL:
		    data = pfGetGStateAttr(gstate, state);
		    buf[buf_size++] = find_in_list(L_LMODEL, data, glb);
		    break;
		case STATE_LIGHTS:
		    {
			pfLight **lights;
			int j;

			buf[buf_size++] = PF_MAX_LIGHTS;

			lights = pfGetGStateAttr(gstate, state);
			for (j = 0; j < PF_MAX_LIGHTS; j++)
			    buf[buf_size++] = find_in_list(L_LIGHT, lights[j],
							   glb);
		    }
		    break;
		case STATE_COLORTABLE:
		    data = pfGetGStateAttr(gstate, state);
		    buf[buf_size++] = find_in_list(L_CTAB, data, glb);
		    break;
		case STATE_HIGHLIGHT:
		    data = pfGetGStateAttr(gstate, state);
		    buf[buf_size++] = find_in_list(L_HLIGHT, data, glb);
		    break;
		case STATE_LPOINTSTATE:
		    data = pfGetGStateAttr(gstate, state);
		    buf[buf_size++] = find_in_list(L_LPSTATE, data, glb);
		    break;
		case STATE_TEXGEN:
		  for (j = 0 ; j < glb->maxTextures ; j ++)
		    {
		        data = pfGetGStateMultiAttr(gstate, state, j);
			if (data)
			    buf[buf_size++] = find_in_list(L_TGEN, data, glb);
			else
			    buf[buf_size++] = (-1);
		    }
		    break;
		case STATE_TEXLOD:
		  for (j = 0 ; j < glb->maxTextures ; j ++)
		    {
		        data = pfGetGStateMultiAttr(gstate, state, j);
			if (data)
			    buf[buf_size++] = find_in_list(L_TLOD, data, glb);
			else
			    buf[buf_size++] = (-1);
		    }
		    break;
	        case STATE_SHADPROG:
		    data = pfGetGStateAttr(gstate, state);
		    buf[buf_size++] = find_in_list(L_SHADPROG, data, glb);
		    break;
		case STATE_VERTEX_PROGRAM:
		case STATE_FRAGMENT_PROGRAM:
		    data = pfGetGStateAttr(gstate, state);
		    buf[buf_size++] = find_in_list(L_GPROG, data, glb);
		    break;
		case STATE_GPROGPARMS:
		    {
		        int count, j, pos;

			count = 0;
			pos = buf_size++; /* store count later */

			for(j=0; j<PF_N_GPPARMS; j++)
			    if(data = pfGetGStateMultiAttr(gstate, state, j))
			    {
			        count++;

				buf[buf_size++] = j;
				buf[buf_size++] = find_in_list(L_GPROGPARM,
							       data, glb);
			    }

			buf[pos] = count;
			break;
		    }
		case STATE_TEXMAT:
		    {
			pfMatrix *m;

			/* The first word in the coding of texture matrix
			// if a flag: '1' if we have a matrix for texture
			// unit # i. (New for perf 2.4) */

			  for (j = 0 ; j < glb->maxTextures ; j ++)
			{
			    m = (pfMatrix *)pfGetGStateMultiAttr(gstate,
								 state, j);

			    if (m)
			    {
				buf[buf_size++] = 1;
				((float *)buf)[buf_size++] = (*m)[0][0];
				((float *)buf)[buf_size++] = (*m)[0][1];
				((float *)buf)[buf_size++] = (*m)[0][2];
				((float *)buf)[buf_size++] = (*m)[0][3];
				((float *)buf)[buf_size++] = (*m)[1][0];
				((float *)buf)[buf_size++] = (*m)[1][1];
				((float *)buf)[buf_size++] = (*m)[1][2];
				((float *)buf)[buf_size++] = (*m)[1][3];
				((float *)buf)[buf_size++] = (*m)[2][0];
				((float *)buf)[buf_size++] = (*m)[2][1];
				((float *)buf)[buf_size++] = (*m)[2][2];
				((float *)buf)[buf_size++] = (*m)[2][3];
				((float *)buf)[buf_size++] = (*m)[3][0];
				((float *)buf)[buf_size++] = (*m)[3][1];
				((float *)buf)[buf_size++] = (*m)[3][2];
				((float *)buf)[buf_size++] = (*m)[3][3];
			    }
			    else
				buf[buf_size++] = 0;
			}
		    }
		    break;
	    }
	}
    }

    buf[buf_size++] = get_udata((pfObject*)gstate, glb);

    fwrite(&buf_size, sizeof(int), 1, glb->ofp);
    fwrite(buf, sizeof(int), buf_size, glb->ofp);
}


static int pfb_write_slist_header(void *data, int size, pfa_global_t *glb)
{
    int buf[3];
    pfFlux *flux;
    pfCycleBuffer *cbuf;

    if (data && (flux = pfGetFlux(data)))
    {
	buf[0] = 0;
	buf[1] = MEM_FLUX;
	buf[2] = find_in_list(L_FLUX, flux, glb);
    }
    else if (cbuf = pfGetCBuffer(data))
    {
	buf[0] = size;
	buf[1] = MEM_CBUF;
	buf[2] = get_udata((pfObject*)cbuf, glb);
    }
    else
    {
	buf[0] = size;
	buf[1] = MEM_ARENA;
	buf[2] = -1;
    }

    fwrite(&buf, sizeof(int), 3, glb->ofp);

    if (buf[1] == MEM_FLUX)
	return 0;
    else
	return 1;
}


static void pfb_write_llist(int *llist, int size, pfa_global_t *glb)
{
    if (pfb_write_slist_header(llist, size, glb))
	fwrite(llist, sizeof(int), size, glb->ofp);
}


static void pfb_write_vlist(pfVec3 *vlist, int size, pfa_global_t *glb)
{
    if (pfb_write_slist_header(vlist, size, glb))
    {
	if (glb->crypt_key)
	{
	    pfVec3 *tmp_vlist;

	    tmp_vlist = (pfVec3 *)malloc(size * sizeof(pfVec3));
	    glb->encrypt_func(size * (int)sizeof(pfVec3), glb->crypt_key,
			  vlist, tmp_vlist);
	    fwrite(tmp_vlist, sizeof(pfVec3), size, glb->ofp);
	    free(tmp_vlist);
	}
	else
	    fwrite(vlist, sizeof(pfVec3), size, glb->ofp);
    }
}



static void pfb_write_clist(pfVec4 *clist, int size, pfa_global_t *glb)
{
    if (pfb_write_slist_header(clist, size, glb))
	fwrite(clist, sizeof(pfVec4), size, glb->ofp);
}



static void pfb_write_nlist(pfVec3 *nlist, int size, pfa_global_t *glb)
{
    if (pfb_write_slist_header(nlist, size, glb))
	fwrite(nlist, sizeof(pfVec3), size, glb->ofp);
}



static void pfb_write_tlist(pfVec2 *tlist, int size, pfa_global_t *glb)
{
    if (pfb_write_slist_header(tlist, size, glb))
	fwrite(tlist, sizeof(pfVec2), size, glb->ofp);
}



static void pfb_write_ilist(ushort *ilist, int size, pfa_global_t *glb)
{
    if (pfb_write_slist_header(ilist, size, glb))
	fwrite(ilist, sizeof(ushort), size, glb->ofp);
}



static void pfb_write_gset(pfGeoSet *gset, pfa_global_t *glb)
{
    pfVec4 	*clist;
    pfVec3 	*nlist, *vlist;
    pfVec2 	*tlist;
    ushort 	*ilist;
    pfPlane 	*plane;
    gset_t 	g;
    int		i;

    g.ptype = find_in_table(gspt_table, pfGetGSetPrimType(gset));
    g.pcount = pfGetGSetNumPrims(gset);
    g.llist = find_in_list(L_LLIST, pfGetGSetPrimLengths(gset), glb);
    pfGetGSetAttrLists(gset, PFGS_COORD3, (void **)&vlist, &ilist);
    g.vlist[0] = find_in_table(gsb_table, pfGetGSetAttrBind(gset, PFGS_COORD3));
    g.vlist[1] = find_in_list(L_VLIST, vlist, glb);
    g.vlist[2] = find_in_list(L_ILIST, ilist, glb);
    pfGetGSetAttrLists(gset, PFGS_COLOR4, (void **)&clist, &ilist);
    g.clist[0] = find_in_table(gsb_table, pfGetGSetAttrBind(gset, PFGS_COLOR4));
    g.clist[1] = find_in_list(L_CLIST, clist, glb);
    g.clist[2] = find_in_list(L_ILIST, ilist, glb);
    pfGetGSetAttrLists(gset, PFGS_NORMAL3, (void **)&nlist, &ilist);
    g.nlist[0] = find_in_table(gsb_table,
			       pfGetGSetAttrBind(gset, PFGS_NORMAL3));
    g.nlist[1] = find_in_list(L_NLIST, nlist, glb);
    g.nlist[2] = find_in_list(L_ILIST, ilist, glb);
    pfGetGSetAttrLists(gset, PFGS_TEXCOORD2, (void **)&tlist, &ilist);
    g.tlist[0] = find_in_table(gsb_table,
			       pfGetGSetAttrBind(gset, PFGS_TEXCOORD2));
    g.tlist[1] = find_in_list(L_TLIST, tlist, glb);
    g.tlist[2] = find_in_list(L_ILIST, ilist, glb);
    g.draw_mode[0] = find_in_table(oo_table,
				   pfGetGSetDrawMode(gset, PFGS_FLATSHADE));
    g.draw_mode[1] = find_in_table(oo_table,
				   pfGetGSetDrawMode(gset, PFGS_WIREFRAME));
    g.draw_mode[2] = find_in_table(oo_table,
				   pfGetGSetDrawMode(gset, PFGS_COMPILE_GL));
    g.gstate[0] = find_in_list(L_GSTATE, pfGetGSetGState(gset), glb);
    g.gstate[1] = pfGetGSetGStateIndex(gset);
    g.line_width = pfGetGSetLineWidth(gset);
    g.point_size = pfGetGSetPntSize(gset);
    g.draw_bin = pfGetGSetDrawBin(gset);
    g.isect_mask = pfGetGSetIsectMask(gset);
    g.hlight = find_in_list(L_HLIGHT, pfGetGSetHlight(gset), glb);
    g.bbox_mode = find_in_table(bound_table, pfGetGSetBBox(gset, &g.bbox));
    g.udata = get_udata((pfObject*)gset, glb);
    g.draw_order = pfGetGSetDrawOrder(gset);
    plane = pfGetGSetDecalPlane(gset);
    if (plane != NULL)
    {
	g.decal_plane = 0;
	PFCOPY_VEC3(g.dplane_normal, plane->normal);
	g.dplane_offset = plane->offset;
    }
    else
    {
	g.decal_plane = -1;
	PFSET_VEC3(g.dplane_normal, 0.0f, 0.0f, 0.0f);
	g.dplane_offset = 0.0f;
    }
    g.bbox_flux = find_in_list(L_FLUX, pfGetGSetBBoxFlux(gset), glb);

    /*
     * Fill in multi-texture coordinates - for texture units #1 and up.
     * (unit #0 alredy taken care of above).
     */
    for (i = 1 ; i < 4 ; i ++)
    {
	pfGetGSetMultiAttrLists
		(gset, PFGS_TEXCOORD2, i, (void **)&tlist, &ilist);
	g.multi_tlist[3 * (i - 1)] = find_in_table(gsb_table,
			       pfGetGSetMultiAttrBind(gset, PFGS_TEXCOORD2, i));

	g.multi_tlist[3 * (i - 1) + 1] = find_in_list(L_TLIST, tlist, glb);
	g.multi_tlist[3 * (i - 1) + 2] = find_in_list(L_ILIST, ilist, glb);
    }

    for (i = 4 ; i < glb->maxTextures ; i ++)
    {
	pfGetGSetMultiAttrLists
		(gset, PFGS_TEXCOORD2, i, (void **)&tlist, &ilist);
	g.multi_tlist2[3 * (i - 4)] = find_in_table(gsb_table,
			       pfGetGSetMultiAttrBind(gset, PFGS_TEXCOORD2, i));

	g.multi_tlist2[3 * (i - 4) + 1] = find_in_list(L_TLIST, tlist, glb);
	g.multi_tlist2[3 * (i - 4) + 2] = find_in_list(L_ILIST, ilist, glb);
    }

    {
      islAppearance *app = pfGetGSetAppearance(gset);
      if(app)
	g.appearance = find_in_list(L_APPEARANCE, app, glb);
      else
	g.appearance = -1;
    }

    fwrite(&g, sizeof(gset_t), 1, glb->ofp);
}



static void pfb_write_image(uint *image, int comp, pfa_global_t *glb)
{
    int buf[5];

    buf[0] = (int)pfGetSize(image);
    buf[1] = comp & COMPONMENT_MASK;
    buf[2] = (comp & FOUR_BYTE_COMPONENTS)? 4 :
	((comp & TWO_BYTE_COMPONENTS)? 2 : 1);
    buf[3] = COMPONENT_ORDER;
    buf[4] = (comp & ROW_SIZE_MASK) >> ROW_SIZE_SHIFT;
    fwrite(buf, sizeof(int), 5, glb->ofp);

    if (glb->crypt_key)
    {
	uint *tmp_image;

	tmp_image = (uint *)malloc(buf[0]);
	glb->encrypt_func(buf[0], glb->crypt_key, image, tmp_image);
	fwrite(tmp_image, 1, buf[0], glb->ofp);
	free(tmp_image);
    }
    else
	fwrite(image, 1, buf[0], glb->ofp);
}


static void pfb_write_node(pfNode *node, int custom, pfa_global_t *glb)
{
    int i, count, vary;
    int t1, t2, t3;
    float f1;
    pfVec3 v1;
    float *vp;
    pfSphere sphere;
    int buf_size, spaceReqmnt = -1;
    int *buf;
    node_trav_t nt;

    buf_size = 0;
    buf = glb->buf;

    if (pfIsOfType(node, pfGetGroupClassType()))
    {
	count = pfGetNumChildren((pfGroup *)node);
	buf = GET_BUF(count * 3 + 128);

	if (pfIsOfType(node, pfGetSwitchClassType()))
	{
	    buf[buf_size++] = N_SWITCH | custom;
	    t1 = pfGetSwitchVal((pfSwitch*)node);
	    if (t1 == PFSWITCH_OFF)
		t1 = PFB_SWITCH_OFF;
	    else if (t1 == PFSWITCH_ON)
		t1 = PFB_SWITCH_ON;
	    buf[buf_size++] = t1;
	    buf[buf_size++] = find_in_list(L_FLUX,
					   pfGetSwitchValFlux((pfSwitch*)node),
					   glb);
	}
	else if (pfIsOfType(node, pfGetSCSClassType()))
	{
	    pfMatrix m;
	    uint m_type;

	    if (pfIsOfType(node, pfGetDCSClassType()))
	    {
		buf[buf_size++] = N_DCS | custom;
		m_type = pfGetDCSMatType((pfDCS *)node);
		if (m_type == PFDCS_UNCONSTRAINED)
		    ((uint*)buf)[buf_size++] = CS_UNCONSTRAINED;
		else
		    ((uint*)buf)[buf_size++] = to_table(mat_table, m_type);
		pfGetDCSMat((pfDCS *)node, m);
		((float *)buf)[buf_size++] = m[0][0];
		((float *)buf)[buf_size++] = m[0][1];
		((float *)buf)[buf_size++] = m[0][2];
		((float *)buf)[buf_size++] = m[0][3];
		((float *)buf)[buf_size++] = m[1][0];
		((float *)buf)[buf_size++] = m[1][1];
		((float *)buf)[buf_size++] = m[1][2];
		((float *)buf)[buf_size++] = m[1][3];
		((float *)buf)[buf_size++] = m[2][0];
		((float *)buf)[buf_size++] = m[2][1];
		((float *)buf)[buf_size++] = m[2][2];
		((float *)buf)[buf_size++] = m[2][3];
		((float *)buf)[buf_size++] = m[3][0];
		((float *)buf)[buf_size++] = m[3][1];
		((float *)buf)[buf_size++] = m[3][2];
		((float *)buf)[buf_size++] = m[3][3];
	    }
	    else if (pfIsOfType(node, pfGetFCSClassType()))
	    {
		buf[buf_size++] = N_FCS | custom;
		buf[buf_size++] = find_in_list(L_FLUX,
					       pfGetFCSFlux((pfFCS *)node),
					       glb);
		m_type = pfGetFCSMatType((pfFCS *)node);
		if (m_type == PFFCS_UNCONSTRAINED)
		    ((uint*)buf)[buf_size++] = CS_UNCONSTRAINED;
		else
		    ((uint *)buf)[buf_size++] = to_table(mat_table, m_type);
	    }
	    else /* SCS */
	    {
		buf[buf_size++] = N_SCS | custom;
		pfGetSCSMat((pfSCS *)node, m);
		((float *)buf)[buf_size++] = m[0][0];
		((float *)buf)[buf_size++] = m[0][1];
		((float *)buf)[buf_size++] = m[0][2];
		((float *)buf)[buf_size++] = m[0][3];
		((float *)buf)[buf_size++] = m[1][0];
		((float *)buf)[buf_size++] = m[1][1];
		((float *)buf)[buf_size++] = m[1][2];
		((float *)buf)[buf_size++] = m[1][3];
		((float *)buf)[buf_size++] = m[2][0];
		((float *)buf)[buf_size++] = m[2][1];
		((float *)buf)[buf_size++] = m[2][2];
		((float *)buf)[buf_size++] = m[2][3];
		((float *)buf)[buf_size++] = m[3][0];
		((float *)buf)[buf_size++] = m[3][1];
		((float *)buf)[buf_size++] = m[3][2];
		((float *)buf)[buf_size++] = m[3][3];
	    }
	}
	else if (pfIsOfType(node, pfGetDoubleSCSClassType()))
	{
	    pfMatrix4d 	m;
	    uint 	m_type;
	    double	dbuff[16];
	    int		dbuff_index;

	    if (pfIsOfType(node, pfGetDoubleDCSClassType()))
	    {
		buf[buf_size++] = N_DOUBLE_DCS | custom;
		m_type = pfGetDoubleDCSMatType((pfDoubleDCS *)node);
		if (m_type == PFDCS_UNCONSTRAINED)
		    ((uint*)buf)[buf_size++] = CS_UNCONSTRAINED;
		else
		    ((uint*)buf)[buf_size++] = to_table(mat_table, m_type);
		pfGetDoubleDCSMat((pfDoubleDCS *)node, m);

		/*
		 *	Must do double-copy because & buf[buf_size] may not
		 *	be a double-word address.
		 */
		dbuff_index = 0;
		dbuff[dbuff_index ++] = m[0][0];
		dbuff[dbuff_index ++] = m[0][1];
		dbuff[dbuff_index ++] = m[0][2];
		dbuff[dbuff_index ++] = m[0][3];
		dbuff[dbuff_index ++] = m[1][0];
		dbuff[dbuff_index ++] = m[1][1];
		dbuff[dbuff_index ++] = m[1][2];
		dbuff[dbuff_index ++] = m[1][3];
		dbuff[dbuff_index ++] = m[2][0];
		dbuff[dbuff_index ++] = m[2][1];
		dbuff[dbuff_index ++] = m[2][2];
		dbuff[dbuff_index ++] = m[2][3];
		dbuff[dbuff_index ++] = m[3][0];
		dbuff[dbuff_index ++] = m[3][1];
		dbuff[dbuff_index ++] = m[3][2];
		dbuff[dbuff_index ++] = m[3][3];

		memcpy (& buf[buf_size], dbuff, 16 * sizeof (double));
		buf_size += 32;
	    }
	    else if (pfIsOfType(node, pfGetDoubleFCSClassType()))
	    {
		buf[buf_size++] = N_DOUBLE_FCS | custom;
		buf[buf_size++] = find_in_list(L_FLUX,
					       pfGetDoubleFCSFlux
							((pfDoubleFCS *)node),
					       glb);
		m_type = pfGetDoubleFCSMatType((pfDoubleFCS *)node);
		if (m_type == PFFCS_UNCONSTRAINED)
		    ((uint*)buf)[buf_size++] = CS_UNCONSTRAINED;
		else
		    ((uint *)buf)[buf_size++] = to_table(mat_table, m_type);
	    }
	    else /* DoubleSCS */
	    {
		buf[buf_size++] = N_DOUBLE_SCS | custom;
		pfGetDoubleSCSMat((pfDoubleSCS *)node, m);

                /*
                 *      Must do double-copy because & buf[buf_size] may not
                 *      be a double-word address.
                 */
                dbuff_index = 0;
                dbuff[dbuff_index ++] = m[0][0];
                dbuff[dbuff_index ++] = m[0][1];
                dbuff[dbuff_index ++] = m[0][2];
                dbuff[dbuff_index ++] = m[0][3];
                dbuff[dbuff_index ++] = m[1][0];
                dbuff[dbuff_index ++] = m[1][1];
                dbuff[dbuff_index ++] = m[1][2];
                dbuff[dbuff_index ++] = m[1][3];
                dbuff[dbuff_index ++] = m[2][0];
                dbuff[dbuff_index ++] = m[2][1];
                dbuff[dbuff_index ++] = m[2][2];
                dbuff[dbuff_index ++] = m[2][3];
                dbuff[dbuff_index ++] = m[3][0];
                dbuff[dbuff_index ++] = m[3][1];
                dbuff[dbuff_index ++] = m[3][2];
                dbuff[dbuff_index ++] = m[3][3];

                memcpy (& buf[buf_size], dbuff, 16 * sizeof (double));
                buf_size += 32;
	    }
	}
	else if (pfIsOfType(node, pfGetLODClassType()))
	{
	    buf[buf_size++] = N_LOD | custom;
	    buf[buf_size++] = count;
	    for (i = 0; i <= count; i++)
		((float *)buf)[buf_size++] = pfGetLODRange((pfLOD *)node, i);
	    for (i = 0; i <= count; i++)
#ifdef XXX_FIXED_GET_LOD_TRANSITION_BUG
		((float *)buf)[buf_size++] = pfGetLODTransition((pfLOD*)node,i);
#else
	    {
		f1 = pfGetLODTransition((pfLOD*)node,i);
		if (f1 == -1)
		    f1 = pfGetLODTransition((pfLOD*)node, 0);
		((float *)buf)[buf_size++] = f1;
	    }
#endif
	    pfGetLODCenter((pfLOD *)node, v1);
	    ((float *)buf)[buf_size++] = v1[0];
	    ((float *)buf)[buf_size++] = v1[1];
	    ((float *)buf)[buf_size++] = v1[2];
	    buf[buf_size++] = find_in_list(L_LODSTATE,
					   pfGetLODLODState((pfLOD *)node),
					   glb);
	    buf[buf_size++] = pfGetLODLODStateIndex((pfLOD *)node);
	}
	else if (pfIsOfType(node, pfGetSeqClassType()))
	{
	    buf[buf_size++] = N_SEQUENCE | custom;
	    buf[buf_size++] = count;
	    for (i = 0; i < count; i++)
		((float *)buf)[buf_size++] = pfGetSeqTime((pfSequence*)node, i);
	    pfGetSeqInterval((pfSequence *)node, &t1, &t2, &t3);
	    buf[buf_size++] = find_in_table(sqi_table, t1);
	    buf[buf_size++] = t2;
	    buf[buf_size++] = t3;
	    pfGetSeqDuration((pfSequence *)node, &f1, &t1);
	    ((float *)buf)[buf_size++] = f1;
	    buf[buf_size++] = t1;
	    buf[buf_size++] = find_in_table(sqm_table,
					    pfGetSeqMode((pfSequence *)node));
	}
	else if (pfIsOfType(node, pfGetLayerClassType()))
	{
	    buf[buf_size++] = N_LAYER | custom;
	    t1 = pfGetLayerMode((pfLayer *)node);
	    buf[buf_size++] = find_in_table(layer_table,
					    t1 & PFDECAL_MODE_MASK);
	    buf[buf_size++] = (t1 & PFDECAL_LAYER_MASK) >> PFDECAL_LAYER_SHIFT;
	    buf[buf_size++] = (t1 & PFDECAL_LAYER_OFFSET)? 1 : 0;
	}
	else if (pfIsOfType(node, pfGetMorphClassType()))
	{
	    buf[buf_size++] = N_MORPH | custom;
	    buf[buf_size++] = find_in_list(L_MORPH, node, glb);
	}
	else if (pfIsOfType(node, pfGetPartClassType()))
	{
	    buf[buf_size++] = N_PARTITION | custom;
	    if (vp = pfGetPartAttr((pfPartition *)node, PFPART_MIN_SPACING))
	    {
		buf[buf_size++] = 1;
		((float *)buf)[buf_size++] = vp[0];
		((float *)buf)[buf_size++] = vp[1];
		((float *)buf)[buf_size++] = vp[2];
	    }
	    else
		buf[buf_size++] = 0;
	    if (vp = pfGetPartAttr((pfPartition *)node, PFPART_MAX_SPACING))
	    {
		buf[buf_size++] = 1;
		((float *)buf)[buf_size++] = vp[0];
		((float *)buf)[buf_size++] = vp[1];
		((float *)buf)[buf_size++] = vp[2];
	    }
	    else
		buf[buf_size++] = 0;
	    if (vp = pfGetPartAttr((pfPartition *)node, PFPART_ORIGIN))
	    {
		buf[buf_size++] = 1;
		((float *)buf)[buf_size++] = vp[0];
		((float *)buf)[buf_size++] = vp[1];
		((float *)buf)[buf_size++] = vp[2];
	    }
	    else
		buf[buf_size++] = 0;
	    ((float *)buf)[buf_size++] = pfGetPartVal((pfPartition *)node,
						      PFPART_FINENESS);
	}
	else if (pfIsOfType(node, pfGetSceneClassType()))
	{
	    buf[buf_size++] = N_SCENE | custom;
	    buf[buf_size++] = find_in_list(L_GSTATE,
					   pfGetSceneGState((pfScene *)node),
					   glb);
	    buf[buf_size++] = pfGetSceneGStateIndex((pfScene *)node);
	}
	else /* basic pfGroup */
	    buf[buf_size++] = N_GROUP | custom;

	buf[buf_size++] = count;
	for (i = 0; i < count; i++)
	    buf[buf_size++] = find_in_list(L_NODE, pfGetChild((pfGroup *)node, i), glb);
    }
    else if (!glb->subdivsurface_save_geosets &&
	     pfIsOfType(node, pfGetGeodeClassType()))
    {
	int tcount, isIBRnode, isIBRproxy = 0, storeTexCoords = 0, flags;
	int numGroups, viewsPerGroup;

	count = pfGetNumGSets((pfGeode *)node);

	isIBRnode = pfIsOfType(node, pfGetIBRnodeClassType());

	if (isIBRnode)
	{
	    int       size;
	    int       n, t;
	    pfIBRtexture *IBRtex;
	    pfDirData *viewData;

	    IBRtex = pfGetIBRnodeIBRtexture((pfIBRnode *)node);

	    isIBRproxy = pfGetIBRtextureFlags(IBRtex, PFIBR_USE_PROXY);
	    storeTexCoords = isIBRproxy ||
		pfGetIBRnodeFlags((pfIBRnode *)node, PFIBRN_TEXCOORDS_DEFINED);

	    size = 1; /* 1 for IBR texture */

	    /* size of angles */
	    size += 1 + 2 * pfGetIBRnodeNumAngles((pfIBRnode *)node);

	    flags = pfGetIBRnodeFlags((pfIBRnode *)node, 0xffffffff);

	    if(storeTexCoords)
	    {
		pfVec2    ***texCoords;
		pfVec3    *dummy;

		texCoords = pfGetIBRnodeProxyTexCoords((pfIBRnode *)node);

		viewData = pfGetIBRtextureDirData(IBRtex);

		numGroups = pfGetDirDataNumGroups(viewData, &viewsPerGroup);

		/* determine the size of the array of texture coordinates
		   in case of a pfIBRnode with proxy */
		size += 3;

		if(flags & PFIBRN_VARY_PROXY_GEOSETS)
		{
		    if(pfGetIBRtextureFlags(IBRtex, PFIBR_NEAREST))
		    {
			pfGetDirDataDirections(viewData, &numGroups,
					       &dummy);
			viewsPerGroup = 1;
		    }

		    /* varying geosets */
		    tcount = count / numGroups;
		    vary = 1;
		}
		else
		{
		    /* not varying geosets */
		    tcount = count;

		    pfGetDirDataDirections(viewData, &numGroups, &dummy);
		    viewsPerGroup = 1;
		    vary = 0;
		}

		for(t=0; t<numGroups; t++)
		{
		    /* for each geoset */
		    for(i=0; i<tcount; i++)
		    {
			size++; /* to store n */

			if(texCoords[t][i*viewsPerGroup] == NULL)
			    n = 0;
			else
			    n = getNumGSetVertices(pfGetGSet((pfGeode *)node,
						       i + t*tcount*vary));

			size += viewsPerGroup * n * 2;
		    }
		}
	    }

	    buf = GET_BUF(count * 4 + 128 + size);
	}
	else if (pfIsOfType(node, pfGetSubdivSurfaceClassType()))
	{
	    /* subdivision surface */
	    buf = GET_BUF(7+3+16); /* id, size, and 5 values + origin + matrix */
	} else if(glb->disable_rep_save == 0 &&
		  pfIsOfType(node, pfGetParaSurfaceClassType())) {
	  /* parametric surface */
	  spaceReqmnt =
	    calculateSpaceForSurface((pfParaSurface *)node);

	  if(pfIsOfType(node, pfGetNurbSurfaceClassType())) {
	    pfNurbSurface *nurbs = (pfNurbSurface *)node;
	    int uKnotCount, vKnotCount, uOrder, vOrder, uSize, vSize;

	    uKnotCount = pfGetNurbSurfaceUknotCount(nurbs);
	    vKnotCount = pfGetNurbSurfaceVknotCount(nurbs);
	    uOrder = pfGetNurbSurfaceUorder(nurbs);
	    vOrder = pfGetNurbSurfaceVorder(nurbs);

	    uSize = uKnotCount - uOrder;
	    vSize = vKnotCount - vOrder;

	    spaceReqmnt += (vSize+1)*(uSize+1)*4 + uKnotCount + vKnotCount + 4;
	  } else if(pfIsOfType(node, pfGetTorusSurfaceClassType())) {
	    spaceReqmnt += 2; /* minor radius + major radius */
	  } else if(pfIsOfType(node, pfGetSphereSurfaceClassType())) {
	    spaceReqmnt += 1; /* radius */
	  } else if(pfIsOfType(node, pfGetConeSurfaceClassType()) ||
		    pfIsOfType(node, pfGetCylinderSurfaceClassType())) {
	    spaceReqmnt += 2; /* radius + height */
	  } else if(pfIsOfType(node, pfGetPlaneSurfaceClassType())) {
	    spaceReqmnt += 3*3 + 2 + 1 + 1; /*3 pts + u1,v1,u2,v3 */
	  } else if(pfIsOfType(node, pfGetPieceWisePolySurfaceClassType())) {
	    int uPatchCount, vPatchCount, uOrder, vOrder, u, v;
	    pfPieceWisePolySurface *ppSurf =
	      (pfPieceWisePolySurface *)node;

	    uPatchCount = pfGetPieceWisePolySurfaceUpatchCount(ppSurf);
	    vPatchCount = pfGetPieceWisePolySurfaceVpatchCount(ppSurf);

	    spaceReqmnt += (uPatchCount * vPatchCount) * 2 + 2;

	    for(v=0; v<vPatchCount; v++) {
	      for(u=0; u<uPatchCount; u++) {
		uOrder = pfGetPieceWisePolySurfaceUorder(ppSurf,u,v);
		vOrder = pfGetPieceWisePolySurfaceVorder(ppSurf,u,v);
		spaceReqmnt += (uOrder+1) * (vOrder+1) * 3;
	      }
	    }
	  } else if(pfIsOfType(node, pfGetSweptSurfaceClassType())) {
	    spaceReqmnt += 5; /* 4 curves + scalar */
	    if(pfIsOfType(node, pfGetFrenetSweptSurfaceClassType()))
	      spaceReqmnt -= 2; /* don't store t & b curves */
	  } else if(pfIsOfType(node, pfGetCoonsSurfaceClassType())) {
	    spaceReqmnt += 4; /* four bounding curves */
	  } else if(pfIsOfType(node, pfGetRuledSurfaceClassType())) {
	    spaceReqmnt += 2; /* two bounding curves */
	  } else if(pfIsOfType(node, pfGetHsplineSurfaceClassType())) {
	    int uKnotCount, vKnotCount;
	    pfHsplineSurface *hSurf = (pfHsplineSurface *)node;

	    uKnotCount = pfGetHsplineSurfaceUknotCount(hSurf);
	    vKnotCount = pfGetHsplineSurfaceVknotCount(hSurf);

	    spaceReqmnt += uKnotCount * vKnotCount * 3 * 4 + uKnotCount +
	                   vKnotCount + 1 + 1 + 1;
	    /* last three are for holding uKnotCount, vKnotCount and
	     * cylindircal flag */
	  } else {
	    pfNotify(PFNFY_WARN,PFNFY_NOTICE,
		     "Unable to calculate length of buffer required to store "
		     "parametric surface of type %s. This is bad ...",
		     pfGetTypeName(pfGetType(node)));
	  }

	  spaceReqmnt += 3; /* id + size + geoSet-count values */

	  /* now allocate buffer for surface */

	  buf = GET_BUF(spaceReqmnt);
	} else if(pfIsOfType(node, pfGetRepClassType())) {
	  /* id + size + geoSet-count values and also rep_t data */
	  spaceReqmnt += 3 + sizeof(rep_t)/sizeof(int);
	  if(pfIsOfType(node, pfGetCurve3dClassType())) {

	    spaceReqmnt += sizeof(curve3d_t)/sizeof(int);

	    if(pfIsOfType(node, pfGetLine3dClassType())) {
	      spaceReqmnt += 8; /* x,y,z,t values twice */
	      if(pfIsOfType(node, pfGetOrientedLine3dClassType()))
		spaceReqmnt += 3; /* and three more vals for up pnt. */
	    } else if(pfIsOfType(node, pfGetNurbCurve3dClassType())) {
	      pfNurbCurve3d *nc = (pfNurbCurve3d *)node;
	      int knotCount, order, size;

	      knotCount = pfGetNurbCurve3dKnotCount(nc);
	      order     = pfGetNurbCurve3dOrder(nc);
	      size      = knotCount - order;

	      spaceReqmnt += (size+1) * 3 + knotCount + 4; /* XXX Alex what's the 4 for? */
	    } else if(pfIsOfType(node, pfGetPieceWisePolyCurve3dClassType())) {
	      pfPieceWisePolyCurve3d *c = (pfPieceWisePolyCurve3d *)node;
	      int patchCount, u;

	      patchCount = pfGetPieceWisePolyCurve3dPatchCount(c);
	      spaceReqmnt += 2 * patchCount + 2; /* limit pars for each patch, reverse flag
						   for entire curve and patch count */

	      for(u=0; u<patchCount; u++)
		spaceReqmnt += (pfGetPieceWisePolyCurve3dOrder(c,u) +1) * 3;
	    } else if(pfIsOfType(node, pfGetCompCurve3dClassType())) {
	      spaceReqmnt += 2; /* surface + 2d curve ids. */
	    } else if(pfIsOfType(node, pfGetCircle3dClassType())) {
	      spaceReqmnt += 1; /* radius */
	    } else if(pfIsOfType(node, pfGetSuperQuadCurve3dClassType())) {
	      spaceReqmnt += 2; /* radius + exponent */
	    } else {
	      pfNotify(PFNFY_WARN,PFNFY_PRINT,
		     "Unable to calculate length of buffer required to store"
		     "3d parametric curve of type %s. This is bad ...",
		       pfGetTypeName(pfGetType(node)));
	    }
	  }
	  /* some other (non parametric surface or 3d-curve) class type */
	  /* ZZZ Alex */
	}
	else
	    buf = GET_BUF(count * 4 + 128);

	if (pfIsOfType(node, pfGetBboardClassType()))
	{
	    pfFlux *flux;

	    if (pfIsOfType(node, pfGetIBRnodeClassType()))
		buf[buf_size++] = N_IBR_NODE | custom;
	    else
		buf[buf_size++] = N_BILLBOARD | custom;

	    if (flux = pfGetBboardPosFlux((pfBillboard *)node))
	    {
		buf[buf_size++] = BB_POS_FLUX;
		buf[buf_size++] = find_in_list(L_FLUX, flux, glb);
	    }
	    else
	    {
		buf[buf_size++] = count;
		if(isIBRproxy)
		{
		    /* only one position is used */
		    pfGetBboardPos((pfBillboard *)node, 0, v1);
		    for (i = 0; i < count; i++)
		    {
			((float *)buf)[buf_size++] = v1[0];
			((float *)buf)[buf_size++] = v1[1];
			((float *)buf)[buf_size++] = v1[2];
		    }
		}
		else
		{
		    for (i = 0; i < count; i++)
		    {
			pfGetBboardPos((pfBillboard *)node, i, v1);
			((float *)buf)[buf_size++] = v1[0];
			((float *)buf)[buf_size++] = v1[1];
			((float *)buf)[buf_size++] = v1[2];
		    }
		}
	    }
	    t1 = pfGetBboardMode((pfBillboard *)node, PFBB_ROT);
	    buf[buf_size++] = find_in_table(bbr_table, t1);
	    pfGetBboardAxis((pfBillboard *)node, v1);
	    ((float *)buf)[buf_size++] = v1[0];
	    ((float *)buf)[buf_size++] = v1[1];
	    ((float *)buf)[buf_size++] = v1[2];

	    if (isIBRnode)
	    {
		float a1, a2;
		int n;

		buf[buf_size++] =
		    find_in_list(L_IBR_TEX,
				 pfGetIBRnodeIBRtexture((pfIBRnode *)node),
				 glb);

		n = pfGetIBRnodeNumAngles((pfIBRnode *)node);
		buf[buf_size++] = n;

		for(i=0; i<n; i++)
		{
		    pfGetIBRnodeAngles((pfIBRnode *)node, i, &a1, &a2);
		    ((float *)buf)[buf_size++] = a1;
		    ((float *)buf)[buf_size++] = a2;
		}

		buf[buf_size++] = flags;

		if(storeTexCoords)
		{
		    int       j, t, v;
		    pfVec2    ***texCoords;

		    /* printf("writing proxy tex coords\n"); */

		    /* write the proxy texture coordinates */
		    texCoords = pfGetIBRnodeProxyTexCoords((pfIBRnode *)node);

		    /* store the number of geosets and the number of textures */
		    buf[buf_size++] = tcount;
		    buf[buf_size++] = numGroups;
		    buf[buf_size++] = viewsPerGroup;

		    /*printf("geosets %d, numtex %d\n", count, numTex);*/

		    for(t=0; t<numGroups; t++)
		    {
			/* for each geoset */
			for(i=0; i<tcount; i++)
			{
			    if(texCoords[t][i*viewsPerGroup] == NULL)
			    {
				/* store the number of vertices */
				buf[buf_size++] = 0;
				continue;
			    }

			    /* determine the number of vertices */
			    n = getNumGSetVertices(pfGetGSet((pfGeode *)node,
						       i + t*tcount*vary));

			    /* store the number of vertices */
			    buf[buf_size++] = n;

			    for(j=0; j<viewsPerGroup; j++)
			    {
				/*printf("geoset %d, texture %d\n", i, t);*/
				for(v=0; v<n; v++)
				{
				    ((float *)buf)[buf_size++] =
					texCoords[t][i*viewsPerGroup+j][v][0];
				    ((float *)buf)[buf_size++] =
					texCoords[t][i*viewsPerGroup+j][v][1];
				}
			    }
			}
		    }
		}
	    }
	}
	else if (pfIsOfType(node, pfGetSubdivSurfaceClassType()))
	{
	    if(glb->subdivsurface_save_geosets)
	    {
		/* save as simple geode if this flag is set */
		buf[buf_size++] = N_GEODE | custom;
		buf[buf_size++] = count;
	    }
	    else
	    {
		/* subdivision surface */
		pfSubdivSurface *surf = (pfSubdivSurface *)node;
		float val;

		buf[buf_size++] = N_SUBDIV_SURFACE | custom;

		buf[buf_size++] = 5 + 3 + 16;  /* 24 values */

		/* store pfRep stuff */
		{
		    pfVec3 vec;
		    pfMatrix m;
		    int     x,y;

		    pfGetRepOrigin((pfRep *)node, vec);

		    for(i=0; i<3; i++)
			((float *)buf)[buf_size++] = vec[i];


		    pfGetRepOrient((pfRep *)node, m);

		    for(y=0; y<4; y++)
			for(x=0; x<4; x++)
			    ((float *)buf)[buf_size++] = m[y][x];
		}

		buf[buf_size++] = pfGetSubdivSurfaceFlags(surf, 0xffffffff);

		pfGetSubdivSurfaceVal(surf, PFSB_SUBDIVISION_METHOD, &val);
		buf[buf_size++] = (int)val;

		pfGetSubdivSurfaceVal(surf, PFSB_SUBDIVISION_LEVEL, &val);
		buf[buf_size++] = (int)val;

		buf[buf_size++] =
		    find_in_list(L_MESH, pfGetSubdivSurfaceMesh(surf),  glb);

		count = 0; /* no geosets XXX decide based on a flag? - later */
		buf[buf_size++] = count;
	    }
	}
	else if(pfIsOfType(node, pfGetRepClassType())) {
	  if(glb->disable_rep_save) {
	    /* save as simple geode if this flag is set */
	    buf[buf_size++] = N_GEODE | custom;
	    buf[buf_size++] = count;
	  } else {
	    if (pfIsOfType(node, pfGetNurbSurfaceClassType()))
	    {
	      /* nurbs surface */
	      pfNurbSurface *nurbs = (pfNurbSurface *)node;
	      int uKnotCount, vKnotCount;
	      int uSize, vSize, ii, jj;
	      float weight;

	      buf[buf_size++] = N_NURB_SURFACE | custom;
	      buf[buf_size++] = spaceReqmnt;

	      pfb_write_parasurface((pfParaSurface *)node,glb,&buf_size);

	      uKnotCount = pfGetNurbSurfaceUknotCount(nurbs);
	      vKnotCount = pfGetNurbSurfaceVknotCount(nurbs);

	      uSize = pfGetNurbSurfaceControlHullUSize(nurbs);
	      vSize = pfGetNurbSurfaceControlHullVSize(nurbs);

	      buf[buf_size++] = uKnotCount;
	      buf[buf_size++] = vKnotCount;
	      buf[buf_size++] = uSize;
	      buf[buf_size++] = vSize;

	      /* write out ctrl points */
	      for(ii=0; ii<vSize; ii++) {
		for(jj=0; jj<uSize; jj++) {
		  const pfVec3 *cHull =pfGetNurbSurfaceControlHull(nurbs,jj,ii);
		  weight = pfGetNurbSurfaceWeight(nurbs,jj,ii);

		  ((float *)buf)[buf_size++] = (*cHull)[0];
		  ((float *)buf)[buf_size++] = (*cHull)[1];
		  ((float *)buf)[buf_size++] = (*cHull)[2];
		  ((float *)buf)[buf_size++] = weight;
		}
	      }

	      /* write out u and v knots */
	      for(ii=0; ii<uKnotCount; ii++)
		((float *)buf)[buf_size++] = pfGetNurbSurfaceUknot(nurbs,ii);

	      for(ii=0; ii<vKnotCount; ii++)
		((float *)buf)[buf_size++] = pfGetNurbSurfaceVknot(nurbs,ii);

	      buf[buf_size++] = count;
	    }
	    else if (pfIsOfType(node, pfGetTorusSurfaceClassType()))
	    {
	      /* torus surface */
	      pfTorusSurface *torus = (pfTorusSurface *)node;

	      buf[buf_size++] = N_TORUS | custom;
	      buf[buf_size++] = spaceReqmnt;

	      pfb_write_parasurface((pfParaSurface *)node,glb, &buf_size);

	      ((float *)buf)[buf_size++] = pfGetTorusSurfaceMinorRadius(torus);
	      ((float *)buf)[buf_size++] = pfGetTorusSurfaceMajorRadius(torus);

	      buf[buf_size++] = count;
	    }
	    else if (pfIsOfType(node, pfGetSphereSurfaceClassType()))
	    {
	      /* sphere surface */
	      pfSphereSurface *sphere = (pfSphereSurface *)node;

	      buf[buf_size++] = N_SPHERE_SURF | custom;
	      buf[buf_size++] = spaceReqmnt;

	      pfb_write_parasurface((pfParaSurface *)node,glb, &buf_size);

	      ((float *)buf)[buf_size++] = pfGetSphereSurfaceRadius(sphere);

	      buf[buf_size++] = count;
	    }
	    else if (pfIsOfType(node, pfGetConeSurfaceClassType()))
	    {
	      /* cone surface */
	      pfConeSurface *cone = (pfConeSurface *)node;

	      buf[buf_size++] = N_CONE | custom;
	      buf[buf_size++] = spaceReqmnt;

	      pfb_write_parasurface((pfParaSurface *)node,glb, &buf_size);

	      ((float *)buf)[buf_size++] = pfGetConeSurfaceRadius(cone);
	      ((float *)buf)[buf_size++] = pfGetConeSurfaceHeight(cone);

	      buf[buf_size++] = count;
	    }
	    else if (pfIsOfType(node, pfGetCylinderSurfaceClassType()))
	    {
	      /* cylinder surface */
	      pfCylinderSurface *cylinder = (pfCylinderSurface *)node;

	      buf[buf_size++] = N_CYLINDER | custom;
	      buf[buf_size++] = spaceReqmnt;

	      pfb_write_parasurface((pfParaSurface *)node,glb, &buf_size);

	      ((float *)buf)[buf_size++] = pfGetCylinderSurfaceRadius(cylinder);
	      ((float *)buf)[buf_size++] = pfGetCylinderSurfaceHeight(cylinder);

	      buf[buf_size++] = count;
	    }
	    else if (pfIsOfType(node, pfGetPlaneSurfaceClassType()))
	    {
	      /* planar surface */
	      pfPlaneSurface *plane = (pfPlaneSurface *)node;
	      float vals[5];

	      buf[buf_size++] = N_PLANE_SURF | custom;
	      buf[buf_size++] = spaceReqmnt;

	      pfb_write_parasurface((pfParaSurface *)node,glb, &buf_size);

	      pfGetPlaneSurfacePoint1(plane, &(vals[0]), &(vals[1]), &(vals[2]),
				   &(vals[3]), &(vals[4]));
	      ((float *)buf)[buf_size++] = vals[0];
	      ((float *)buf)[buf_size++] = vals[1];
	      ((float *)buf)[buf_size++] = vals[2];
	      ((float *)buf)[buf_size++] = vals[3];
	      ((float *)buf)[buf_size++] = vals[4];

	      pfGetPlaneSurfacePoint2(plane, &(vals[0]), &(vals[1]), &(vals[2]),
				   &(vals[3]));
	      ((float *)buf)[buf_size++] = vals[0];
	      ((float *)buf)[buf_size++] = vals[1];
	      ((float *)buf)[buf_size++] = vals[2];
	      ((float *)buf)[buf_size++] = vals[3];

	      pfGetPlaneSurfacePoint3(plane, &(vals[0]), &(vals[1]), &(vals[2]),
				   &(vals[3]));
	      ((float *)buf)[buf_size++] = vals[0];
	      ((float *)buf)[buf_size++] = vals[1];
	      ((float *)buf)[buf_size++] = vals[2];
	      ((float *)buf)[buf_size++] = vals[3];

	      buf[buf_size++] = count;
	    }
	    else if (pfIsOfType(node, pfGetPieceWisePolySurfaceClassType()))
	    {
	      pfPieceWisePolySurface *ppSurf = (pfPieceWisePolySurface *)node;

	      buf[buf_size++] = N_PIECEWISEPOLYSURFACE | custom;
	      buf[buf_size++] = spaceReqmnt;

	      pfb_write_parasurface((pfParaSurface *)node,glb, &buf_size);

	      {
		int uPatchCount, vPatchCount, uOrder, vOrder, u, v, uu, vv;
		pfVec3 *cHull = NULL;

		uPatchCount = pfGetPieceWisePolySurfaceUpatchCount(ppSurf);
		vPatchCount = pfGetPieceWisePolySurfaceVpatchCount(ppSurf);

		buf[buf_size++] = uPatchCount;
		buf[buf_size++] = vPatchCount;

		for(v=0; v<vPatchCount; v++) {
		  for(u=0; u<uPatchCount; u++) {
		    uOrder = pfGetPieceWisePolySurfaceUorder(ppSurf, u, v);
		    vOrder = pfGetPieceWisePolySurfaceVorder(ppSurf, u, v);

		    buf[buf_size++] = uOrder;
		    buf[buf_size++] = vOrder;

		    for(vv=0; vv<vOrder; vv++) {
		      for(uu=0; uu<uOrder; uu++) {
			cHull =
		      pfGetPieceWisePolySurfaceControlHull(ppSurf,u,v,uu,vv);

			((float *)buf)[buf_size++] = (*cHull)[0];
			((float *)buf)[buf_size++] = (*cHull)[1];
			((float *)buf)[buf_size++] = (*cHull)[2];
		      }
		    }
		  }
		}
	      }

	      buf[buf_size++] = count;
	    }
	    else if (pfIsOfType(node, pfGetSweptSurfaceClassType())) {
	      int isFrenet = 0;
	      pfSweptSurface *ss = (pfSweptSurface *)node;
	      pfCurve3d *_crossSection = NULL, *_path = NULL, *_t = NULL, *_b = NULL;
	      pfScalar *_scalar = NULL;

	      isFrenet = pfIsOfType(node, pfGetFrenetSweptSurfaceClassType());

	      if(isFrenet)
		buf[buf_size++] = N_FRENET_SWEPT_SURFACE | custom;
	      else
		buf[buf_size++] = N_SWEPT_SURFACE | custom;
	      buf[buf_size++] = spaceReqmnt;

	      pfb_write_parasurface((pfParaSurface *)node,glb, &buf_size);

	      _crossSection = (pfCurve3d *)pfGetMemory(pfGetSweptSurfaceCrossSection(ss));
	      _path         = (pfCurve3d *)pfGetMemory(pfGetSweptSurfacePath(ss));
	      if(!isFrenet) {
		_t          = (pfCurve3d *)pfGetMemory(pfGetSweptSurfaceT(ss));
		_b          = (pfCurve3d *)pfGetMemory(pfGetSweptSurfaceB(ss));
	      }
	      _scalar       = (pfScalar  *)pfGetSweptSurfaceProf(ss);

	      buf[buf_size++] = find_in_list(L_NODE, _crossSection, glb);
	      buf[buf_size++] = find_in_list(L_NODE, _path, glb);

	      if(!isFrenet) {
		buf[buf_size++] = find_in_list(L_NODE, _t, glb);
		buf[buf_size++] = find_in_list(L_NODE, _b, glb);
	      }
	      buf[buf_size++] = find_in_list(L_SCALAR, _scalar, glb);

	      buf[buf_size++] = count;
	    }
	    else if(pfIsOfType(node, pfGetCoonsSurfaceClassType())) {
	      pfCoonsSurface *coons = (pfCoonsSurface *)node;
	      pfCurve3d *_r = NULL, *_l = NULL, *_b = NULL, *_t = NULL;

	      buf[buf_size++] = N_COONS | custom;
	      buf[buf_size++] = spaceReqmnt;

	      pfb_write_parasurface((pfParaSurface *)node, glb, &buf_size);

	      _r = pfGetCoonsSurfaceRight (coons);
	      _l = pfGetCoonsSurfaceLeft  (coons);
	      _b = pfGetCoonsSurfaceBottom(coons);
	      _t = pfGetCoonsSurfaceTop   (coons);

	      buf[buf_size++] = find_in_list(L_NODE, _r, glb);
	      buf[buf_size++] = find_in_list(L_NODE, _l, glb);
	      buf[buf_size++] = find_in_list(L_NODE, _b, glb);
	      buf[buf_size++] = find_in_list(L_NODE, _t, glb);

	      buf[buf_size++] = count;
	    }
	    else if(pfIsOfType(node, pfGetHsplineSurfaceClassType())) {
	      pfHsplineSurface *hSurf = (pfHsplineSurface *)node;
	      int uKnotCount, vKnotCount, _i, _j;
	      pfVec3 v;

	      buf[buf_size++] = N_HSPLINE_SURFACE | custom;
	      buf[buf_size++] = spaceReqmnt;

	      pfb_write_parasurface((pfParaSurface *)node, glb, &buf_size);

	      uKnotCount = pfGetHsplineSurfaceUknotCount(hSurf);
	      vKnotCount = pfGetHsplineSurfaceVknotCount(hSurf);

	      buf[buf_size++] = uKnotCount;
	      buf[buf_size++] = vKnotCount;
	      buf[buf_size++] = pfGetHsplineSurfaceCylindrical(hSurf);

	      for(_i=0; _i<uKnotCount; _i++) {
		for(_j=0; _j<vKnotCount; _j++) {
		  pfGetHsplineSurfaceP(hSurf, _i, _j, v);
		  ((float *)buf)[buf_size++] = v[0];
		  ((float *)buf)[buf_size++] = v[1];
		  ((float *)buf)[buf_size++] = v[2];
		}
	      }

	      for(_i=0; _i<uKnotCount; _i++) {
		for(_j=0; _j<vKnotCount; _j++) {
		  pfGetHsplineSurfaceTu(hSurf, _i, _j, v);
		  ((float *)buf)[buf_size++] = v[0];
		  ((float *)buf)[buf_size++] = v[1];
		  ((float *)buf)[buf_size++] = v[2];
		}
	      }

	      for(_i=0; _i<uKnotCount; _i++) {
		for(_j=0; _j<vKnotCount; _j++) {
		  pfGetHsplineSurfaceTv(hSurf, _i, _j, v);
		  ((float *)buf)[buf_size++] = v[0];
		  ((float *)buf)[buf_size++] = v[1];
		  ((float *)buf)[buf_size++] = v[2];
		}
	      }

	      for(_i=0; _i<uKnotCount; _i++) {
		for(_j=0; _j<vKnotCount; _j++) {
		  pfGetHsplineSurfaceTuv(hSurf, _i, _j, v);
		  ((float *)buf)[buf_size++] = v[0];
		  ((float *)buf)[buf_size++] = v[1];
		  ((float *)buf)[buf_size++] = v[2];
		}
	      }

	      for(_i=0; _i<uKnotCount; _i++)
		((float *)buf)[buf_size++] =
	          pfGetHsplineSurfaceUknot(hSurf, _i);

	      for(_i=0; _i<vKnotCount; _i++)
		((float *)buf)[buf_size++] =
	          pfGetHsplineSurfaceVknot(hSurf, _i);

	      buf[buf_size++] = count;
	    }
	    else if(pfIsOfType(node, pfGetRuledSurfaceClassType())) {
	      pfRuledSurface *ruled = (pfRuledSurface *)node;
	      pfCurve3d *_c1 = NULL, *_c2 = NULL;

	      buf[buf_size++] = N_RULED | custom;
	      buf[buf_size++] = spaceReqmnt;

	      pfb_write_parasurface((pfParaSurface *)node, glb, &buf_size);

	      _c1 = (pfCurve3d *)pfGetMemory(pfGetRuledSurfaceCurve1(ruled));
	      _c2 = (pfCurve3d *)pfGetMemory(pfGetRuledSurfaceCurve2(ruled));

	      buf[buf_size++] = find_in_list(L_NODE, _c1, glb);
	      buf[buf_size++] = find_in_list(L_NODE, _c2, glb);

	      count = pfGetNumGSets((pfGeode *)node);
	      buf[buf_size++] = count;
	    }
	    else if (pfIsOfType(node, pfGetNurbCurve3dClassType()))
	    {
	      /* pfNurbCurve3d */
	      pfNurbCurve3d *nc = (pfNurbCurve3d *)node;

	      buf[buf_size++] = N_NURB_CURVE3D | custom;
	      buf[buf_size++] = spaceReqmnt;

	      pfb_write_nurb_curve3d(nc,glb,&buf_size);

	      count = pfGetNumGSets((pfGeode *)node);
	      buf[buf_size++] = count;
	    }
	    else if (pfIsOfType(node, pfGetLine3dClassType()))
	    {
	      pfLine3d *line = (pfLine3d *)node;

	      if(pfIsOfType(node, pfGetOrientedLine3dClassType()))
		buf[buf_size++] = N_ORIENTEDLINE3D | custom;
	      else
		buf[buf_size++] = N_LINE3D | custom;
	      buf[buf_size++] = spaceReqmnt;

	      pfb_write_curve3d((pfCurve3d *)line, glb, &buf_size);

	      {
		pfReal x,y,z,t;

		pfGetLine3dPoint1(line, &x, &y, &z, &t);
		((float *)buf)[buf_size++] = x;
		((float *)buf)[buf_size++] = y;
		((float *)buf)[buf_size++] = z;
		((float *)buf)[buf_size++] = t;

		pfGetLine3dPoint2(line, &x, &y, &z, &t);
		((float *)buf)[buf_size++] = x;
		((float *)buf)[buf_size++] = y;
		((float *)buf)[buf_size++] = z;
		((float *)buf)[buf_size++] = t;

		if(pfIsOfType(node, pfGetOrientedLine3dClassType())) {
		  pfGetOrientedLine3dUpPoint((pfOrientedLine3d *)line,
					     &x,&y,&z);
		  ((float *)buf)[buf_size++] = x;
		  ((float *)buf)[buf_size++] = y;
		  ((float *)buf)[buf_size++] = z;
		}
	      }

	      count = pfGetNumGSets((pfGeode *)node);
	      buf[buf_size++] = count;
	    }
	    else if (pfIsOfType(node, pfGetCircle3dClassType()))
	    {
	      pfCircle3d *circle = (pfCircle3d *)node;

	      buf[buf_size++] = N_CIRCLE3D | custom;
	      buf[buf_size++] = spaceReqmnt;

	      pfb_write_curve3d((pfCurve3d *)circle, glb, &buf_size);

	      ((float *)buf)[buf_size++] = pfGetCircle3dRadius(circle);

	      count = pfGetNumGSets((pfGeode *)node);
	      buf[buf_size++] = count;
	    }
	    else if (pfIsOfType(node, pfGetSuperQuadCurve3dClassType()))
	    {
	      pfSuperQuadCurve3d *curve = (pfSuperQuadCurve3d *)node;

	      buf[buf_size++] = N_SUPERQUADCURVE3D | custom;
	      buf[buf_size++] = spaceReqmnt;

	      pfb_write_curve3d((pfCurve3d *)curve, glb, &buf_size);

	      ((float *)buf)[buf_size++] = pfGetSuperQuadCurve3dRadius(curve);
	      ((float *)buf)[buf_size++] = pfGetSuperQuadCurve3dExponent(curve);

	      count = pfGetNumGSets((pfGeode *)node);
	      buf[buf_size++] = count;
	    }

	    else if (pfIsOfType(node, pfGetCompCurve3dClassType()))
	    {
	      pfCompositeCurve3d *cc = (pfCompositeCurve3d *)node;

	      buf[buf_size++] = N_COMPOSITE_CURVE3D | custom;
	      buf[buf_size++] = spaceReqmnt;

	      pfb_write_curve3d((pfCurve3d *)cc, glb, &buf_size);

	      {
		int sId, cId;
		pfParaSurface *s = pfGetCompCurve3dParaSurface(cc);
		pfCurve2d *c = pfGetCompCurve3dCurve2d(cc);

		sId = find_in_list(L_NODE, s, glb);
		cId = find_in_list(L_CURVE2D, c, glb); /* XXX Alex -- or should we look in L_NODE? */

		buf[buf_size++] = sId;
		buf[buf_size++] = cId;
	      }

	      count = pfGetNumGSets((pfGeode *)node);
	      buf[buf_size++] = count;
	    }
	    else if (pfIsOfType(node, pfGetNurbCurve2dClassType()))
	    {
	      /* pfNurbCurve2d */
	      pfNurbCurve2d *nc = (pfNurbCurve2d *)node;

	      buf[buf_size++] = N_NURB_CURVE2D | custom;
	      buf[buf_size++] = spaceReqmnt;

	      pfb_write_nurb_curve2d(nc,glb,&buf_size);

	      count = pfGetNumGSets((pfGeode *)node);
	      buf[buf_size++] = count;
	    }
	  }
	}
	else /* basic pfGeode */
	{
	    buf[buf_size++] = N_GEODE | custom;
	    buf[buf_size++] = count;
	}

	for (i = 0; i < count; i++)
	    buf[buf_size++] = find_in_list(L_GSET, pfGetGSet((pfGeode *)node, i), glb);
    }
    else if (pfIsOfType(node, pfGetLPointClassType()))
    {
	/*
	 *  Turn Light Point Node into a Geode
	 */
	buf[buf_size++] = N_GEODE | custom;
	buf[buf_size++] = 1;
	buf[buf_size++] = find_in_list(L_GSET,
				       pfGetLPointGSet((pfLightPoint *)node),
				       glb);
    }
    else if (pfIsOfType(node, pfGetTextClassType()))
    {
	count = pfGetNumStrings((pfText *)node);
	buf = GET_BUF(count + 128);

	buf[buf_size++] = N_TEXT | custom;
	buf[buf_size++] = count;
	for (i = 0; i < count; i++)
	    buf[buf_size++] = find_in_list(L_STRING,
					   pfGetString((pfText *)node, i), glb);
    }
    else if (pfIsOfType(node, pfGetLSourceClassType()))
    {
	buf[buf_size++] = N_LIGHTSOURCE | custom;
	buf[buf_size++] = find_in_list(L_LSOURCE, node, glb);
    }
    else if (pfIsOfType(node, pfGetASDClassType()))
    {
	int bind, size, o_size, pv_size, o_type, pv_type;
	void *attr, *o_attr, *pv_attr;

	buf[buf_size++] = N_ASD | custom;
	pfGetASDAttr((pfASD *)node, PFASD_LODS, &bind, &size, &attr);
	buf[buf_size++] = bind;
	buf[buf_size++] = size;
	buf[buf_size++] = find_in_list(L_ASDDATA, attr, glb);
	pfGetASDAttr((pfASD *)node, PFASD_COORDS, &bind, &size, &attr);
	buf[buf_size++] = bind;
	buf[buf_size++] = size;
	buf[buf_size++] = find_in_list(L_ASDDATA, attr, glb);
	pfGetASDAttr((pfASD *)node, PFASD_FACES, &bind, &size, &attr);
	buf[buf_size++] = bind;
	buf[buf_size++] = size;
	buf[buf_size++] = find_in_list(L_ASDDATA, attr, glb);

	o_attr = pv_attr = NULL;
	o_size = pv_size = 0;
	o_type = pv_type = 0;
	pfGetASDAttr((pfASD *)node, PFASD_PER_VERTEX_ATTR, &bind, &size, &attr);
	if (attr && size && bind )
	{
		pv_attr = attr;
		pv_size = size;
		pv_type = (bind&PFASD_NORMALS ? ASD_ATTR_NORMALS:0) |
			    (bind&PFASD_COLORS ? ASD_ATTR_COLORS:0) |
			    (bind&PFASD_TCOORDS ? ASD_ATTR_TCOORDS:0);
	}
	pfGetASDAttr((pfASD *)node, PFASD_OVERALL_ATTR, &bind, &size, &attr);
	if (attr && size && bind )
	{
		o_attr = attr;
		o_size = size;
		o_type = (bind&PFASD_NORMALS ? ASD_ATTR_NORMALS:0) |
			   (bind&PFASD_COLORS ? ASD_ATTR_COLORS:0) |
			   (bind&PFASD_TCOORDS ? ASD_ATTR_TCOORDS:0);
	}
	buf[buf_size++] = o_type;
	buf[buf_size++] = o_size;
	buf[buf_size++] = find_in_list(L_ASDDATA, o_attr, glb);
	buf[buf_size++] = pv_type;
	buf[buf_size++] = pv_size;
	buf[buf_size++] = find_in_list(L_ASDDATA, pv_attr, glb);

	buf[buf_size++] = pfGetASDNumBaseFaces((pfASD *)node);
	t1 = pfGetASDMorphAttrs((pfASD *)node);
	if (t1 == -1)
	    t2 = -1;
	else
	{
	    t2 = 0;
	    if (t1 & PFASD_NORMALS)
		t2 |= ASD_ATTR_NORMALS;
	    if (t1 & PFASD_COLORS)
		t2 |= ASD_ATTR_COLORS;
	    if (t1 & PFASD_TCOORDS)
		t2 |= ASD_ATTR_TCOORDS;
	}
	buf[buf_size++] = t2;
	count = pfGetASDNumGStates((pfASD *)node);
	buf[buf_size++] = count;
	for (i = 0; i < count; i++)
	    buf[buf_size++] = find_in_list(L_GSTATE,
					   pfGetASDGState((pfASD *)node, i),
					   glb);
        {
            int m;
            float w;
            pfGetASDMaxMorphDepth((pfASD *)node, &m, &w);
	    buf[buf_size++] = m;
        }
#if 0
	buf[buf_size++] = pfGetASDMaxMorphDepth((pfASD *)node);
#endif
	buf[buf_size++] = find_in_table(asd_em_table,
					pfGetASDEvalMethod((pfASD *)node));
	buf[buf_size++] = find_in_list(L_UFUNC,
				       pfGetASDEvalFunc((pfASD *)node), glb);
#if 0
	t1 = pfGetASDSyncGroup((pfASD *)node);
	buf[buf_size++] = find_in_list(L_SG_NAME,
				       (void*)pfGetFluxSyncGroupName((uint)t1),
				       glb);
#endif
    }
    else
    {
	/* XXX unsuported node type */
    }

    ((uint *)buf)[buf_size++] = pfGetNodeTravMask(node, PFTRAV_ISECT);
    ((uint *)buf)[buf_size++] = pfGetNodeTravMask(node, PFTRAV_APP);
    ((uint *)buf)[buf_size++] = pfGetNodeTravMask(node, PFTRAV_CULL);
    ((uint *)buf)[buf_size++] = pfGetNodeTravMask(node, PFTRAV_DRAW);

    pfGetNodeTravFuncs(node, PFTRAV_APP, &nt.app_pre, &nt.app_post);
    pfGetNodeTravFuncs(node, PFTRAV_CULL, &nt.cull_pre, &nt.cull_post);
    pfGetNodeTravFuncs(node, PFTRAV_DRAW, &nt.draw_pre, &nt.draw_post);
    pfGetNodeTravFuncs(node, PFTRAV_ISECT, &nt.isect_pre, &nt.isect_post);
    nt.app_data = pfGetNodeTravData(node, PFTRAV_APP);
    nt.cull_data = pfGetNodeTravData(node, PFTRAV_CULL);
    nt.draw_data = pfGetNodeTravData(node, PFTRAV_DRAW);
    nt.isect_data = pfGetNodeTravData(node, PFTRAV_ISECT);

    if (nt.app_pre != NULL || nt.app_post != NULL || nt.app_data != NULL ||
	nt.cull_pre != NULL || nt.cull_post != NULL || nt.cull_data != NULL ||
	nt.draw_pre != NULL || nt.draw_post != NULL || nt.draw_data != NULL ||
	nt.isect_pre != NULL || nt.isect_post != NULL || nt.isect_data != NULL)
    {
	/*
	 *  has trav funcs and/or trav data
	 */
	buf[buf_size++] = 1;
	buf[buf_size++] = find_in_list(L_UFUNC, nt.app_pre, glb);
	buf[buf_size++] = find_in_list(L_UFUNC, nt.app_post, glb);
	buf[buf_size++] = find_in_list(L_UDATA, nt.app_data, glb);
	buf[buf_size++] = find_in_list(L_UFUNC, nt.cull_pre, glb);
	buf[buf_size++] = find_in_list(L_UFUNC, nt.cull_post, glb);
	buf[buf_size++] = find_in_list(L_UDATA, nt.cull_data, glb);
	buf[buf_size++] = find_in_list(L_UFUNC, nt.draw_pre, glb);
	buf[buf_size++] = find_in_list(L_UFUNC, nt.draw_post, glb);
	buf[buf_size++] = find_in_list(L_UDATA, nt.draw_data, glb);
	buf[buf_size++] = find_in_list(L_UFUNC, nt.isect_pre, glb);
	buf[buf_size++] = find_in_list(L_UFUNC, nt.isect_post, glb);
	buf[buf_size++] = find_in_list(L_UDATA, nt.isect_data, glb);
    }
    else
	buf[buf_size++] = 0;	/* does not have trav funcs or trav data */

    buf[buf_size++] = get_udata((pfObject*)node, glb);

    t1 = pfGetNodeBSphere(node, &sphere);
    buf[buf_size++] = find_in_table(bound_table, t1);
    if (t1 != PFBOUND_DYNAMIC)
    {
	((float *)buf)[buf_size++] = sphere.center[0];
	((float *)buf)[buf_size++] = sphere.center[1];
	((float *)buf)[buf_size++] = sphere.center[2];
	((float *)buf)[buf_size++] = sphere.radius;
    }


    fwrite(&buf_size, sizeof(int), 1, glb->ofp);
    fwrite(buf, sizeof(int), buf_size, glb->ofp);

    pfb_write_name(pfGetNodeName(node), glb);

    if (custom & N_CUSTOM)
    {
	int size_location, end;

	size_location = (int)ftell(glb->ofp);
	fseek(glb->ofp, sizeof(int), SEEK_CUR);

	glb->data_total = 0;
	i = (custom & N_CUSTOM_MASK) >> N_CUSTOM_SHIFT;
	if (glb->custom_nodes[i].store_func)
	    glb->custom_nodes[i].store_func(node, glb);
	else
	    pfNotify(PFNFY_WARN, PFNFY_PRINT,
		     "%s Found \"%s\" custom node but custom store is NULL\n.",
		     "pfdStoreFile_pfb: ", glb->custom_nodes[i].name);

	end = (int)ftell(glb->ofp);
	fseek(glb->ofp, size_location, SEEK_SET);
	fwrite(&glb->data_total, sizeof(int), 1, glb->ofp);
	fseek(glb->ofp, end, SEEK_SET);
    }


}


static int find_in_list(int id, void *data, pfa_global_t *glb)
{
    list_t *tmp;

    if (data == NULL ) return(-1);

    if (glb->l_num[id] != 0){

	tmp = glb->buckets[id][((ulong)data & glb->bucket_mask[id]) >> 4];

	while (tmp)
	{
	    if (tmp->data == data)
		return(tmp->id);
	    tmp = tmp->bnext;
	}
    }

    /* for geoArrays, node may think it has a geoSet instead,
     * here we hack the index id to flag that indeed it is a geoArray.
     */
    if(id == L_GSET){
	if(glb->l_num[L_GARRAY] == 0) return (-1);

        tmp = glb->buckets[L_GARRAY][((ulong)data & glb->bucket_mask[L_GARRAY]) >> 4];
	while (tmp)
	{
	    if (tmp->data == data){
		return(tmp->id | PFB_GARRAY_IXBIT);
	    }
	    tmp = tmp->bnext;

	}
    }
    return(-1);
}


static list_t *find_list_item(int id, void *data, pfa_global_t *glb)
{
    list_t *tmp;

    if (data == NULL || glb->l_num[id] == 0)
	return(NULL);

    tmp = glb->buckets[id][((ulong)data & glb->bucket_mask[id]) >> 4];

    while (tmp)
    {
	if (tmp->data == data)
	    return(tmp);
	tmp = tmp->bnext;
    }

    return(NULL);
}


static int add_to_list(int id, void *data, pfa_global_t *glb)
{
    list_t *tmp;
    int bucket;
    int num;

    if (data == NULL)
	return(0);

    if (glb->buckets[id])
    {
	/*
	 *  Search to see if data is already in the list.
	 */
	bucket = (int)((ulong)data & glb->bucket_mask[id]) >> 4;
	tmp = glb->buckets[id][bucket];
	while (tmp)
	{
	    if (tmp->data == data)
		return(0);
	    tmp = tmp->bnext;
	}

	/*
	 *  We must not have been able to find data in the list.
	 */
	tmp = (list_t *)malloc(sizeof(list_t));
	glb->l_list_end[id]->next = tmp;
    }
    else
    {
	/*
	 *  This is the first item in the list.
	 */
	tmp = (list_t *)malloc(sizeof(list_t));
	glb->l_list[id] = tmp;
	glb->bucket_mask[id] = 0xff;
	bucket = (int)((ulong)data & 0xff) >> 4;
	glb->buckets[id] = (list_t **)malloc(sizeof(list_t *) * 16);
	bzero(glb->buckets[id], sizeof(list_t *) * 16);
    }

    tmp->data = data;
    tmp->id = glb->l_num[id]++;
    tmp->next = NULL;
    tmp->bnext = glb->buckets[id][bucket];
    glb->buckets[id][bucket] = tmp;
    glb->l_list_end[id] = tmp;

    /*
     *  If there are more then 16 items on average per bucket then
     *  double the number of buckets.
     */
    if (glb->l_num[id] > glb->bucket_mask[id])
	double_buckets(id, glb);

    /*
     *  check for custom nodes
     */
    if (id == L_NODE)
    {
	int custom_id;

	if (glb->custom_nodes && (custom_id = is_custom_node(data, glb)) != -1)
	{
	    tmp->size = N_CUSTOM | (custom_id << N_CUSTOM_SHIFT);
	    glb->custom_nodes[custom_id].used = 1;
	    if (glb->custom_nodes[custom_id].descend_func)
		glb->custom_nodes[custom_id].descend_func(data, glb);
	}
	else
	    tmp->size = 0;
    }

    /*
     *  check for user data
     */
    if (id != L_UDATA && id != L_UDATA_LIST && id != L_UDATA_NAME &&
	id != L_IMAGE && id != L_UFUNC && id != L_SG_NAME)
    {
	if (pfIsOfType(data, pfGetObjectClassType()))
	{
	    if (num = pfGetNumUserData(data))
		descend_udata_list(num, data, glb);
	}
	else
	    pfNotify(PFNFY_WARN, PFNFY_INTERNAL,
		    "%s: add_to_list(id=%d): expected a pfObject",
		    "pfdStoreFile_pfb", id);
    }

    return(1);
}

/*
 * returns the position of the element in the array
 */
static int add_to_slist(int id, void *data, int size, pfa_global_t *glb)
{
    list_t *tmp;
    int bucket;
    pfCycleBuffer *cbuf;
    int num;

    if (glb->buckets[id])
    {
	/*
	 *  Search to see if data is already in the list.
	 */
	bucket = (int)((ulong)data & glb->bucket_mask[id]) >> 4;
	tmp = glb->buckets[id][bucket];
	while (tmp)
	{
	    if (tmp->data == data)
	    {
		if (tmp->size < size)
		    tmp->size = size;
		return tmp->id;
	    }
	    tmp = tmp->bnext;
	}

	/*
	 *  We must not have been able to find data in the list.
	 */
	tmp = (list_t *)malloc(sizeof(list_t));
	glb->l_list_end[id]->next = tmp;
    }
    else
    {
	/*
	 *  This is the first item in the list.
	 */
	tmp = (list_t *)malloc(sizeof(list_t));
	glb->l_list[id] = tmp;
	glb->bucket_mask[id] = 0xff;
	bucket = (int)((ulong)data & 0xff) >> 4;
	glb->buckets[id] = (list_t **)malloc(sizeof(list_t *) * 16);
	bzero(glb->buckets[id], sizeof(list_t *) * 16);
    }

    tmp->data = data;
    tmp->size = size;
    tmp->id = glb->l_num[id]++;
    tmp->next = NULL;
    tmp->bnext = glb->buckets[id][bucket];
    glb->buckets[id][bucket] = tmp;
    glb->l_list_end[id] = tmp;

    /*
     *  If there are more then 16 items on average per bucket then
     *  double the number of buckets.
     */
    if (glb->l_num[id] > glb->bucket_mask[id])
	double_buckets(id, glb);

    /*
     *  check for user data
     */
    if (cbuf = pfGetCBuffer(data))
	if (num = pfGetNumUserData((pfObject *)cbuf))
	    descend_udata_list(num, cbuf, glb);

    return tmp->id;
}


static int find_in_table(const int *table, int item)
{
    int i;

    for (i = 1; i <= table[0]; i++)
	if (table[i] == item)
	    return(i);

    for (i = 0; table_names[i].addr != table && table_names[i].addr != NULL;
	 i++);
    pfNotify(PFNFY_WARN, PFNFY_INTERNAL,
		 "%s: find_in_table() could not find %d (0x%x) in %s table.\n",
		 "pfdStoreFile_pfb", item, item, table_names[i].name);

	return(1);
    }


    static uint to_table(const uint *table, uint src)
    {
	uint res, all_table;
	int i;

	res = 0x0;
	all_table = 0x0;
	for (i = 1, res = 0x0; i <= table[0]; i++)
	{
	    if ((src & table[i]) == table[i])
		res |= 0x1 << (i - 1);
	    all_table |= table[i];
	}

	if ((~all_table) & src)
	{
	    for (i = 0; table_names[i].addr != table && table_names[i].addr != NULL;
		 i++);
	    pfNotify(PFNFY_WARN, PFNFY_INTERNAL,
		     "%s:  to_table() src has bits not in %s table (0x%08x).\n",
		     "pfdStoreFile_pfb", table_names[i].name, (~all_table) & src);
	}

	return(res);
    }


    static uint from_table(const uint *table, uint src)
    {
	uint res;
	int i;

	res = 0x0;
	for (i = 1, res = 0x0; i <= table[0]; i++)
	    if (src & (0x1 << (i - 1)))
		res |= table[i];

	return(res);
    }



PFPFB_DLLEXPORT     size_t pfdLoadData_pfb(void *data, int size, void *handle)
    {
	((pfa_global_t *)handle)->data_total += size;
	return(pfb_fread(data, 1, size, ((pfa_global_t *)handle)->ifp));
    }



PFPFB_DLLEXPORT     size_t pfdStoreData_pfb(void *data, int size, void *handle)
    {
	((pfa_global_t *)handle)->data_total += size;
	return(fwrite(data, 1, size, ((pfa_global_t *)handle)->ofp));
    }

PFPFB_DLLEXPORT     int pfdStoreObjectRef_pfb(pfObject *obj, void *handle)
    {
	pfa_global_t *glb;
	int buf[2];

	glb = (pfa_global_t *)handle;

	if ((buf[1] = find_in_unknown_list(obj, &buf[0], glb)) == -1)
	    return(-1);

	glb->data_total += sizeof(int) * 2;
	fwrite(buf, sizeof(int), 2, glb->ofp);

	return(0);
    }




PFPFB_DLLEXPORT     int pfdDescendObject_pfb(pfObject *obj, void *handle)
    {
	pfType *type;

	if ((type = pfGetType(obj)) == NULL)
	    return(-1);

	return(descend_unknown(obj, type, (pfa_global_t *)handle));
    }



