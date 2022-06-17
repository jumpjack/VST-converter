Type MyHex
    Lng As Long
    End Type
    Type MySingle
    sng As Single
End Type




Dim fileContents As String
    Dim fields(100) As Integer
    Dim fieldNames(100) As String
    Dim fieldsTypes(100) As String
    Dim LODfaces(100) As Long ' max 100 LODs
    Dim LODvertex(100) As Long
    Dim LODlenghts(100) As Long
    Dim LOD_vertex_DB_start(100)
    Dim LOD_vertex_DB_End(100)
    
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
    
    LODtoConvert = 0 ' <<<<<<<<<<<<<<<<< User defined!
    
    fileContents = LoadFile(Filename)
    
    texturesCount = getValFromString(fileContents, TEXTURES_COUNT_OFFSET, VALUE_LEN, "int")
    vertexCount = getValFromString(fileContents, VERTEX_COUNT_OFFSET, VALUE_LEN, "int")
    LODcount = getValFromString(fileContents, LODS_COUNT_OFFSET, VALUE_LEN, "int")
    vertexListOffset = VST_HEADER_LEN + BOUNDING_BOX_LEN + texturesCount * TEXTURE_REF_LEN + COORD_SYS_LEN
    vertexListLen = vertexCount * VALUES_PER_VERTEX * VALUE_LEN
    vertexListEnd = vertexListOffset + vertexListLen - 1
    firstLODoffset = vertexListEnd + 1
    firstLODlen = getValFromString(fileContents, firstLODoffset, VALUE_LEN, "int")
    
    prevLODoffset = firstLODoffset
    prevLODlen = 0
    For LODindex = 0 To LODcount - 1
        Debug.Print
        Debug.Print ("    === LOD n." & Str(LODindex))
        
        LODoffset = prevLODoffset + prevLODlen
        
        LOD_Header_Contents = Mid$(fileContents, LODoffset + 1, LOD_HEADER_LEN)
        Debug.Print ("    LODoffset: " & Str(LODoffset) & " ($" & Hex(LODoffset) & ")")
        
        LODlen = getValFromString(fileContents, LODoffset, 4, "int")
        LODlenghts(LODindex) = LODlen
        Debug.Print ("    LODlen: " & Str(LODlen) & " (0x" & Hex(LODlen) & ")")
        
        LOD_end = LODoffset + LODlen - 1
        Debug.Print ("    LOD_end: " & Str(LOD_end) & " (0x" & Hex(LOD_end) & ")")
        
        nextLODoffset = LODoffset + LODlen
        Debug.Print ("    Next LOD starts at: " & Str(nextLODoffset) & " (0x" & Hex(nextLODoffset) & ")")
        
        
        Debug.Print "      Header: " & stringToHex(LOD_Header_Contents) ' Whole header preview
        fields(1) = 4: fieldNames(1) = "Total Size": fieldsTypes(1) = "int"
        fields(2) = 8: fieldNames(2) = "Reserved": fieldsTypes(2) = "int"
        fields(3) = 4: fieldNames(3) = "N vertex": fieldsTypes(3) = "int"
        fields(4) = 4: fieldNames(4) = "LOD threshold": fieldsTypes(4) = "float32"
        fields(5) = 4: fieldNames(5) = "N patches": fieldsTypes(5) = "int"
        fields(6) = 4: fieldNames(6) = "Last vertex index": fieldsTypes(6) = "int"
        Call showHeader(LOD_Header_Contents, 6, "       ") ' Detailed header contents
        
        LODpatchesCount = getValFromString(fileContents, LODoffset + LOD_PATCHES_COUNT_OFFSET, 4, "int")
        Debug.Print ("    LODpatchesCount: " & Str(LODpatchesCount) & " (0x" & Hex(LODpatchesCount) & ")")
        
        LODvertexCount = getValFromString(fileContents, LODoffset + LOD_VERTEX_COUNT_OFFSET, 4, "int")
        Debug.Print ("    LODvertexCount: " & Str(LODvertexCount) & " (0x" & Hex(LODvertexCount) & ")")
        
        LODpatchesCount = getValFromString(fileContents, LODoffset + LOD_PATCHES_COUNT_OFFSET, 4, "int")
        Debug.Print ("    LODpatchesCount: " & Str(LODpatchesCount) & " (0x" & Hex(LODpatchesCount) & ")")
        
        LODmaxVert = getValFromString(fileContents, LODoffset + LOD_LAST_VERTEX_POINTER_OFFSET, 4, "int")
        Debug.Print ("    LODmaxVert: " & Str(LODmaxVert) & " (0x" & Hex(LODmaxVert) & ")")
        
        LOD_vertex_DB_start(LODindex) = LODmaxVert - LODvertexCount + 1
        LOD_vertex_DB_End(LODindex) = LODmaxVert + 1
        Debug.Print ("    Vertex database for this LOD : from 0x" & Hex(LOD_vertex_DB_start(LODindex)) & " to  0x " & Hex(LOD_vertex_DB_End(LODindex)))
        
        prevLODoffset = LODoffset
        prevLODlen = LODlen
        prevPatchesBytes = 0
        
        
        '       ================ PATCH ===========
        For patchIndex = 1 To LODpatchesCount
            Debug.Print ("        === PATCH n." & Str(patchIndex))
           patchOffset = LODoffset + LOD_HEADER_LEN + BOUNDING_BOX_LEN + prevPatchesBytes
            Debug.Print ("        patchOffset: " & Str(patchOffset) & " ($" & Hex(patchOffset) & ")")
    
            fields(1) = 8: fieldNames(1) = "Reserved": fieldsTypes(1) = "int"
            fields(2) = 4: fieldNames(2) = "Triangles or PointClouds": fieldsTypes(2) = "int"
            fields(3) = 4: fieldNames(3) = "Pointer to texture": fieldsTypes(3) = "int"
            fields(4) = 4: fieldNames(4) = "N. of faces/clouds in patch": fieldsTypes(4) = "int"
            fields(5) = 4: fieldNames(5) = "Number of vertex pointers in patch": fieldsTypes(5) = "int"
            patchHeaderContents = Mid$(fileContents, patchOffset + 1, PATCH_HEADER_LEN)
            Call showHeader(patchHeaderContents, 5, "          ") ' Detailed header contents
            patchArrays = getValFromString(patchHeaderContents, 16, 4, "int")
            patchIndexes = getValFromString(patchHeaderContents, 20, 4, "int")
            patchLength = patchArrays + patchIndexes
            Debug.Print ("        patchLength: " & patchLength)
            patchesCount = patchesCount + 1
            prevPatchesBytes = prevPatchesBytes + patchLength
            
            ' ============== VERTEX ==============
            vertexGroupOffset = patchOffset + PATCH_HEADER_LEN + 1 ' First value is length, skip it
            vertexGroupLength = getValFromString(fileContents, vertexGroupOffset - 1, 4, "int")
            If LODindex = LODtoConvert Then
                For vertexIndex = 1 To vertexGroupLength
                    vertexOffset = vertexGroupOffset + vertexIndex * 4
                    Debug.Print Hex(vertexOffset),
                    Debug.Print createPLYline(vertexOffset)
                Next
            End If
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
        If fieldsTypes(fieldIndex) = "int" Then
            Debug.Print indent & "Field " & (fieldIndex - 1) & " (" & fieldNames(fieldIndex) & "): " & stringToHex(fieldStr) & " ---> " & stringToHexInv(fieldStr) & " ---> " & stringToDecInv(fieldStr)
        End If
        If fieldsTypes(fieldIndex) = "float32" Then
            Debug.Print indent & "Field " & (fieldIndex - 1) & " (" & fieldNames(fieldIndex) & "): " & stringToHex(fieldStr) & " ---> " & stringToHexInv(fieldStr) & " ---> " & Hex2Ieee754(stringToHexInv(fieldStr))
        End If
        prevOffset = fieldOffset
        prevLength = fieldLength
    Next
