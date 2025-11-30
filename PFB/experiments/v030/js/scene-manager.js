// Babylon.js scene management

class SceneManager {
    constructor() {
        this.engineRef = null;
        this.sceneRef = null;
        this.createdMeshes = [];
        this.storedVertices = [];
        this.meshData = [];
        this.meshes = [];
    }

    extractVerticesFromParsedJSON(parsed) {
        this.storedVertices = [];
        this.meshData = [];

        for (const lst of parsed.lists) {
            if (lst.list_id === 5) {
                for (const elem of lst.elements) {
                    if (elem.struct && elem.struct.vertices) {
                        for (const v of elem.struct.vertices) {
                            this.storedVertices.push([v.x || 0, v.y || 0, v.z || 0]);
                        }
                    }
                }
            }
        }

        const gsetLists = parsed.lists.filter(l=>l.list_name.toLowerCase()==="geoset");
        for (const gList of gsetLists) {
            for (let gi = 0; gi < gList.elements.length; gi++) {
                const el = gList.elements[gi];
                const g = el.struct;
                if (!g) continue;

                const lidx = (typeof g.llistIndex === 'number' && g.llistIndex >=0) ? g.llistIndex : null;
                const vidx = (typeof g.vlistIndex === 'number' && g.vlistIndex >=0) ? g.vlistIndex : null;
                let lengths = [];
                let verts = [];
                
                if (lidx !== null && parsed.lists.some(l=>l.list_id===4 && l.elements[lidx])) {
                    const ll = parsed.lists.find(l=>l.list_id===4);
                    if (ll && ll.elements[lidx] && ll.elements[lidx].struct && ll.elements[lidx].struct.ints) lengths = ll.elements[lidx].struct.ints.slice();
                }
                if (vidx !== null && parsed.lists.some(l=>l.list_id===5 && l.elements[vidx])) {
                    const vl = parsed.lists.find(l=>l.list_id===5);
                    if (vl && vl.elements[vidx] && vl.elements[vidx].struct && vl.elements[vidx].struct.vertices) verts = vl.elements[vidx].struct.vertices.slice();
                }
                this.meshData.push({ gset: g, lengths, vertices: verts, gsetListIndex: gi });
            }
        }
    }

    createMeshesFromFile(currentJSON) {
console.log("[createMeshesFromFile]  start");    
        this.meshes = [];
        const getListById = name => currentJSON.lists.find(l => l.list_name.toLowerCase() === name);
        const llist = getListById("length list");
        const vlist = getListById("vertex list");
        const nlist = getListById("normal list");
        const gsets = getListById("geoset");

console.log("[createMeshesFromFile] llist", llist);    


        if (!gsets) return;

        console.log("[createMeshesFromFile] - creo " , gsets.count , " mesh...");
        for (let geosetIndex = 0; geosetIndex < gsets.count; geosetIndex++) {
            try {
                const geoset = gsets.elements[geosetIndex].struct;
                const myMesh = {};
                if (llist.elements[geoset.llist]) {
                    myMesh.lengths = llist.elements[geoset.llist].struct.ints;
                    myMesh.vertices = vlist.elements[geoset.vlist[1]].struct.vertices;
                    myMesh.normals = nlist.elements[geoset.nlist[1]].struct.normals;
                    myMesh.metadata = {
                        geosetNum : geosetIndex,
                        primType : geoset.ptype,
                        primitivePointer: geoset.llist,
                        vertexPointer: geoset.vlist[1],
                        vertexBinding : geoset.vlist[0],
                        normBinding: geoset.nlist[0]
                    };
                    this.meshes.push(myMesh);
                } else {
                    myMesh.lengths = "n/a";
                    myMesh.vertices = vlist.elements[geoset.vlist[1]].struct.vertices;
                    myMesh.normals = nlist.elements[geoset.nlist[1]].struct.normals;
                    myMesh.metadata = {
                        geosetNum : geosetIndex,
                        primType : geoset.ptype,
                        primitivePointer: geoset.llist,
                        vertexPointer: geoset.vlist[1],
                        vertexBinding : geoset.vlist[0],
                        normBinding: geoset.nlist[0],
                        warning: "PFGS_TRIS, not PFGS_FLAT_TRISTRIPS!"
                    };
                    this.meshes.push(myMesh);
                }
            } catch (e) {
                console.log("Errore 001",e);
            }
        }
    }

