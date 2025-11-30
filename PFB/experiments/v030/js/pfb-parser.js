// PFB parsing functionality

class PFBParser {
    constructor() {
        this.nodesCounter = [];
        this.lodsPerRanges = [];
        this.LODSlist = [];
        this.nodesListGlobal = [];
        this.geodesCount = 0;
        this.geodesListGlobal = [];
        this.LODcounterGlobal = -1;
    }

    parsePFB(arrayBuffer) {
        const view = new DataView(arrayBuffer);
        const len = arrayBuffer.byteLength;

        console.log("[parsePFB] start");
        if (len < 16) throw new Error('File troppo piccolo.');

        // 1. Parsing Header File
        const hLE = [readInt32v(view, 0, true), readInt32v(view, 4, true), readInt32v(view, 8, true), readInt32v(view, 12, true)];
        const hBE = [readInt32v(view, 0, false), readInt32v(view, 4, false), readInt32v(view, 8, false), readInt32v(view, 12, false)];

        let little;
        if (hLE[1] === 26 && hLE[3] >= 0 && hLE[3] < len) little = true;
        else if (hBE[1] === 26 && hBE[3] >= 0 && hBE[3] < len) little = false;
        else { little = true; console.warn("Non trovato header versione 26; assumo little-endian"); }

        const version = (little ? hLE[1] : hBE[1]);
        const listsStart = (little ? hLE[3] : hBE[3]);

        if (listsStart < 0 || listsStart >= len) throw new Error('Offset liste invalido: ' + listsStart);

        console.log("[parsePFB] Parsing lists...");

        // 2. Parsing Liste Dati 
        const { lists, parsePFBnodesTable } = this.parseDataLists(arrayBuffer, view, listsStart, len, little);

        console.log("[parsePFBMain] lists", lists);

        // 3. Costruzione JSON finale
        const json = {
            parsed_at: (new Date()).toISOString(),
            file_size: len,
            detected_version: version,
            little_endian_assumed: little,
            lists: lists
        };

        return { json, nodesTable: parsePFBnodesTable };
    }

    parseDataLists(arrayBuffer, view, startPos, len, little) {
        let pos = startPos;
        const lists = [];
        let parsePFBnodesTable = null;

        while (pos + 12 <= len) {
            const list_id = readInt32v(view, pos, little);
            const list_name = L_NAMES[list_id];
            const list_count = readInt32v(view, pos + 4, little);
            const data_byte_size = readInt32v(view, pos + 8, little);

            if (list_id === 0 && list_count === 0 && data_byte_size === 0) break;

            const dataStart = pos + 12;
            const dataEnd = dataStart + data_byte_size;
            if (dataEnd > len) { break }

            const listObj = {
                list_id,
                list_name: L_NAMES[list_id] || ('Unknown(' + list_id + ')'),
                count: list_count,
                offset_header: toHex32(pos),
                offset_data_start: toHex32(dataStart),
                offset_end: toHex32(dataEnd - 1),
                length_bytes: 12 + data_byte_size,
                raw_data_length: data_byte_size,
                struct: null,
                elements: []
            };

            if (list_name.toLowerCase() === "geoset" && list_count > 0) {
                this.processGSetList(listObj, arrayBuffer, dataStart, dataEnd, list_count, little);
            } else if (list_name.toLowerCase() === "node" && list_count > 0) {
                parsePFBnodesTable = this.processNodeList(listObj, arrayBuffer, dataStart, dataEnd);
            } else if (SLIST_IDS.has(list_id)) {
                this.parseSListElements(arrayBuffer, view, dataStart, dataEnd, list_id, little, listObj);
            } else if (list_name.toLowerCase() === "material" || list_name.toLowerCase() === "texture" || list_name.toLowerCase() === "texenv") {
                this.parseListFixedElements(arrayBuffer, view, dataStart, dataEnd, list_id, list_count, little, listObj);
            } else {
                this.processRawList(listObj, arrayBuffer, dataStart, dataEnd);
            }

            lists.push(listObj);
            pos = dataEnd;
        }

        return { lists, parsePFBnodesTable };
    }

