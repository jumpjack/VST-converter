// UI management and table creation

class UIManager {
    constructor() {
        this.fileInput = document.getElementById('file');
        this.parseBtn = document.getElementById('parseBtn');
        this.pointCloudBtn = document.getElementById('pointCloudBtn');
        this.downloadJson = document.getElementById('downloadJson');
        this.showTreeBtn = document.getElementById('showTreeBtn');
        this.showLODSbtn = document.getElementById('showLODSbtn');
        this.clearLODSbtn = document.getElementById('clearLODSbtn');
        this.showBBOXbtn = document.getElementById('showBBOXbtn');
        this.clearBBOXbtn = document.getElementById('clearBBOXbtn');
        this.status = document.getElementById('status');
        this.divFileName = document.getElementById('divFileName');
this.lodLevelInput = document.getElementById('lodLevel');
this.exportSingleLODBtn = document.getElementById('exportSingleLOD');      
    }

setupEventHandlers(pfbParser, sceneManager, hierarchyManager, exportManager) {
    this.fileInput.addEventListener('change', () => {
        this.parseBtn.disabled = !this.fileInput.files.length;
        this.downloadJson.disabled = true;
        this.pointCloudBtn.disabled = true;
        this.showTreeBtn.disabled = true;
        this.showLODSbtn.disabled = true;
        this.clearLODSbtn.disabled = true;
        this.showBBOXbtn.disabled = true;
        this.clearBBOXbtn.disabled = true;
        this.lodLevelInput.disabled = !this.fileInput.files.length;
        this.exportSingleLODBtn.disabled = !this.fileInput.files.length;
    });
    
    this.exportSingleLODBtn.addEventListener('click', () => {
        const lodLevel = parseInt(this.lodLevelInput.value);
        if (isNaN(lodLevel) || lodLevel < 0) {
            alert("Please enter a valid LOD level (>= 0)");
            return;
        }
        exportManager.exportSingleLOD(sceneManager.meshes, lodLevel, window.LODSdataGlobal);
    });

    this.parseBtn.addEventListener('click', async () => {
        const f = this.fileInput.files[0];
        if (!f) return;
        
        window.fileData = f;
        this.divFileName.innerHTML = f.name;
        this.status.textContent = 'Reading file...';
        
        const ab = await f.arrayBuffer();
        try {
            const res = pfbParser.parsePFB(ab);     
            this.status.innerHTML = `<div class="ok">Parsing completed.</div>`;    
            window.currentJSON = res.json;
            
            console.log("Overall PFB file structure", window.currentJSON);    
            sceneManager.createMeshesFromFile(window.currentJSON);
            sceneManager.extractVerticesFromParsedJSON(window.currentJSON);    
            this.createTablesInPage(res);
            
            window.nodesListGlobal = window.currentJSON.lists.find(item => item.list_name.toLowerCase() === "node")?.elements ?? null;
            window.sceneHierarchy = hierarchyManager.buildHierarchy(window.nodesListGlobal);
            window.LODSdataGlobal = hierarchyManager.buildHierarchyLevels(window.nodesListGlobal);  
            
            // Abilita tutti i pulsanti
            this.downloadJson.disabled = false;
            this.pointCloudBtn.disabled = sceneManager.storedVertices.length === 0;
            this.showTreeBtn.disabled = sceneManager.storedVertices.length === 0;
            this.showLODSbtn.disabled = sceneManager.storedVertices.length === 0;
            this.clearLODSbtn.disabled = sceneManager.storedVertices.length === 0;
            this.showBBOXbtn.disabled = sceneManager.storedVertices.length === 0;
            this.clearBBOXbtn.disabled = sceneManager.storedVertices.length === 0;
            this.lodLevelInput.disabled = false;
            this.exportSingleLODBtn.disabled = false;

            // Mostra statistiche LOD
            const stats = hierarchyManager.getLODStatistics();
            console.log("LOD Statistics:", stats);
            const availableLevels = hierarchyManager.getAvailableLODLevels();
            console.log("Available LOD Levels:", availableLevels);
            
            // Aggiorna il valore massimo dell'input LOD
            if (availableLevels.length > 0) {
                const maxLOD = Math.max(...availableLevels);
                this.lodLevelInput.max = maxLOD;
                this.lodLevelInput.value = Math.min(0, maxLOD);
            }

        } catch(e) {
            this.status.innerHTML = `<div class="warn">Parsing fallito: ${e}</div>`;
            console.error(e);
        }
    });

    this.pointCloudBtn.addEventListener('click', () => {
        sceneManager.showPointCloud();
    });

    this.showTreeBtn.addEventListener('click', () => {
        hierarchyManager.displayFullHierarchy2(window.sceneHierarchy);
    });

    this.showLODSbtn.addEventListener('click', () => {
        sceneManager.showLODScenters(pfbParser.LODSlist);
    });

    this.clearLODSbtn.addEventListener('click', () => {
        sceneManager.clearLODSpheres();
    });

    this.showBBOXbtn.addEventListener('click', () => {
        const GSETSlist = window.currentJSON.lists.find(l => l.list_name.toLowerCase() === "geoset")?.elements.map(e => e.struct) || [];
        sceneManager.showBoundingBoxes(GSETSlist);
    });

    this.clearBBOXbtn.addEventListener('click', () => {
        sceneManager.clearBBoxMeshes();
    });

    this.downloadJson.addEventListener('click', () => {
        exportManager.downloadJSON(sceneManager.meshes, pfbParser.LODSlist, window.LODSdataGlobal);
    });


}
    createTablesInPage(res) {
        const container = document.createElement("div");
        container.style.marginTop = "20px";
        const title = document.createElement("h2");
        title.textContent = "GSETS in file";
        container.appendChild(title);
        
        const geosetTable = this.makeGsetTable();            
        container.appendChild(geosetTable);

        const title2 = document.createElement("h2");
        title2.textContent = "Nodes in PFB file (DEBUG)";
        container.appendChild(title2);
    
        container.appendChild(res.nodesTable);
        document.body.appendChild(container);    
    }