    showPointCloud() {
        if (!this.storedVertices.length) return;
        
        const canvas = document.getElementById('babylonCanvas');
        if (this.engineRef) { 
            try { this.engineRef.dispose(); } catch(e){} 
        }
        
        this.engineRef = new BABYLON.Engine(canvas, true);
        const scene = new BABYLON.Scene(this.engineRef);
        this.sceneRef = scene;
        scene.clearColor = new BABYLON.Color4(0.98,0.98,0.98,1);
        const camera = new BABYLON.ArcRotateCamera("cam", -Math.PI/2, Math.PI/2.5, 50, BABYLON.Vector3.Zero(), scene);
        camera.attachControl(canvas, true);
        new BABYLON.HemisphericLight("h", new BABYLON.Vector3(0,1,0), scene);

        const pcs = new BABYLON.PointsCloudSystem("pcs", { capacity: this.storedVertices.length, scene });
        pcs.addPoints(this.storedVertices.length, (p,i) => { 
            const v = this.storedVertices[i]; 
            p.position.set(v[0], v[1], v[2]); 
            p.color = new BABYLON.Color4(0.1,0.1,0.1,0.6); 
        });
        
        pcs.buildMeshAsync().then(()=>{ 
            pcs.mesh.material.pointSize = 1; 
        });

        this.createdMeshes.forEach(m=>m.dispose && m.dispose());
        this.createdMeshes = this.buildMeshesFromGSet(scene);

        this.engineRef.runRenderLoop(()=>scene.render());
        window.addEventListener('resize', ()=>this.engineRef.resize());
    }

    buildMeshesFromGSet(scene) {
        const outMeshes = [];
        for (let i=0; i < this.meshData.length; i++){
            const entry = this.meshData[i];
            const g = entry.gset;
            const lengths = entry.lengths || [];
            const verts = entry.vertices || [];
            let positions = [], indices = [];
            let cursor = 0;
            const prim = g.ptype;

            for (let j=0; j < lengths.length; j++){
                const polyLen = lengths[j];
                if (cursor + polyLen > verts.length) { 
                    console.warn(`mesh ${i} face ${j} exceeds verts`); 
                    break; 
                }
                const base = positions.length/3;
                for (let k=0;k<polyLen;k++){
                    const v = verts[cursor + k];
                    positions.push((v.x||0), (v.y||0), (v.z||0));
                }
                if (prim === 3 && polyLen === 3) { 
                    indices.push(base, base+1, base+2); 
                } else if (prim === 4 && polyLen === 4) { 
                    indices.push(base, base+1, base+2); 
                    indices.push(base, base+2, base+3); 
                } else if ((prim === 5 || prim === 7) && polyLen >= 3) {
                    for (let k=2;k<polyLen;k++){
                        if ((k%2)===0) indices.push(base+k-2, base+k-1, base+k); 
                        else indices.push(base+k-2, base+k, base+k-1);
                    }
                } else if ((prim === 9 || prim === 10) && polyLen >=3) {
                    for (let k=2;k<polyLen;k++) indices.push(base, base+k-1, base+k);
                } else if (prim === 8 && polyLen >= 3) {
                    const flat2 = []; 
                    for (let k=0;k<polyLen;k++){ 
                        const v=verts[cursor+k]; 
                        flat2.push(v.x||0, v.y||0); 
                    }
                    const tris = earcut(flat2, [], 2);
                    for (const t of tris) indices.push(base + t);
                } else {
                    if (polyLen === 3) indices.push(base, base+1, base+2);
                }
                cursor += polyLen;
            }

            if (positions.length > 0 && indices.length > 0) {
                const mesh = new BABYLON.Mesh(`mesh_${i}`, scene);
                const vd = new BABYLON.VertexData();
                vd.positions = positions; 
                vd.indices = indices;
                vd.normals = []; 
                BABYLON.VertexData.ComputeNormals(positions, indices, vd.normals);
                vd.applyToMesh(mesh);
                const mat = new BABYLON.StandardMaterial(`mat_${i}`, scene);
                mat.diffuseColor = new BABYLON.Color3(0.85,0.85,0.85);
                mat.backFaceCulling = false;
                mesh.material = mat;

                const lines = BABYLON.MeshBuilder.CreateLineSystem(`lines_${i}`, 
                    { lines: this.buildEdgesFromIndices(positions, indices) }, scene);
                lines.color = new BABYLON.Color3(0.1,0.1,0.1);

                const pivot = new BABYLON.TransformNode(`group_${i}`, scene);
                mesh.parent = pivot; 
                lines.parent = pivot;
                outMeshes.push(pivot);
            } else {
                console.warn(`mesh ${i} invalid (no positions/indices)`);
            }
        }

        console.log(`Built ${outMeshes.length} meshes from GSETs`);
        return outMeshes;
    }

