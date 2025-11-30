class HierarchyManager {
    constructor() {
        this.LODcountLocal = -1;
        this.geodesCountLocal = -1;
        this.groupsCountLocal = -1;
        this.geosetsCountLocal = -1;
        this.rangesCountLocal = -1;
    }

    buildHierarchy(allNodes) {
        const hierarchy = {
            PFBnodeItem: [],
            nodesStructure: [],
            stats: {
                totalNodes: allNodes.length,
                byType: {},
                lodsWithChildren: 0,
                groupsWithChildren: 0
            }
        };

        console.log("Costruisco gerarchia di:", allNodes);

        // Prima passata: crea tutti i nodi nella gerarchia
        allNodes.forEach((originalNode, index) => {
            const node = {
                id: index,
                type: originalNode.type,
                typeName: originalNode.typeName,
                name: originalNode.name || `node_${index}`,
                originalStruct: originalNode.struct,
                children: [],
                parent: null,
                byteLength: originalNode.byteLength,
                offset: originalNode.offset
            };

            if (!hierarchy.stats.byType[node.typeName]) {
                hierarchy.stats.byType[node.typeName] = 0;
            }
            hierarchy.stats.byType[node.typeName]++;

            hierarchy.PFBnodeItem.push(node);
        });

        // Seconda passata: collega i figli
        hierarchy.PFBnodeItem.forEach((node, index) => {
            const originalNode = allNodes[index];

            if (originalNode.struct && originalNode.struct.children) {
                const childIndices = originalNode.struct.children;

                childIndices.forEach(childIndex => {
                    let actualIndex = childIndex;

                    if (actualIndex < 0 || actualIndex >= hierarchy.PFBnodeItem.length) {
                        console.warn(`  Indice figlio ${actualIndex} fuori range, skipping`);
                        return;
                    }

                    const childNode = hierarchy.PFBnodeItem[actualIndex];
                    if (childNode) {
                        node.children.push(childNode);
                        childNode.parent = node;

                        if (node.typeName === "LOD") hierarchy.stats.lodsWithChildren++;
                        if (node.typeName === "GROUP") hierarchy.stats.groupsWithChildren++;
                    } else {
                        console.warn(`  Figlio ${actualIndex} non trovato`);
                    }
                });
            }
        });

        // Terza passata: trova i nodi radice (senza parent)
        hierarchy.nodesStructure = hierarchy.PFBnodeItem.filter(node => node.parent === null);

        return hierarchy;
    }

    buildHierarchyLevels(allNodes) {
        const hierarchy = this.buildHierarchy(allNodes);
        hierarchy.geosetLODLevel = this.buildGeosetLODLevelArray(hierarchy);
        
        console.log("=== GERARCHIA COMPLETATA ===");
        console.log("Array geosetLODLevel creato:", JSON.stringify(hierarchy.geosetLODLevel));
        
        return hierarchy.geosetLODLevel;
    }

    buildGeosetLODLevelArray(hierarchy) {
        // Inizializza l'array geosetLODLevel
        const geosetLODLevel = [];
        
        // Trova tutti i nodi di tipo Geode
        const allGeodes = hierarchy.PFBnodeItem.filter(node => 
            node.typeName && node.typeName.toLowerCase() === 'geode'
        );

        // Per ogni Geode, trova il LOD parent e la posizione nel LOD
        allGeodes.forEach(geode => {
            // Risali fino al LOD parent
            let current = geode;
            let lodNode = null;
            
            while (current.parent) {
                current = current.parent;
                if (current.typeName && current.typeName.toLowerCase() === 'lod') {
                    lodNode = current;
                    console.log("Found parent lod of geode");
                    break;
                }
            }
            
            if (!lodNode) {
                console.warn(`Geode ${geode.id} non ha un parent LOD`);
                return;
            }
            
            // Trova la posizione di questo Geode tra i children del LOD
            let lodLevelIndex = -1;

            // Itera attraverso i children del LOD per trovare quale branch porta a questo Geode
            lodNode.children.forEach((child, index) => {
                if (this.isNodeInBranch(child, geode)) {
                    lodLevelIndex = index;
                }
            });
            
            if (lodLevelIndex === -1) {
                console.warn(`Non riesco a trovare il livello LOD per Geode ${geode.id}`);
                return;
            }
            
            // Assegna questo livello LOD a tutti i geoset contenuti in questo Geode
            if (geode.originalStruct && geode.originalStruct.geosets) {
                geode.originalStruct.geosets.forEach(geosetId => {
                    geosetLODLevel[geosetId] = lodLevelIndex;
                });
            }
        });
        
        return geosetLODLevel;
    }

    isNodeInBranch(root, target) {
        if (root === target) return true;
        for (const child of root.children) {
            if (this.isNodeInBranch(child, target)) {
                return true;
            }
        }
        return false;
    }

    displayFullHierarchy2(hierarchy) {
        let treeText = "";

        this.LODcountLocal = -1;
        this.geodesCountLocal = -1;
        this.groupsCountLocal = -1;
        this.geosetsCountLocal = -1;
        this.rangesCountLocal = -1;

        window.GEOSETdata = [];
        const maxGeosetId = window.currentJSON.lists
            .find(l => l.list_name.toLowerCase() === "geoset").elements.length;

        for (let i = 0; i < maxGeosetId; i++) {
            window.GEOSETdata[i] = null;
        }

        const normalizeGeodes = (node) => {
            node.children = node.children || [];

            if (/geode/i.test(node.typeName) &&
                node.originalStruct &&
                Array.isArray(node.originalStruct.geosets)) {

                node._geosetList = [...node.originalStruct.geosets];

                node.originalStruct.geosets.forEach(id => {
                    node.children.push({
                        id,
                        typeName: "Geoset",
                        name: `n.${id}`,
                        children: [],
                        parent: node
                    });
                });
            }

            node.children.forEach(normalizeGeodes);
        };

        const normalizeLOD = (node) => {
            if (/lod/i.test(node.typeName) &&
                node.originalStruct &&
                Array.isArray(node.originalStruct.ranges)) {

                const oldChildren = node.children || [];
                const rangeNodes = [];

                node.originalStruct.ranges.forEach((_, i) => {
                  if (i < node.originalStruct.ranges.length - 1) {
                      rangeNodes.push({
                          id: node.id,
                          typeName: "Range",
                          rangeIndex: i,
                          name: `${i}`,
                          children: [],
                          parent: node
                      });
                  }
                });

                oldChildren.forEach((child, i) => {
                    const r = Math.min(i, rangeNodes.length - 1);
                    rangeNodes[r].children.push(child);
                    child.parent = rangeNodes[r];
                });

                node.children = rangeNodes;
            }

            node.children && node.children.forEach(normalizeLOD);
        };

        hierarchy.nodesStructure.forEach(normalizeGeodes);
        hierarchy.nodesStructure.forEach(normalizeLOD);

        const container = document.createElement("div");
        container.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            width: 600px;
            height: 90vh;
            background: white;
            border: 2px solid #333;
            padding: 10px;
            overflow: auto;
            font-family: monospace;
            font-size: 12px;
            z-index: 10000;
            box-shadow: 0 0 20px rgba(0,0,0,0.5);
        `;

        const title = document.createElement("h3");
        title.textContent = "GERARCHIA COMPLETA SCENA";
        title.style.cssText = `
            margin: 0 0 10px 0;
            padding: 5px;
            background: #333;
            color: white;
            text-align: center;
        `;
        container.appendChild(title);

        const closeBtn = document.createElement("button");
        closeBtn.textContent = "CHIUDI";
        closeBtn.style.cssText = `
            position: absolute;
            top: 5px;
            right: 5px;
            background: red;
            color: white;
            border: none;
            padding: 2px 8px;
            cursor: pointer;
        `;
        closeBtn.onclick = () => container.remove();
        container.appendChild(closeBtn);

        const lengthList  = getListByName(window.currentJSON, "length list");
        const vertexList  = getListByName(window.currentJSON, "vertex list");
        const normalList  = getListByName(window.currentJSON, "normal list");
        const colorList   = getListByName(window.currentJSON, "color list");
        const texCoordList = getListByName(window.currentJSON, "texcoord list");
        const nodesList   = getListByName(window.currentJSON, "node");
        const indexList   = getListByName(window.currentJSON, "index list");
        const geosetsList = getListByName(window.currentJSON, "geoset");

        console.log("--- FILE STATS -------");
        this.logList("Lengths",  lengthList);
        this.logList("Vertex",   vertexList);
        this.logList("Normals",  normalList);
        this.logList("Colors",   colorList);
        this.logList("Textures", texCoordList);
        this.logList("Geosets",  geosetsList);
        this.logList("Nodes",    nodesList);
        this.logList("Indexes",  indexList);

        const stats = document.createElement("div");
        stats.innerHTML = `
            <div><strong>Nodi totali:</strong> ${hierarchy.PFBnodeItem.length}</div>
            <div><strong>Nodi radice:</strong> ${hierarchy.nodesStructure.length}</div>
            <div><strong>LOD trovati:</strong> ${hierarchy.PFBnodeItem.filter(n => n.typeName && n.typeName.toLowerCase().includes('lod')).length}</div>
            <div><strong>Group trovati:</strong> ${hierarchy.PFBnodeItem.filter(n => n.typeName && n.typeName.toLowerCase().includes('group')).length}</div>
            <div><strong>Geodes trovati:</strong> ${hierarchy.PFBnodeItem.filter(n => n.typeName && n.typeName.toLowerCase().includes('geode')).length}</div>
            <div><strong>GeoSet trovati:</strong> ${hierarchy.PFBnodeItem.filter(n => n.typeName && n.typeName.toLowerCase().includes('geoset')).length}</div>
            <div><strong>len:</strong> ${lengthList.elements.length}</div>
            <div><strong>vert:</strong> ${vertexList.elements.length}</div>
            <div><strong>norm:</strong> ${normalList.elements.length}</div>
            <div><strong>col:</strong> ${colorList.elements.length}</div>
        `;
        stats.style.cssText = `
            background: #f0f0f0;
            padding: 8px;
            margin-bottom: 10px;
            border-radius: 4px;
            font-size: 11px;
        `;
        container.appendChild(stats);

        const treeContainer = document.createElement("div");
        treeContainer.id = "hierarchy-tree";

        const hasRealName = (name) => {
            return (
                typeof name === "string" &&
                name.trim() !== "" &&
                name.toLowerCase() !== "n/a"
            );
        };

        const createNode = (node, depth = 0) => {
            const div = document.createElement("div");
            div.style.marginLeft = depth * 5 + "px";

            const isLOD = /lod/i.test(node.typeName);
            const isGroup = /group/i.test(node.typeName);
            const isGeode = /geode/i.test(node.typeName);
            const isGeoset = /geoset/i.test(node.typeName);
            const isRange = /range/i.test(node.typeName);

            const hasChildren = node.children && node.children.length > 0;

            const folder = hasChildren ? "📁" : "📄";
            const icon =
                isLOD ? "🎯" :
                isGroup ? "📦" :
                isRange ? "📏" :
                isGeode ? "🔶" :
                isGeoset ? "⭐" : "🔹";

            let text = `[${node.id}] ${node.typeName}`;

            if (isLOD) {
                this.LODcountLocal++;
                this.rangesCountLocal += node.children.length;
                text += ` ${this.LODcountLocal}`;
            }

            if (isGroup) {
                this.groupsCountLocal++;
                text += ` ${this.groupsCountLocal}`;
            }

            if (isGeode) {
                this.geodesCountLocal++;
                const list = node._geosetList || [];
                text += ` ${this.geodesCountLocal}: ${list.length} geosets`;
            }

            if (isRange) {
                text += ` ${node.name}`;
            }

            if (isGeoset) {
                this.geosetsCountLocal++;
                if(node.name)
                text += ` ${node.name}`;
            }

            if (hasRealName(node.name) && !isRange && !isGeode && !isGeoset) {
                if(node.name)
                text += ` "${node.name}"`;
            }

            div.textContent = `${folder} ${icon} ${text}`;
            treeText += "  ".repeat(depth) + "└─ " + `${folder} ${icon} ${text}\n`;

            if (hasChildren) {
                const c = document.createElement("div");
                node.children.forEach(ch => c.appendChild(createNode(ch, depth + 1)));

                div.onclick = e => {
                    e.stopPropagation();
                    c.style.display = c.style.display === "none" ? "block" : "none";
                };

                div.appendChild(c);
            }

            return div;
        };

        hierarchy.nodesStructure.forEach(r =>
            treeContainer.appendChild(createNode(r))
        );

        container.appendChild(treeContainer);
        document.body.appendChild(container);

        console.log(treeText);
    }

    logList(label, list) {
        if (!list) {
            console.warn(`${label}: assente`);
            return;
        }

        const size =
            Array.isArray(list.elements) ? list.elements.length :
            Array.isArray(list) ? list.length :
            typeof list.length === "number" ? list.length :
            "sconosciuto";

        console.log(`${label}:`, size);
    }

    getAvailableLODLevels() {
        if (!window.LODSdataGlobal) return [];
        
        const levels = new Set();
        for (let i = 0; i < window.LODSdataGlobal.length; i++) {
            if (window.LODSdataGlobal[i] !== undefined) {
                levels.add(window.LODSdataGlobal[i]);
            }
        }
        return Array.from(levels).sort((a, b) => a - b);
    }

    getLODStatistics() {
        if (!window.LODSdataGlobal) return {};
        
        const stats = {};
        for (let i = 0; i < window.LODSdataGlobal.length; i++) {
            const level = window.LODSdataGlobal[i];
            if (level !== undefined) {
                stats[level] = (stats[level] || 0) + 1;
            }
        }
        return stats;
    }
}