    processGSetList(listObj, arrayBuffer, dataStart, dataEnd, list_count, little) {
        const raw = new Uint8Array(arrayBuffer.slice(dataStart, dataEnd));
        const raw32 = new Uint32Array(arrayBuffer.slice(dataStart, dataEnd));
        const elemByteSize = Math.floor(raw.length / list_count);

        for (let i = 0; i < list_count; i++) {
            const off = i * elemByteSize;
            const chunk = raw.subarray(off, off + elemByteSize);
            const parsedG = this.parseGSetElement(chunk, little);
            
            listObj.elements.push({
                index: i,
                offset: toHex32(dataStart + off),
                offset_dec: dataStart + off,
                length: chunk.length,
                struct: parsedG.elements,
                debug8: parsedG.debug8,
                debug32: parsedG.debug32,
                chunk: chunk,
                raw: raw,
                raw32: raw32
            });
        }
        listObj.struct = { note: `GSET parsed into ${list_count} elements, each ${elemByteSize} bytes` };
    }

    processNodeList(listObj, arrayBuffer, dataStart, dataEnd) {
        const raw = new Uint8Array(arrayBuffer.slice(dataStart, dataEnd));
        const parseResults = this.parseNodesInList(raw);
        const nodes = parseResults.elements;

        const intsDec = toInt32LE(raw);
        const intsHex = toHex32LE(raw);

        for (let i = 0; i < nodes.length; i++) {
            listObj.elements.push({
                index: i,
                offset: toHex32(dataStart + nodes[i].offset_dec),
                offset_dec: nodes[i].offset_dec,
                length: nodes[i].length,
                struct: nodes[i].struct,
                name: nodes[i].name,
                type: nodes[i].type,
                typeName: nodes[i].typeName,
                raw_int32Dec: intsDec,
                raw_int32Hex: intsHex,
                rawFullList: raw
            });
        }
        listObj.struct = { note: `Node list parsed into ${nodes.length} elements` };

        return parseResults.table;
    }

    parseNodesInList(raw) {
        const dv = new DataView(raw.buffer, raw.byteOffset, raw.byteLength);
        const elements = [];
        let pos = 0;
        let idx = 0;

        const container = document.createElement("div");
        container.style.marginTop = "20px";
        const table = document.createElement("table");
        table.style.borderCollapse = "collapse";
        table.style.width = "100%";
        table.style.fontSize = "13px";

        const header = document.createElement("tr");
        header.appendChild(th("Index"));
        header.appendChild(th("Offset"));
        header.appendChild(th("Length"));
        header.appendChild(th("Type"));
        header.appendChild(th("Type Name"));
        header.appendChild(th("Name"));
        header.appendChild(th("Raw Preview"));
        table.appendChild(header);

        let nodeNum = 0;
        while (pos < dv.byteLength && idx < 10000) {
            const result = this.parsePfbNode(dv, pos, nodeNum);
            nodeNum++;

            if (!result) {
                console.log(`Failed to parse node at offset ${pos}`);
                break;
            }

            const { node, nodeLen, nodeStruct } = result;

            elements.push({
                index: idx,
                offset_dec: pos,
                length: node.byteLength,
                raw: new Uint8Array(dv.buffer, dv.byteOffset + pos, node.byteLength),
                struct: nodeStruct,
                name: node.name,
                type: node.type,
                typeName: node.typeName
            });

            const row = document.createElement("tr");
            row.appendChild(td(idx));
            row.appendChild(td(pos.toString(16)));
            row.appendChild(td(nodeLen));
            row.appendChild(td(node.type));
            row.appendChild(td(node.typeName + "(" + this.nodesCounter[node.typeName] +  ")"));
            row.appendChild(td(node.name || "(unnamed)"));
            row.appendChild(td(JSON.stringify(nodeStruct,null,4)));
            table.appendChild(row);
            pos = pos + nodeLen;
            idx++;
        }

        container.appendChild(table);
        document.body.appendChild(container);

        return {
            elements: elements,
            table: table
        };
    }