    buildEdgesFromIndices(positions, indices) {
        const lines = []; 
        const edges = new Set();
        for (let t=0;t<indices.length;t+=3){
            const a = indices[t], b = indices[t+1], c = indices[t+2];
            [[a,b],[b,c],[c,a]].forEach(pair=>{
                const key = pair[0]<pair[1] ? `${pair[0]}_${pair[1]}` : `${pair[1]}_${pair[0]}`;
                if (!edges.has(key)){ 
                    edges.add(key); 
                    const p0 = [positions[pair[0]*3], positions[pair[0]*3+1], positions[pair[0]*3+2]]; 
                    const p1 = [positions[pair[1]*3], positions[pair[1]*3+1], positions[pair[1]*3+2]]; 
                    lines.push([ new BABYLON.Vector3(...p0), new BABYLON.Vector3(...p1) ]); 
                }
            });
        }
        return lines;
    }

    showLODScenters(LODSlist) {
        if (!this.engineRef || !this.sceneRef) return;
        
        const scene = this.sceneRef;
        
        if (window.lodSpheres) {
            window.lodSpheres.forEach(sphere => sphere.dispose());
        }
        window.lodSpheres = [];
        
        LODSlist.forEach((lod, index) => {
            const x = parseFloat(lod.coords[0]);
            const z = parseFloat(lod.coords[1]); 
            const y = -parseFloat(lod.coords[2]);
            
            const sphere = BABYLON.MeshBuilder.CreateBox(`lodBox_${index}`, {
                width: 1,
                depth: 1,
                height: 3 * lod.ranges.length
            }, scene);
            
            sphere.position = new BABYLON.Vector3(x, y + 1.5* lod.ranges.length, z);
            
            const material = new BABYLON.StandardMaterial(`lodMat_${index}`, scene);
            const rangeCount = lod.ranges.length;
            const color = new BABYLON.Color4(0.5, 0.5, 0.5, 1);

            material.diffuseColor = new BABYLON.Color3(color.r, color.g, color.b);
            material.alpha = color.a;
            sphere.material = material;
            
            const label = this.createLODLabel(scene, sphere, lod, index, rangeCount,x,y,z,3 * lod.ranges.length);
            
            window.lodSpheres.push(sphere);
        });
        
        console.log(`Visualizzati ${window.lodSpheres.length} centri LOD`);
    }

    createLODLabel(scene, sphere, lod, index, rangeCount,x,y,z,h) {
        const plane = BABYLON.MeshBuilder.CreatePlane(`lodLabel_${index}`, {
            width: 4,
            height: 1
        }, scene);
        
        plane.position = sphere.position.clone();
        plane.position.y = y+h+2;

        const dynamicTexture = new BABYLON.DynamicTexture(`lodTexture_${index}`, {
            width: 256,
            height: 64
        }, scene);

        const material = new BABYLON.StandardMaterial(`lodLabelMat_${index}`, scene);
        material.diffuseTexture = dynamicTexture;
        material.emissiveColor = new BABYLON.Color3(1, 1, 1);
        material.specularColor = new BABYLON.Color3(0, 0, 0);
        material.backFaceCulling = false;
        plane.material = material;
        
        const context = dynamicTexture.getContext();
        context.font = "bold 24px Arial";
        context.fillStyle = "white";
        context.strokeStyle = "black";
        context.lineWidth = 2;
        context.textAlign = "center";
        
        const text = `LOD ${index}\nRanges: ${rangeCount}`;
        const lines = text.split('\n');
        
        context.clearRect(0, 0, 256, 64);
        context.fillStyle = "rgba(0,0,0,0.7)";
        context.fillRect(0, 0, 256, 64);
        
        context.fillStyle = "white";
        lines.forEach((line, i) => {
            context.strokeText(line, 128, 25 + i * 25);
            context.fillText(line, 128, 25 + i * 25);
        });
        
        dynamicTexture.update();
        plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

        return plane;
    }

    clearLODSpheres() {
        if (window.lodSpheres) {
            window.lodSpheres.forEach(sphere => {
                sphere.dispose();
                const label = this.sceneRef.getMeshByName(`lodLabel_${sphere.name.split('_')[1]}`);
                if (label) label.dispose();
            });
            window.lodSpheres = [];
        }
    }

