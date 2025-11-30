// Export functionality

class ExportManager {
    downloadJSONold(meshes, LODSdataGlobal) {
        if (!meshes) return;
        
        const annotatedMeshes = {
            data: {
                filename: window.fileData.name,
                fileDate: window.fileData.lastModifiedDate,
                fileSize: window.fileData.size
            },
            meshes: meshes,
            LODdata: LODSdataGlobal
        };
        
        console.log("LODS:", LODSdataGlobal);
        console.log(annotatedMeshes);
        
        const blob = new Blob([JSON.stringify(annotatedMeshes, null, 2)], {type:'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const JSONfilename = window.fileData.name.toLowerCase().replace(".pfb","");
        a.href = url; 
        a.download = JSONfilename + '.json';
        document.body.appendChild(a); 
        a.click(); 
        a.remove();
        URL.revokeObjectURL(url);
    }
    
    
    downloadJSON(meshes, dummy, LODSdataGlobal) {
        if (!meshes) return;
console.log("ALL",LODSdataGlobal)        
        const annotatedMeshes = {
            data: {
                filename: window.fileData.name,
                fileDate: window.fileData.lastModifiedDate,
                fileSize: window.fileData.size
            },
            meshes: meshes,
            LODdata: LODSdataGlobal
        };
        
        console.log("LODS:", LODSdataGlobal);
        console.log(annotatedMeshes);
        
        const blob = new Blob([JSON.stringify(annotatedMeshes, null, 2)], {type:'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const JSONfilename = window.fileData.name.toLowerCase().replace(".pfb","");
        a.href = url; 
        a.download = JSONfilename + '.json';
        document.body.appendChild(a); 
        a.click(); 
        a.remove();
        URL.revokeObjectURL(url);
    }

    exportSingleLOD(meshes, lodLevel, LODSdataGlobal) {
console.log("SINGLE:",meshes, lodLevel, LODSdataGlobal)    
        if (!meshes || !LODSdataGlobal) return;
        
        console.log(`Exporting LOD level ${lodLevel}`);
        
        // Filtra le mesh basandosi sul LODSdataGlobal
        const filteredMeshes = [];
        const filteredLODdata = [];
        
        meshes.forEach((mesh, index) => {
            const geosetNum = mesh.metadata.geosetNum;
            // Usa lo stesso LODSdataGlobal per filtrare
            if (LODSdataGlobal[geosetNum] >= lodLevel) {
console.log("MESH con livello ", lodLevel)            
                filteredMeshes.push(mesh);
                // Nel LODdata filtrato, tutti i geoset avranno lo stesso livello
                //filteredLODdata[geosetNum] = lodLevel;
                filteredLODdata.push(lodLevel);
            }
        });

console.log("filteredMeshes=",filteredMeshes)
console.log("filteredMeshes.length=",filteredMeshes.length)
console.log("filteredLODdata",filteredLODdata)
console.log("filteredLODdata.length",filteredLODdata.length)


        if (filteredMeshes.length === 0) {
            alert(`No meshes found for LOD level ${lodLevel}`);
            return;
        }

        const annotatedMeshes = {
            data: {
                filename: window.fileData.name,
                fileDate: window.fileData.lastModifiedDate,
                fileSize: window.fileData.size,
                lodLevel: lodLevel,
                meshCount: filteredMeshes.length
            },
            meshes: filteredMeshes,
            LODdata: filteredLODdata
        };

        console.log(`Exported ${filteredMeshes.length} meshes for LOD level ${lodLevel}`, annotatedMeshes);
console.log(filteredLODdata)        
        const blob = new Blob([JSON.stringify(annotatedMeshes, null, 2)], {type:'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const JSONfilename = window.fileData.name.toLowerCase().replace(".pfb","");
        a.href = url; 
        a.download = `${JSONfilename}_lod${lodLevel}.json`;
        document.body.appendChild(a); 
        a.click(); 
        a.remove();
        URL.revokeObjectURL(url);
    }
}