End Sub

Function getValFromString(ByVal stringContents As String, ByVal offset As Long, ByVal L As Integer, typ As String)
    ' Note: offset in bytes, non in array indexes
    finalVal = 0
    For i = offset + L - 1 To offset Step -1
        byt = Asc(Mid$(stringContents, i + 1, 1))
        If typ = "int" Then
            finalVal = finalVal + byt * 256 ^ (i - offset)
        End If
        If typ = "float32" Then
            stringFloat = Mid$(stringContents, offset, 4)
Debug.Print stringFloat
            finalVal = Hex2Ieee754(stringToHex(stringFloat))
        End If
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


Function Hex2Ieee754(hexString)
    Dim h As MyHex
    Dim s As MySingle
    Dim b1 As String
    Dim b2 As String
    Dim b3 As String
    Dim b4 As String
    b1 = Mid$(hexString, 1, 2)
    b2 = Mid$(hexString, 3, 2)
    b3 = Mid$(hexString, 5, 2)
    b4 = Mid$(hexString, 7, 2)
    h.Lng = Val("&H" & b1 & b2 & b3 & b4 & "&")
    LSet s = h
    Hex2Ieee754 = s.sng
End Function


Sub createPly()
    For vertexIndex = vertexListOffset To vertexListOffset + vertexLen - 1
        PLYline = createPLYline(vertexIndex)
    Next
End Sub


Function createPLYline(vertOffset) As String
    textureX = getValFromString(fileContents, vertOffset, 4, "float32")
    textureY = getValFromString(fileContents, vertOffset + 4, 4, "float32")
    spaceX = getValFromString(fileContents, vertOffset + 8, 4, "float32")
    spaceY = getValFromString(fileContents, vertOffset + 12, 4, "float32")
    spaceZ = getValFromString(fileContents, vertOffset + 16, 4, "float32")
    createPLYline = textureX & " " & textureY & " " & spaceX & " " & spaceY & " " & spaceZ
End Function


