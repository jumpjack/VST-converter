' This file is written in Visual Basic for Application and has been tested on Excel 2010
' It analyses a .vst file and provides all its metadata. No convertion is performed.

    Dim fileContents As String
    Dim fields(100) As Integer
    Dim fieldNames(100) As String
    Dim LODfaces(100) As Long ' max 100 LODs
    Dim LODvertex(100) As Long ' max 100 LODs
    Dim LODlenghts(100) As Long

    Const VALUE_LEN = 4 ' 32 bit integer
    Const VST_HEADER_LEN = 40
    Const LOD_HEADER_LEN = 28
    Const BOUNDING_BOX_LEN = 24
    Const TEXTURE_REF_LEN = 2048
    Const COORD_SYS_LEN = 4096
    Const PATCH_HEADER_LEN = 24
    
    ' For VST header:
    Const TEXTURES_COUNT_OFFSET = 28
    Const VERTEX_COUNT_OFFSET = 32
    Const LODS_COUNT_OFFSET = 36
    
    ' For LOD header:
    Const LOD_VERTEX_COUNT_OFFSET = 12
    Const LOD_PATCHES_COUNT_OFFSET = 20
    Const LOD_LAST_VERTEX_POINTER_OFFSET = 24
    
    ' For PATCH:
    Const PATCH_TYPE_OFFSET = 8
    Const PATCH_FACES_COUNT_OFFSET = 16 ' Number of "arrays of vertex pointers" ("=index arrays")  in patch
    Const PATCH_VERTEX_COUNT_OFFSET = 20 ' Number of "vertex pointers"  (="index") in patch
    
    ' for Vertex:
    Const VALUES_PER_VERTEX = 5 ' 2 for texture coordinates + 3 for space coordinates
    Const SINGLE_VERTEX_LEN = VALUES_PER_VERTEX * VALUE_LEN

    
    
    
Sub VSTtoPLY()
    Filename = "C:\temp\2n292280938vilb100p0703l0m3.vst"
    fileContents = LoadFile(Filename)
    
    texturesCount = getValFromString(fileContents, TEXTURES_COUNT_OFFSET, VALUE_LEN)
    vertexCount = getValFromString(fileContents, VERTEX_COUNT_OFFSET, VALUE_LEN)
    LODcount = getValFromString(fileContents, LODS_COUNT_OFFSET, VALUE_LEN)
    vertexListOffset = VST_HEADER_LEN + BOUNDING_BOX_LEN + texturesCount * TEXTURE_REF_LEN + COORD_SYS_LEN
    vertexListLen = vertexCount * VALUES_PER_VERTEX * VALUE_LEN
    vertexListEnd = vertexListOffset + vertexListLen - 1
    firstLODoffset = vertexListEnd + 1
    firstLODlen = getValFromString(fileContents, firstLODoffset, VALUE_LEN)
    
    prevLODoffset = firstLODoffset
    prevLODlen = 0
    For LODindex = 0 To LODcount - 1
        Debug.Print
        Debug.Print ("    === LOD n." & Str(LODindex))
        
        LODoffset = prevLODoffset + prevLODlen
        
        LOD_Header_Contents = Mid$(fileContents, LODoffset + 1, LOD_HEADER_LEN)
        Debug.Print ("    LODoffset: " & Str(LODoffset) & " ($" & Hex(LODoffset) & ")")
        
        LODlen = getValFromString(fileContents, LODoffset, 4)
        LODlenghts(LODindex) = LODlen
        Debug.Print ("    LODlen: " & Str(LODlen) & " (0x" & Hex(LODlen) & ")")
        
        LOD_end = LODoffset + LODlen - 1
        Debug.Print ("    LOD_end: " & Str(LOD_end) & " (0x" & Hex(LOD_end) & ")")
        
        nextLODoffset = LODoffset + LODlen
        Debug.Print ("    Next LOD starts at: " & Str(nextLODoffset) & " (0x" & Hex(nextLODoffset) & ")")
        
        
        Debug.Print "      Header: " & stringToHex(LOD_Header_Contents) ' Whole header preview
        fields(1) = 4: fieldNames(1) = "Total Size"
        fields(2) = 8: fieldNames(2) = "Reserved"
        fields(3) = 4: fieldNames(3) = "N vertex"
        fields(4) = 4: fieldNames(4) = "LOD threshold"
        fields(5) = 4: fieldNames(5) = "N patches"
        fields(6) = 4: fieldNames(6) = "Last vertex index"
        Call showHeader(LOD_Header_Contents, 6, "       ") ' Detailed header contents
        
        LODpatchesCount = getValFromString(fileContents, LODoffset + LOD_PATCHES_COUNT_OFFSET, 4)
        Debug.Print ("    LODpatchesCount: " & Str(LODpatchesCount) & " (0x" & Hex(LODpatchesCount) & ")")
        
        LODvertexCount = getValFromString(fileContents, LODoffset + LOD_VERTEX_COUNT_OFFSET, 4)
        Debug.Print ("    LODvertexCount: " & Str(LODvertexCount) & " (0x" & Hex(LODvertexCount) & ")")
        
        LODpatchesCount = getValFromString(fileContents, LODoffset + LOD_PATCHES_COUNT_OFFSET, 4)
        Debug.Print ("    LODpatchesCount: " & Str(LODpatchesCount) & " (0x" & Hex(LODpatchesCount) & ")")
        
        LODmaxVert = getValFromString(fileContents, LODoffset + LOD_LAST_VERTEX_POINTER_OFFSET, 4)
        Debug.Print ("    LODmaxVert: " & Str(LODmaxVert) & " (0x" & Hex(LODmaxVert) & ")")
        
        
        prevLODoffset = LODoffset
        prevLODlen = LODlen
        prevPatchesBytes = 0
        
        
        '       ================ PATCH ===========
        For patchIndex = 1 To LODpatchesCount
            Debug.Print ("        === PATCH n." & Str(patchIndex))
           patchOffset = LODoffset + LOD_HEADER_LEN + BOUNDING_BOX_LEN + prevPatchesBytes
            Debug.Print ("        patchOffset: " & Str(patchOffset) & " ($" & Hex(patchOffset) & ")")
    
            fields(1) = 8: fieldNames(1) = "Reserved"
            fields(2) = 4: fieldNames(2) = "Triangles or PointClouds"
            fields(3) = 4: fieldNames(3) = "Pointer to texture"
            fields(4) = 4: fieldNames(4) = "N. of faces/clouds in patch"
            fields(5) = 4: fieldNames(5) = "Number of vertex pointers in patch"
            patchHeaderContents = Mid$(fileContents, patchOffset + 1, PATCH_HEADER_LEN)
            Call showHeader(patchHeaderContents, 5, "          ") ' Detailed header contents
            patchArrays = getValFromString(patchHeaderContents, 16, 4)
            patchIndexes = getValFromString(patchHeaderContents, 20, 4)
            patchLength = patchArrays + patchIndexes
            Debug.Print ("        patchLength: " & patchLength)
            patchesCount = patchesCount + 1
            prevPatchesBytes = prevPatchesBytes + patchLength
        Next
        
        LODfaces(LODindex) = patchArrays
        LODvertex(LODindex) = patchIndexes
        
        Debug.Print "================================"
    Next
    
    
    Debug.Print "Final report:"
    totalLODSlength = 0
    Debug.Print "Number of Levels Of Depth (LODs): " & LODcount
    Debug.Print
    Debug.Print "LOD", "Faces", "Vertex used"
    For LODindex = 0 To LODcount - 1
        Debug.Print LODindex, LODfaces(LODindex), LODvertex(LODindex)
        totalLODSlength = totalLODSlength + LODlenghts(LODindex)
    Next
    fileHeaderLength = VST_HEADER_LEN + BOUNDING_BOX_LEN + texturesCount * TEXTURE_REF_LEN + COORD_SYS_LEN
    Debug.Print
    Debug.Print "N. of vertex: " & vertexCount
    Debug.Print
    Debug.Print "CHECK:"
    Debug.Print "File header length = " & fileHeaderLength
    Debug.Print "total vertex length = " & vertexListLen
    Debug.Print "total LODS length = " & totalLODSlength
    Debug.Print "file length = " & Len(fileContents), fileHeaderLength + vertexListLen + totalLODSlength
    
   
