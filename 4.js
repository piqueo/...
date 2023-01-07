
从..导入{块}/World/Block.js"；
从“导入{genColArr，calCol}。/WorldChunkModule.js";
从“../utils/math/index.js”导入{ mat4, degree2radian作为d2r }；

// Block => textureUV, block render type => { ver, ele, defaultTexUV, defaultColor }
const blockMeshs = 新地图();
Block.preloaded.then(() => {
    const blocks = Block.listBlocks();
    对于（让块块）{
        const brt = block.renderType, texUV = [];
        const needGenBRTMesh = !blockMeshs.has（brt）？正确：null；
        const brtMesh = needGenBRTMesh && {
            ver: [], ele: [], defaultTex: [], defaultCol: [],
        };
        const defBlockTexUV = needGenBRTMesh && Block.getTexUVByTexCoord({ renderType: brt, });
        开关（brt）{
        案例 Block.renderType.CACTUS：
        案例 Block.renderType.NORMAL：{
            let totalVer = 0;
            // 这里假设所有相同的渲染类型的方块拥有相同的face顺序
            for (let face in block.vertices) {
                const vs = block.vertices[脸];
                brtMesh?.ver.push(...vs);
                brtMesh?.ele.push(...block.elements[face].map(e => e + totalVer));
                brtMesh?.defaultTex.push(...defBlockTexUV.uv[face]);
                texUV.push(...block.texture.uv[脸]);
                totalVer += vs.length / 3;
            }
            打破；}
        }
        brtMesh?.defaultCol.push(...genColArr(brtMesh.ver.length / 3, 15));
        blockMeshs.set（block，texUV）；
        if (needGenBRTMesh) blockMeshs.set(brt, brtMesh);
    }
}）；

// Render => createVBO/IBO(blockMeshs)
const boCache = new WeakMap();

// TODO：用AVO和instanced drawing来加速大量物体渲染
//实例绘图：https://webgl2fundamentals.org/webgl/lessons/webgl-instanced-drawing.htmls
类EntityItemModel {
    constructor(entityItem, renderer) {
        this.entity = entityItem;
        entityItem.model = this;
        this.setRenderer（renderer）；
        this.lastLight = -1;
        this.col = [];
        this.randomStart = Math.random() * 360 * 36 * 540;
        this.mM = mat4.identity();
    };
    setRenderer(renderer = null) {
        如果（this.renderer ===渲染器）返回；
        this.renderer = renderer;
        this.bufferObj = {};
        如果（！渲染器）返回；
        如果（！boCache.has(renderer)) {
            let bo = new Map();
            for (let [key, val] of blockMeshs) {
                if (key instanceof Block) {
                    bo.set（key，render.createVbo（val））；
                }
                其他{
                    bo.set（key，{
                        ver：render.createVbo（val.ver），
                        ele：渲染器.createIbo（val.ele），
                        defaultTex：渲染器.createVbo（val.defaultTex），
                        defaultCol：渲染器.createVbo（val.defaultCol），
                    }）；
                }
            }
            boCache.set（渲染器，bo）；
        }
        const blockMeshsBo = boCache.get(renderer);
        const block = Block.getBlockByBlockLongID(this.entity.longID);
        const brtMeshBo = blockMeshsBo.get(block.renderType);
        this.bufferObj = {
            ver：brtMeshBo.ver，
            ele：brtMeshBo.ele，
            tex：blockMeshsBo.get（block）|| brtMeshBo.defaultTex，
            col: renderer.createVbo([], renderer.ctx.DYNAMIC_DRAW),
        };
    };
    更新（timestamp，dt）{
        const l = this.entity.world.getLight(...this.entity.position);
        如果（this.lastLight！= l) {
            this.lastLight = l;
            const verNum = this.bufferObj.ver.length / 3;
            this.col = genColArr(verNum, l, l => Math.min(1, calCol(l) + 0.06));
            this.renderer.bindBoData(this.bufferObj.col, this.col, { drawType: this.renderer.ctx.DYNAMIC_DRAW });
        }
        this.randomStart += dt;
    };
    draw() {
        如果（！this.renderer）返回；
        const {renderer, bufferObj, mM, entity} = this, {ctx} = renderer;
        const prg = renderer.getProgram("entityItem");
        mat4（mM）。E().translate(entity.position)
        .rotate(d2r(this.randomStart / 36), [0, 1, 0])
        .scale（[.25、.25、.25]）
        .translate([-.5, Math.sin(this.randomStart / 540) * 0.5 + 1.125, -.5]);
        prg.use（）
            .setUni（“mMatrix”，mM）
            .setUni（“vMatrix”，render.mainCamera.view）
            .setUni("pMatrix", renderer.mainCamera.projection)
            .setUni（“fogColor”，[0.62、0.81、1.0、1.0]）
            // 3 ~ 4块
            .setUni("fogNear", 48)
            .setUni("fogFar", 64)
            .setAtt（“位置”，缓冲区Obj.ver）
            .setAtt("color", bufferObj.col)
            .setAtt（“textureCoord”，bufferObj.tex）；
        ctx.bindBuffer（bufferObj.ele.type，bufferObj.ele）；
        ctx.drawElements(ctx.TRIANGLES, bufferObj.ele.length, ctx.UNSIGNED_SHORT, 0);
    };
    dispose() {
        this.setRenderer();
    };
};

出口{
    默认情况下，EntityItemModel，
    EntityItemModel，
};