    parsePfbNode(dataView, offset, nodeNum) {
        let nodeStruct = "not implemented";

        if (offset + 4 > dataView.byteLength) {
            return null;
        }

        const bufSize = dataView.getInt32(offset, true);
        if (bufSize <= 0 || bufSize > 2000000) {
            console.log("ERRORE, dimensioni nodo impossibili:", bufSize);
            return null;
        }

        const payloadStart = offset + 4;
        const payloadEnd = payloadStart + bufSize * 4 - 4;
        if (payloadEnd > dataView.byteLength) return null;

        let name = "n/a";
        const nameLenOffset = payloadEnd + 4;
        let nameStart = nameLenOffset + 4;
        let nodeLen = 4 + bufSize*4;
        const nameLen = dataView.getInt32(nameLenOffset, true);
        if (nameLen != -1) {
          nodeLen = nodeLen + 4 +  nameLen;
          nameStart = nameLenOffset + 4;
          try {
            name = new TextDecoder().decode( new Uint8Array(dataView.buffer, nameStart, nameLen) );
          } catch (e) {
              console.log("Niente nome...");
          }
        } else {
            nodeLen += 4;
        }

        const nodeType = dataView.getInt32(payloadStart, true);        
        const children = [];
        const nodeTypeName = NodeTypes[nodeType];        

        if (typeof this.nodesCounter[nodeTypeName] === 'undefined') {
            this.nodesCounter[nodeTypeName] = 0;
        } else {
            this.nodesCounter[nodeTypeName]++;
        }

        if (nodeTypeName.toLowerCase() === "lod") {
            let ranges = [];
            let trans = [];
            let coords = [];
            let lodState = -1;
            let lodStateIndex = -1;
            let children = [];
            let offset = payloadStart;

            this.LODcounterGlobal++;

            offset += 4;
            const count = dataView.getUint32(offset, true);

            if (!this.lodsPerRanges[count]) {
                this.lodsPerRanges[count] = { 
                    lodsCount: 0,
                    sum : 0
                };
            }
            this.lodsPerRanges[count].lodsCount++;
            this.lodsPerRanges[count].sum += count;

            offset += 4;

            for (let i = 0; i <= count; i++) {
                const val = dataView.getFloat32(offset, true);
                ranges.push(val);
                offset += 4;
            }

            for (let i = 0; i <= count; i++) {
                const val = dataView.getFloat32(offset, true);
                trans.push(val);
                offset += 4;
            }

            for (let i = 0; i < 3; i++) {
                const coord = dataView.getFloat32(offset, true);
                coords.push(coord);
                offset += 4;
            }

            lodState = dataView.getInt32(offset);
            offset += 4;
            lodStateIndex = dataView.getInt32(offset);
            offset += 4;

            const numChildren = dataView.getInt32(offset, true);
            offset += 4;

            if (numChildren !== -1) {
                for (let i = 0; i < numChildren; i++) {
                    const childIndex = dataView.getInt32(offset, true);
                    offset += 4;
                    children.push(childIndex);
                }
            }

            const LODstruct = {
                ranges,
                trans,
                coords,
                lodState,
                lodStateIndex,
                children: children,
                name: name,
                typeName: "LOD",
                nodeNum: nodeNum,
                LODnum: this.LODcounterGlobal
            };
            nodeStruct = LODstruct;
            this.LODSlist.push(LODstruct)
        } else if (nodeTypeName.toLowerCase() === "geode") {
            this.geodesCount++;
            offset += 8;
            nodeStruct = {
                geosets : []
            };
            const count = dataView.getUint32(offset, true);
            offset+=4;
            for (let i = 0; i < count; i++){
                nodeStruct.geosets.push(dataView.getUint32(offset, true));
                offset += 4;
            }
            this.geodesListGlobal.push(nodeStruct);
        } else if (nodeTypeName.toLowerCase() ===  "group") {
//            children = [];
            offset += 8;

            const numChildren = dataView.getInt32(offset, true);
            offset += 4;

            if (numChildren !== -1) {
                for (let i = 0; i < numChildren; i++) {
                    const childIndex = dataView.getInt32(offset, true);
                    offset += 4;
                    children.push(childIndex);
                }
            }

            nodeStruct = {
                children: children,
                name: name,
                typeName: "GROUP",
                nodeNum : nodeNum
            };
        } else {
console.log(nodeType, "Not implemented");

        }

if (nodeStruct && (nodeStruct !=="not implemented")) {

        nodeStruct.type = null;
        nodeStruct.typeName = nodeTypeName;
}
        return {
            node: {
                type: nodeType,
                typeName : nodeTypeName,
                name : name,
                data: {},
                children: children,
                byteLength: nodeLen,
                nodeNum : nodeNum
            },
            nodeLen,
            nodeStruct
        };
    }