End Sub

Sub showHeader(ByVal s As String, ByVal fieldsCount As Integer, indent As String)
' Show hex values of header, grouped by field length (for debugging purposes)
    prevOffset = 0
    prevLength = 0
    For fieldIndex = 1 To fieldsCount
        fieldOffset = prevOffset + prevLength
        fieldLength = fields(fieldIndex)
        fieldStr = Mid$(s, fieldOffset + 1, fieldLength)
        Debug.Print indent & "Field " & (fieldIndex - 1) & " (" & fieldNames(fieldIndex) & "): " & stringToHex(fieldStr) & " ---> " & stringToHexInv(fieldStr) & " ---> " & stringToDecInv(fieldStr)
        prevOffset = fieldOffset
        prevLength = fieldLength
    Next
End Sub

Function getValFromString(ByVal stringContents As String, ByVal offset As Long, ByVal L As Integer)
    ' Note: offset in bytes, non in array indexes
    For i = offset + L - 1 To offset Step -1
        byt = Asc(Mid$(stringContents, i + 1, 1))
        finalVal = finalVal + byt * 256 ^ (i - offset)
    Next
    getValFromString = finalVal
End Function

Function stringToHex(ByVal s As String)
    temp = ""
    intVal = 0
    For i = 1 To Len(s)
        temp = temp + Hex(Asc(Mid$(s, i, 1))) + " "
        If Len(s) <= 8 Then
            byteVal = Asc(Mid$(s, Len(s) - i + 1, 1))
            intVal = intVal + byteVal * 256 ^ (Len(s) - i)
        End If
    Next
    stringToHex = temp
End Function

Function stringToDecInv(ByVal s As String)
    temp = ""
    intVal = 0
    For i = 1 To Len(s)
        temp = temp + Hex(Asc(Mid$(s, i, 1))) + " "
        If Len(s) <= 8 Then
            byteVal = Asc(Mid$(s, Len(s) - i + 1, 1))
            intVal = intVal + byteVal * 256 ^ (Len(s) - i)
        End If
    Next
    stringToDecInv = intVal
End Function

Function stringToHexInv(ByVal s As String)
    temp = ""
    intVal = 0
    For i = Len(s) To 1 Step -1
        temp = temp + Hex(Asc(Mid$(s, i, 1)))
        If Len(s) <= 8 Then
            byteVal = Asc(Mid$(s, Len(s) - i + 1, 1))
            intVal = intVal + byteVal * 256 ^ (Len(s) - i)
        End If
    Next
    stringToHexInv = temp
End Function



Function LoadFile(ByVal f As String) ' load entire file to string
    Dim MyData As String
    Open f For Binary As #1
    MyData = Space$(LOF(1)) ' sets buffer to Length Of File
    Get #1, , MyData ' fits exactly
    Close #1
    LoadFile = MyData
End Function


