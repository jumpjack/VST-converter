// vst2x3d.cpp : converter from VST format to X3D.
// -----------------------------------------------
// author: MaxSt

#include <stdio.h>
#include <stdlib.h>
#include <conio.h>
#include <string.h>
#include <windows.h>
#include <math.h>

typedef struct { float tx, ty, x, y, z; } _VERT;

typedef struct 
{
  int       nLabel, nByteOrder, nVersionMajor, nVersionMinor;
  int       nImplementation, nRes1, nRes2, nTextureNum;
  int       nVertexNum, nLODnum;
} _VSTHEADER;

typedef struct 
{
  float     Xmin, Ymin, Zmin;
  float     Xmax, Ymax, Zmax;
} _BOUNDINGBOX;

typedef struct 
{
  int       nSize, nRes1, nRes2;
  int       nVertexNum;
  float     DistThreshold;
  int       nPatchNum;
  int       nVertMax;
} _LODHEADER;

typedef struct 
{
  int       nRes1, nRes2;
  int       nPointCloud;
  int       nTexture;
  int       nArrayNum;
  int       nTotalVertexNum;
} _PATCHHEADER;

char szPNGfile[100][256];

void Reverse(int * a)
{
  int b;
  unsigned char * pa = (unsigned char *)a;
  unsigned char * pb = (unsigned char *)&b;

  *(pb)   = *(pa+3);
  *(pb+1) = *(pa+2);
  *(pb+2) = *(pa+1);
  *(pb+3) = *(pa);
  *a = b;
}

void Reverse(float * a)
{
  float b;
  unsigned char * pa = (unsigned char *)a;
  unsigned char * pb = (unsigned char *)&b;

  *(pb)   = *(pa+3);
  *(pb+1) = *(pa+2);
  *(pb+2) = *(pa+1);
  *(pb+3) = *(pa);
  *a = b;
}

void Reverse(_VERT * a)
{
  Reverse( &(a->tx) );
  Reverse( &(a->ty) );
  Reverse( &(a->x) );
  Reverse( &(a->y) );
  Reverse( &(a->z) );
}