    processRawList(listObj, arrayBuffer, dataStart, dataEnd) {
        const rawBytes = new Uint8Array(arrayBuffer.slice(dataStart, dataEnd));
        const rawBytes32 = new Uint32Array(arrayBuffer.slice(dataStart, dataEnd));
        
        listObj.elements.push({
            index: 0,
            offset: toHex32(dataStart),
            offset_dec: dataStart,
            length: rawBytes.length,
            dataHex_preview: bytesToHex(rawBytes.subarray(0, Math.min(rawBytes.length, 256)), 1024),
            textString: bytesToTextString(rawBytes),
            struct: { note: "Lista non decodificata (raw preserved)." },
            raw8: rawBytes,
            raw32: rawBytes32
        });
    }

    parseSListElements(arrayBuffer, view, start, end, list_id, little, listObj) {
        let p = start;
        const total = end;
        const unitSize = (() => {
            switch(L_NAMES[list_id].toLowerCase()) {
                case ("Length List").toLowerCase(): return UNIT_SIZES.L_LLIST;
                case ("Vertex List").toLowerCase(): return UNIT_SIZES.L_VLIST;
                case ("Color List").toLowerCase(): return UNIT_SIZES.L_CLIST;
                case ("Normal List").toLowerCase(): return UNIT_SIZES.L_NLIST;
                case ("TexCoord List").toLowerCase(): return UNIT_SIZES.L_TLIST;
                case ("Index List").toLowerCase(): return UNIT_SIZES.L_ILIST;
                default: return 1;
            }
        })();

        let index = 0;
        while (p + 12 <= total) {
            const elem_count = readInt32v(view, p, little);
            const memtype = readInt32v(view, p+4, little);
            const udata   = readInt32v(view, p+8, little);
            const headerPos = p;
            p += 12;
            let bytesLen = elem_count * unitSize;
            if (bytesLen < 0) bytesLen = 0;
            if (p + bytesLen > total) {
                const raw = new Uint8Array(arrayBuffer.slice(headerPos, total));
                listObj.elements.push({
                    index, offset: toHex32(headerPos), offset_dec: headerPos, length: raw.length,
                    dataHex_preview: bytesToHex(raw.subarray(0,256)),
                    textString: bytesToTextString(raw), struct: { error: "Troncamento S-LIST" }, raw
                });
                break;
            }

            const rawBytes = new Uint8Array(arrayBuffer.slice(p, p+bytesLen));
            let elemStruct = null;

            if (list_id === 4) {
                const dv = new DataView(arrayBuffer, p, bytesLen);
                const ints = [];
                for (let i=0;i<elem_count;i++) ints.push(readInt32v(dv, i*4, little));
                elemStruct = { ints };
            } else if (list_id === 5) {
                const verts = [];
                const dv = new DataView(arrayBuffer, p, bytesLen);
                for (let i=0;i<elem_count;i++){
                    const base = i*12;
                    const rawVertex0 = readFloat32v(dv, base, little);
                    const rawVertex1 = readFloat32v(dv, base+4, little);
                    const rawVertex2 = readFloat32v(dv, base+8, little);
                    const xval = rawVertex0;
                    const yval = -rawVertex2;
                    const zval = rawVertex1;
                    verts.push({ x: xval, y: yval, z: zval});
                }
                elemStruct = { vertices: verts };
            } else if (list_id === 6) {
                const cols = []; const dv = new DataView(arrayBuffer, p, bytesLen);
                for (let i=0;i<elem_count;i++){
                    const base = i*16;
                    cols.push({ r: readFloat32v(dv, base, little), g: readFloat32v(dv, base+4, little), b: readFloat32v(dv, base+8, little), a: readFloat32v(dv, base+12, little) });
                }
                elemStruct = { colors: cols };
            } else if (list_id === 7) {
                const normals = []; const dv = new DataView(arrayBuffer, p, bytesLen);
                for (let i=0;i<elem_count;i++){ const base=i*12; normals.push({ nx: readFloat32v(dv, base, little), ny: readFloat32v(dv, base+4, little), nz: readFloat32v(dv, base+8, little)}); }
                elemStruct = { normals };
            } else if (list_id === 8) {
                const tcs = []; const dv = new DataView(arrayBuffer, p, bytesLen);
                for (let i=0;i<elem_count;i++){ const base=i*8; tcs.push({ u: readFloat32v(dv, base, little), v: readFloat32v(dv, base+4, little)}); }
                elemStruct = { texcoords: tcs };
            } else if (list_id === 9) {
                const idx = []; const dv = new DataView(arrayBuffer, p, bytesLen);
                for (let i=0;i<elem_count;i++) idx.push(dv.getUint16(i*2, little));
                elemStruct = { indices: idx };
            }

            listObj.elements.push({
                index, offset: toHex32(headerPos), offset_dec: headerPos, header: { elem_count, memtype, udata },
                length: 12 + bytesLen,
                dataHex_preview: bytesToHex(rawBytes.subarray(0, Math.min(rawBytes.length,256))), textString: bytesToTextString(rawBytes),
                struct: elemStruct, raw: rawBytes
            });
            p += bytesLen;
            index++;
        }
        listObj.struct = { note: "SList decoded into per-element structs (unit-based) if applicable." };
    }