    makeGsetTable() {
        const gsetsList = window.currentJSON.lists.find(l => l.list_name.toLowerCase() === "geoset");
        console.log("[makeGsetTable] GSETS=", gsetsList);
        if (!gsetsList) return;

        const table = document.createElement("table");
        table.style.borderCollapse = "collapse";
        table.style.width = "100%";
        table.style.fontSize = "13px";

        const headerGroup = document.createElement("tr");
        headerGroup.appendChild(th(" "));

        const primGroup = th("Primitives");
        primGroup.colSpan = 3;
        primGroup.style.textAlign = "center";
        headerGroup.appendChild(primGroup);

        const groups = ["Coordinates", "Colors", "Normals", "Textures"];
        for (const g of groups){
            const thGroup = th(g);
            thGroup.colSpan = 3;
            thGroup.style.textAlign = "center";
            headerGroup.appendChild(thGroup);
        }

        const drawGroup = th("Drawing modes");
        drawGroup.colSpan = 3;
        drawGroup.style.textAlign = "center";
        headerGroup.appendChild(drawGroup);

        const gstateGroup = th("gstate");
        gstateGroup.colSpan = 2;
        gstateGroup.style.textAlign = "center";
        headerGroup.appendChild(gstateGroup);

        const simpleGroup = th("Drawing");
        simpleGroup.colSpan = 5;
        simpleGroup.style.textAlign = "center";
        headerGroup.appendChild(simpleGroup);

        const bboxGroup = th("Bounding box");
        bboxGroup.colSpan = 2;
        bboxGroup.style.textAlign = "center";
        headerGroup.appendChild(bboxGroup);

        const userGroup = th("userData");
        userGroup.colSpan = 1;
        userGroup.style.textAlign = "center";
        headerGroup.appendChild(userGroup);

        const drawGroup2 = th("Decaling");
        drawGroup2.colSpan = 6;
        drawGroup2.style.textAlign = "center";
        headerGroup.appendChild(drawGroup2);

        headerGroup.appendChild(th("bbox_flux"));
        table.appendChild(headerGroup);

        const header = document.createElement("tr");
        header.appendChild(th("N."));
        header.appendChild(th("Type"));
        header.appendChild(th("Count"));
        header.appendChild(th("Pointer to list of primitve lengths"));

        const A = [
            ["Binding","Pointer to list of coordinates","Pointer to list of indexes"],
            ["Binding","Pointer to list of colors","Pointer to list of indexes"],
            ["Binding","Pointer to list of normals","Pointer to list of indexes"],
            ["Binding","Pointer to list of textures","Pointer to list of indexes"]
        ];
        for (const triple of A){
            header.appendChild(th(triple[0]));
            header.appendChild(th(triple[1]));
            header.appendChild(th(triple[2]));
        }

        header.appendChild(th("Flatshade"));
        header.appendChild(th("Wireframe"));
        header.appendChild(th("Compile GL"));

        header.appendChild(th("Reference"));
        header.appendChild(th("Index"));

        header.appendChild(th("Line Wdith"));
        header.appendChild(th("Point Size"));
        header.appendChild(th("Drawing bin"));
        header.appendChild(th("Intersection Mask"));
        header.appendChild(th("Gset highlighting"));
        header.appendChild(th("Mode"));
        header.appendChild(th("____Values____"));
        header.appendChild(th("User data"));
        header.appendChild(th("Draw order"));
        header.appendChild(th("Plane"));

        header.appendChild(th("Plane nx"));
        header.appendChild(th("Plane ny"));
        header.appendChild(th("Plane nz"));
        header.appendChild(th("Plane offset"));

        header.appendChild(th("bbox_flux"));
        table.appendChild(header);

        let gsetcounter = 0;
        for (const elem of gsetsList.elements){
            const g = elem.struct;
            const row = document.createElement("tr");
            row.appendChild(td(`${gsetcounter})`));

            const primName = PrimTypeNames[g.ptype] || "?";
            row.appendChild(td(`${g.ptype} (${primName})`));
            row.appendChild(td(g.pcount));
            row.appendChild(td(g.llist));

            const emitTriple = (arr) => {
                const bind = arr[0];
                const list = arr[1];
                const ilist = arr[2];
                const bname = BindNames[bind] || "?";

                const displayList = list === -1 ? "[unused]" : list;
                const displayIlist = ilist === -1 ? "[unused]" : ilist;

                row.appendChild(td(`${bind} (${bname})`));
                row.appendChild(td(displayList));
                row.appendChild(td(displayIlist));
            };

            emitTriple(g.vlist);
            emitTriple(g.clist);
            emitTriple(g.nlist);
            emitTriple(g.tlist);

            const drawMode = (val, index, compileGLSetting = 2) => {
                const oo_table = [2, 0, 1];
                if (val < 0 || val > 2) return "UNKNOWN";
                const converted = oo_table[val];
                if (index === 2) {
                    if (compileGLSetting === 1 || (compileGLSetting === 2 && converted === 1)) {
                        return "ON";
                    } else {
                        return "off";
                    }
                } else {
                    return converted === 1 ? "ON" : "off";
                }
            };

            const compileGLSetting = 2;
            row.appendChild(td(drawMode(g.draw_mode[0], 0, compileGLSetting)));
            row.appendChild(td(drawMode(g.draw_mode[1], 1, compileGLSetting)));
            row.appendChild(td(drawMode(g.draw_mode[2], 2, compileGLSetting)));

            const checkValue = (val) => {
                return val === -1 ? "[unused]" : val;
            };

            row.appendChild(td(checkValue(g.gstate[0])));
            row.appendChild(td(checkValue(g.gstate[1])));
            row.appendChild(td(checkValue(g.line_width)));
            row.appendChild(td(checkValue(g.point_size)));
            row.appendChild(td(checkValue(g.draw_bin)));

            const mask = g.isect_mask >>> 0;
            const bmask = "0b" + mask.toString(2).padStart(32, "0");
            row.appendChild(td(bmask));
            row.appendChild(td(checkValue(g.hlight)));

            const bboxModeName = BBoxModeNames[g.bbox_mode] || "?";
            row.appendChild(td(`${g.bbox_mode} (${bboxModeName})`));

            let bboxTxt = "[not used]";
            if (g.bbox && typeof g.bbox === 'object') {
                const { min, max } = g.bbox;
                if (Array.isArray(min) && Array.isArray(max) && min.length === 3 && max.length === 3) {
                    const allValues = [...min, ...max];
                    if (allValues.some(v => v === -1)) {
                        bboxTxt = "[not used]";
                    } else if (allValues.every(v => Number.isFinite(v))) {
                        bboxTxt = `x: ${g.bbox.min[0].toFixed(1)}, ${g.bbox.max[0].toFixed(1)}\n
                                   y: ${g.bbox.min[1].toFixed(1)}, ${g.bbox.max[1].toFixed(1)}\n
                                   z: ${g.bbox.min[2].toFixed(1)}, ${g.bbox.max[2].toFixed(1)}\n `;
                    } else {
                        bboxTxt = JSON.stringify(g.bbox);
                    }
                }
            }
            row.appendChild(td(bboxTxt));

            row.appendChild(td(checkValue(g.udata)));
            row.appendChild(td(checkValue(g.draw_order)));
            row.appendChild(td(checkValue(g.decal_plane)));

            if (Array.isArray(g.decal_plane_normal)){
                row.appendChild(td(checkValue(g.decal_plane_normal[0])));
                row.appendChild(td(checkValue(g.decal_plane_normal[1])));
                row.appendChild(td(checkValue(g.decal_plane_normal[2])));
            } else {
                row.appendChild(td(""));
                row.appendChild(td(""));
                row.appendChild(td(""));
            }
            row.appendChild(td(checkValue(g.decal_plane_offset)));
            row.appendChild(td(checkValue(g.bbox_flux)));

            table.appendChild(row);
            gsetcounter++;
        }

        return table;
    }


}