int main(int argc, char* argv[])
{
  char        * szFilenameIn;
  char          szX3Dfile[256];
  _VSTHEADER    VSTHeader;
  _BOUNDINGBOX  BBox, BBox1;
  _LODHEADER    LODHeader;
  _PATCHHEADER  PatchHeader;
  char          szTextureRef[2048];
  float         CoordinateSystem[1024];
  int           nReverseOrder = 0;
  int           ArrayLen, VertIndex, pos1, pos2;
  int           VertCount;
  int           FaceCount;
  int           i, j, k, l, m;
  FILE        * f1;

  if (argc <= 1)
  {
    printf("\nUsage: vst2x3d.exe input.vst\n");
    return 1;
  }

  szFilenameIn = argv[1];
  int nLen = strlen(szFilenameIn);

  if ((nLen>30) && 
      (_strnicmp( szFilenameIn+nLen-20, "VIL", 3 ) == 0) &&
      (_strnicmp( szFilenameIn+nLen-4, ".vst", 4 ) == 0))
  {
    strcpy(szX3Dfile, szFilenameIn);
    strcpy(szX3Dfile+nLen-4, "_LOD_0.x3d");
  }
  else
  {
    printf("ERROR: Incorrect input: .VST file expected.");
    return 1;
  }

  if ( GetFileAttributes( szFilenameIn ) == -1 )
  {
    printf( "ERROR: file '%s' not found\n", szFilenameIn );
    return 1;
  }

  if( !(f1 = fopen(szFilenameIn, "rb"))) return 1;

  fread(&VSTHeader, sizeof(VSTHeader), 1, f1);

  if (VSTHeader.nLabel != 0x00545356 )
  {
    printf( "ERROR: wrong label in file '%s'\n", szFilenameIn );
    return 2;
  }

  if (VSTHeader.nByteOrder == 0x00010203 )
  {
    nReverseOrder = 1;
    Reverse(&VSTHeader.nVersionMajor);
    Reverse(&VSTHeader.nVersionMinor);
    Reverse(&VSTHeader.nTextureNum);
    Reverse(&VSTHeader.nVertexNum);
    Reverse(&VSTHeader.nLODnum);
  }

  printf( "\nViSTa v.%d.%d\n", VSTHeader.nVersionMajor, VSTHeader.nVersionMinor );

  if (VSTHeader.nImplementation != 0x0052454D )
  {
    printf( "ERROR: implementation 'MER' expected\n" );
    return 3;
  }

  printf( "Number of textures: %d\n", VSTHeader.nTextureNum );
  printf( "Number of vertices: %d\n", VSTHeader.nVertexNum );
  printf( "Number of LODs: %d\n", VSTHeader.nLODnum );

  fread(&BBox, sizeof(BBox), 1, f1);
  
  if (nReverseOrder == 1)
  {
    Reverse( &BBox.Xmin );
    Reverse( &BBox.Xmax );
    Reverse( &BBox.Ymin );
    Reverse( &BBox.Ymax );
    Reverse( &BBox.Zmin );
    Reverse( &BBox.Zmax );
  }

  for (i=0; i<VSTHeader.nTextureNum; i++)
  {
    fread(&szTextureRef[0], 2048, 1, f1);
    strcpy(szPNGfile[i], szTextureRef+10);
    strcpy(szPNGfile[i]+27, ".PNG");
    szPNGfile[i][11] = 'F';
    szPNGfile[i][12] = 'F';
  }

  fread(&CoordinateSystem, 4096, 1, f1);

  _VERT * pVert=(_VERT *)malloc(VSTHeader.nVertexNum*5*4);

  if (pVert == NULL)
  {
    printf( "ERROR: Cannot allocate memory\n" );
    return 1;
  }

  fread(pVert, VSTHeader.nVertexNum*5*4, 1, f1);

  if (nReverseOrder == 1)
  {
    for (j=0; j<VSTHeader.nVertexNum; j++)
      Reverse( pVert+j );
  }

  for (j=0; j<VSTHeader.nLODnum; j++)
  {
    fread(&LODHeader, sizeof(LODHeader), 1, f1);
    if (nReverseOrder == 1)
    {
      Reverse( &LODHeader.nPatchNum );
      Reverse( &LODHeader.nVertexNum );
      Reverse( &LODHeader.nVertMax );
    }
    printf( "LOD %d: ", j );

    for (k=0; k<VSTHeader.nTextureNum; k++)
      fread(&BBox1, sizeof(BBox1), 1, f1);

    FILE * f;

    szX3Dfile[nLen+1] = '0'+j;
    if (!(f = fopen(szX3Dfile, "wt"))) 
    {
      printf( "ERROR: cannot open file '%s'\n", szX3Dfile );
      return 1;
    }

    fprintf(f, "<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
    fprintf(f, "<!DOCTYPE X3D PUBLIC \"ISO//Web3D//DTD X3D 3.0//EN\"   \"http://www.web3d.org/specifications/x3d-3.0.dtd\">\n");
    fprintf(f, "<X3D  profile=\"CADInterchange\">\n");
    fprintf(f, "  <head>\n");
    fprintf(f, "    <meta name=\"generator\" content=\"vst2x3d\"/>\n");
    fprintf(f, "  </head>\n");
    fprintf(f, "  <Scene>\n");
    fprintf(f, "  <NavigationInfo  type='\"WALK\" \"ANY\"'/>\n");
    fprintf(f, "  <Viewpoint  description=\"Start\" position=\"0.0 0.0 0.0\" orientation=\"1 0 0 3.14\"/>\n");
    fprintf(f, "      <Shape  bboxCenter=\"%f %f %f\" bboxSize=\"%f %f %f\">\n", 
      (BBox.Xmax+BBox.Xmin)/2, -(BBox.Zmax+BBox.Zmin)/2, (BBox.Ymax+BBox.Ymin)/2,
      (BBox.Xmax-BBox.Xmin)/2, (BBox.Zmax-BBox.Zmin)/2, (BBox.Ymax-BBox.Ymin)/2 );

    VertCount = 0;
    FaceCount = 0;

    for (k=0; k<LODHeader.nPatchNum; k++)
    {
      fread(&PatchHeader, sizeof(PatchHeader), 1, f1);

      if (nReverseOrder == 1)
      {
        Reverse( &PatchHeader.nPointCloud );
        Reverse( &PatchHeader.nArrayNum );
        Reverse( &PatchHeader.nTexture );
        Reverse( &PatchHeader.nTotalVertexNum );
      }

      if ( PatchHeader.nPointCloud == 1 )
      {
        fprintf(f, "          <PointSet>\n");
        fprintf(f, "              <Coordinate  point=\"");

        pos1 = ftell( f1 );
        pos2 = pos1 + PatchHeader.nArrayNum*4;
        for (l=0; l<PatchHeader.nArrayNum; l++)
        {
          fseek( f1, pos1, SEEK_SET );
          fread(&ArrayLen, 4, 1, f1);
          if (nReverseOrder == 1) Reverse( &ArrayLen );
          pos1 += 4;
          fseek( f1, pos2, SEEK_SET );
          for (m=0; m<ArrayLen; m++)
          {
            fread(&VertIndex, 4, 1, f1);
            if (nReverseOrder == 1) Reverse( &VertIndex );
            VertCount++;
            if ( l+m > 0 )
              fprintf(f, ", ");
            fprintf(f, "%f %f %f", (pVert+VertIndex)->x, -(pVert+VertIndex)->z, (pVert+VertIndex)->y);
          }
          pos2 = ftell( f1 );
        }
        fprintf(f, "\"/>\n");
        fprintf(f, "          </PointSet>\n");
      }
      else
      {
        fprintf(f, "          <Appearance>\n");
        fprintf(f, "              <ImageTexture  url='\"%s\"'/>\n", szPNGfile[PatchHeader.nTexture]);
        fprintf(f, "          </Appearance>\n");
        fprintf(f, "          <IndexedTriangleStripSet  index=\"");
        pos1 = ftell( f1 );
        pos2 = pos1 + PatchHeader.nArrayNum*4;
        for (l=0; l<PatchHeader.nArrayNum; l++)
        {
          if (l>0)
            fprintf(f, "%d ", -1);
          fseek( f1, pos1, SEEK_SET );
          fread(&ArrayLen, 4, 1, f1);
          if (nReverseOrder == 1) Reverse( &ArrayLen );
          pos1 += 4;
          fseek( f1, pos2, SEEK_SET );
          for (m=0; m<ArrayLen; m++)
          {
            fread(&VertIndex, 4, 1, f1);
            if (nReverseOrder == 1) Reverse( &VertIndex );
            fprintf(f, "%d ", VertIndex);
          }
          if (ArrayLen >= 3) FaceCount += (ArrayLen-2);
          pos2 = ftell( f1 );
        }
        fprintf(f, "\">\n");
        fprintf(f, "              <Coordinate  point=\"");
        for (m=0; m<=LODHeader.nVertMax; m++)
        {
          if ( m > 0 )
            fprintf(f, ", ");
          fprintf(f, "%f %f %f", (pVert+m)->x, -(pVert+m)->z, (pVert+m)->y);
        }
        fprintf(f, "\"/>\n");

        fprintf(f, "              <TextureCoordinate  point=\"");
        for (m=0; m<=LODHeader.nVertMax; m++)
        {
          if ( m > 0 )
            fprintf(f, ", ");
          fprintf(f, "%f %f", (pVert+m)->tx, 1-(pVert+m)->ty);
        }
        fprintf(f, "\"/>\n");
    
        fprintf(f, "          </IndexedTriangleStripSet>\n");
      }
    }
    fprintf(f, "      </Shape>\n");
    fprintf(f, "  </Scene>\n");
    fprintf(f, "</X3D>\n");
    fclose(f);

    if ( VertCount > 0 )
      printf( "Number of points: %7d   ", VertCount );
    if ( FaceCount > 0 )
      printf( "Number of triangles: %7d", FaceCount );

    printf( "\n" );
  }
  fclose(f1);

  if (pVert != NULL)
    free(pVert);

  return 0;
}