    parseListFixedElements(arrayBuffer, view, start, end, list_id, count, little, listObj) {
        let p = start; let idx = 0;
        while (p < end && idx < Math.max(1,count)) {
            if (list_id === 0) {
                const needed = 72;
                if (p + needed > end) { const raw = new Uint8Array(arrayBuffer.slice(p, end)); listObj.elements.push({ index: idx, offset: toHex32(p), offset_dec: p, length: raw.length, dataHex_preview: bytesToHex(raw.subarray(0,256)), textString: bytesToTextString(raw), struct: { error: "MTL truncated" } }); break; }
                const dv = new DataView(arrayBuffer, p, needed);
                const side = readInt32v(dv,0,true);
                const alpha = readFloat32v(dv,4,true);
                const shininess = readFloat32v(dv,8,true);
                const ambient = { x: readFloat32v(dv,12,true), y: readFloat32v(dv,16,true), z: readFloat32v(dv,20,true) };
                const diffuse = { x: readFloat32v(dv,24,true), y: readFloat32v(dv,28,true), z: readFloat32v(dv,32,true) };
                const specular = { x: readFloat32v(dv,36,true), y: readFloat32v(dv,40,true), z: readFloat32v(dv,44,true) };
                const emission = { x: readFloat32v(dv,48,true), y: readFloat32v(dv,52,true), z: readFloat32v(dv,56,true) };
                const cmode0 = readInt32v(dv,60,true), cmode1 = readInt32v(dv,64,true), udata = readInt32v(dv,68,true);
                const s = { side, alpha, shininess, ambient, diffuse, specular, emission, cmode:[cmode0,cmode1], udata };
                listObj.elements.push({ index: idx, offset: toHex32(p), offset_dec: p, length: needed, dataHex_preview: bytesToHex(new Uint8Array(arrayBuffer.slice(p,p+Math.min(needed,256)))), textString: bytesToTextString(new Uint8Array(arrayBuffer.slice(p,p+Math.min(needed,256)))), struct: s });
                p += needed; idx++;
            } else if (list_id === 2) {
                const needed = 28;
                if (p + needed > end) { const raw = new Uint8Array(arrayBuffer.slice(p, end)); listObj.elements.push({ index: idx, offset: toHex32(p), offset_dec: p, length: raw.length, dataHex_preview: bytesToHex(raw.subarray(0,256)), textString: bytesToTextString(raw), struct: { error: "TENV truncated" } }); break; }
                const dv = new DataView(arrayBuffer, p, needed);
                const mode = readInt32v(dv,0,true), component = readInt32v(dv,4,true);
                const color = [readFloat32v(dv,8,true), readFloat32v(dv,12,true), readFloat32v(dv,16,true), readFloat32v(dv,20,true)];
                const udata = readInt32v(dv,24,true);
                const s = { mode, component, color, udata };
                listObj.elements.push({ index: idx, offset: toHex32(p), offset_dec: p, length: needed, dataHex_preview: bytesToHex(new Uint8Array(arrayBuffer.slice(p,p+Math.min(needed,256)))), textString: bytesToTextString(new Uint8Array(arrayBuffer.slice(p,p+Math.min(needed,256)))), struct: s });
                p+=needed; idx++;
            } else {
                const raw = new Uint8Array(arrayBuffer.slice(p, end));
                listObj.elements.push({ index: idx, offset: toHex32(p), offset_dec: p, length: raw.length, dataHex_preview: bytesToHex(raw.subarray(0,256)), textString: bytesToTextString(raw), struct: { note: "Lista fissa non decodificata (opzione B)." } });
                break;
            }
        }
        listObj.struct = { note: "LIST strutturata (parsing applicato per MTL/TEX/TENV)" };
    }