    showBoundingBoxes(GSETSlist) {
        if (!this.engineRef || !this.sceneRef) return;

        const scene = this.sceneRef;

        if (window.bboxMeshes) {
            window.bboxMeshes.forEach(mesh => mesh.dispose());
        }
        window.bboxMeshes = [];

        const colorScheme = [
            new BABYLON.Color4(1, 0, 0, 0.3),
            new BABYLON.Color4(0, 1, 0, 0.3),
            new BABYLON.Color4(0, 0, 1, 0.3),
            new BABYLON.Color4(1, 1, 0, 0.3),
            new BABYLON.Color4(1, 0, 1, 0.3),
            new BABYLON.Color4(0, 1, 1, 0.3)
        ];

        GSETSlist.forEach((gset, index) => {
            if (gset.bbox) {
                const bbox = gset.bbox;

                const minX = parseFloat(bbox.min[0]);
                const minY = parseFloat(bbox.min[2]);
                const minZ = parseFloat(bbox.min[1]);

                const maxX = parseFloat(bbox.max[0]);
                const maxY = parseFloat(bbox.max[2]);
                const maxZ = parseFloat(bbox.max[1]);

                const width = maxX - minX;
                const height = maxY - minY;
                const depth = maxZ - minZ;

                const centerX = minX + width / 2;
                const centerY = minY + height / 2;
                const centerZ = minZ + depth / 2;

                const bboxMesh = BABYLON.MeshBuilder.CreateBox(`bbox_${index}`, {
                    width: width,
                    height: height,
                    depth: depth
                }, scene);

                bboxMesh.position = new BABYLON.Vector3(centerX, centerY, centerZ);

                const material = new BABYLON.StandardMaterial(`bboxMat_${index}`, scene);
                const color = colorScheme[index % colorScheme.length];

                material.diffuseColor = new BABYLON.Color3(color.r, color.g, color.b);
                material.alpha = color.a;
                material.specularColor = new BABYLON.Color3(0, 0, 0);
                material.wireframe = true;
                material.backFaceCulling = false;

                bboxMesh.material = material;

                const label = this.createBBoxLabel(scene, bboxMesh, gset, index, minX, minY, minZ, maxX, maxY, maxZ);

                window.bboxMeshes.push(bboxMesh);

                console.log(`GSET ${index}: BBox [${bbox.min}] -> [${bbox.max}], Dim: ${width.toFixed(2)}x${height.toFixed(2)}x${depth.toFixed(2)}`);
            }
        });

        console.log(`Visualizzati ${window.bboxMeshes.length} bounding box GSET`);
    }

    createBBoxLabel(scene, bboxMesh, gset, index, minX, minY, minZ, maxX, maxY, maxZ) {
        const plane = BABYLON.MeshBuilder.CreatePlane(`bboxLabel_${index}`, {
            width: 6,
            height: 2
        }, scene);

        plane.position = bboxMesh.position.clone();
        plane.position.x -=1;
        plane.position.y += (maxY - minY) / 2 - 2;

        const dynamicTexture = new BABYLON.DynamicTexture(`bboxTexture_${index}`, {
            width: 256,
            height: 128
        }, scene);

        const material = new BABYLON.StandardMaterial(`bboxLabelMat_${index}`, scene);
        material.diffuseTexture = dynamicTexture;
        material.emissiveColor = new BABYLON.Color3(1, 1, 1);
        material.specularColor = new BABYLON.Color3(0, 0, 0);
        material.backFaceCulling = false;
        plane.material = material;

        const context = dynamicTexture.getContext();
        context.font = "bold 20px Arial";
        context.fillStyle = "white";
        context.strokeStyle = "black";
        context.lineWidth = 2;
        context.textAlign = "center";

        const lines = [
            `GSET ${index}`,
            `LOD: ${gset.LODS ? gset.LODS.length : 0}`,
            `Size: ${(maxX - minX).toFixed(1)}x${(maxY - minY).toFixed(1)}x${(maxZ - minZ).toFixed(1)}`
        ];

        context.clearRect(0, 0, 256, 128);
        context.fillStyle = "rgba(0,0,0,0.8)";
        context.fillRect(0, 0, 256, 128);

        context.fillStyle = "white";
        lines.forEach((line, i) => {
            context.strokeText(line, 128, 30 + i * 30);
            context.fillText(line, 128, 30 + i * 30);
        });

        dynamicTexture.update();
        plane.billboardMode = BABYLON.Mesh.BILLBOARDMODE_ALL;

        return plane;
    }

    clearBBoxMeshes() {
        if (window.bboxMeshes) {
            window.bboxMeshes.forEach(mesh => {
                mesh.dispose();
                const label = this.sceneRef.getMeshByName(`bboxLabel_${mesh.name.split('_')[1]}`);
                if (label) label.dispose();
            });
            window.bboxMeshes = [];
        }
    }
}