    parseGSetElement(chunkBytes, little) {
        const view = new DataView(chunkBytes.buffer, chunkBytes.byteOffset, chunkBytes.byteLength);
        let offset = 0;
        const version = 26;
        const result = {};

        const debug8 = Array.from(chunkBytes);
        const debug32 = [];
        for (let i = 0; i + 3 < chunkBytes.length; i += 4) {
            debug32.push(view.getInt32(i, true));
        }

        function readInt32() {
            const value = view.getInt32(offset, true);
            offset += 4;
            return value;
        }
        function readUint32() {
            const value = view.getUint32(offset, true);
            offset += 4;
            return value;
        }
        function readFloat32() {
            const value = view.getFloat32(offset, true);
            offset += 4;
            return value;
        }
        function readFloat64() {
            const value = view.getFloat64(offset, true);
            offset += 8;
            return value;
        }
        function readInt32Array(count) {
            const arr = [];
            for (let i = 0; i < count; i++) {
                arr.push(readInt32());
            }
            return arr;
        }
        function readFloat32Array(count) {
            const arr = [];
            for (let i = 0; i < count; i++) {
                arr.push(readFloat32());
            }
            return arr;
        }
        function readFloat64Array(count) {
            const arr = [];
            for (let i = 0; i < count; i++) {
                arr.push(readFloat64());
            }
            return arr;
        }

        if (version >= 26) {
            result.ptype = readInt32();
            result.pcount = readInt32();
            result.llist = readInt32();
            result.vlist = readInt32Array(3);
            result.clist = readInt32Array(3);
            result.nlist = readInt32Array(3);
            result.tlist = readInt32Array(3);
            result.draw_mode = readInt32Array(3);
            result.gstate = readInt32Array(2);
            result.line_width = readFloat32();
            result.point_size = readFloat32();
            result.draw_bin = readInt32();
            result.isect_mask = readUint32();
            result.hlight = readInt32();
            result.bbox_mode = readInt32();
            result.bbox = {
                min: readFloat32Array(3),
                max: readFloat32Array(3)
            };
            result.udata = readInt32();
            result.draw_order = readInt32();
            result.decal_plane = readInt32();
            result.decal_plane_normal = readFloat32Array(3);
            result.decal_plane_offset = readFloat32();
            result.bbox_flux = readInt32();
        }

        return {
            elements: result,
            debug8: debug8,
            debug32: debug32};
    }
}