从..导入{块}/World/Block.js"；
从“../utils/math/index.js”导入{mat4}；
从“./glsl.js”导入*作为glsl；
从“导入{calCol}。/WorldChunkModule.js";

类 HighlightSelectedBlock {
    constructor(world, renderer = world.renderer) {
        this.world = 世界；
        this.mvp = mat4.identity();
        this.setRenderer（renderer）；
    };
#calcMesh() {
        const {renderer} = this, {ctx} = this.renderer;
        this.meshs = 新地图();
        for (let renderType of Object.values(Block.renderType)) {
            let isFluid = renderType === Block.renderType.FLUID;
            如果（isFluid）renderType = Block.renderType.NORMAL；
            让blockEles = Block.getElementsByRenderType(renderType);
            let lineVer = [], vers = Block.getVerticesByRenderType(renderType), surfaceMesh = {};
            for (let f in vers) {
                如果（渲染类型！== Block.renderType.CACTUS || (f != "y+" && f != "y-"))
                    lineVer.push(...vers[f]);
                surfaceMesh[f] = {
                    ver：render.createVbo（vers[f]），
                    ele：渲染器.createIbo（blockEles[f]），
                    col: renderer.createVbo([], ctx.DYNAMIC_DRAW),
                };
            }
            let lineEle = (len => {
                如果（！len）返回 [];
                let base = [0,1, 1,2, 2,3, 3,0], out = [];
                for(let i = 0, j = 0; i < len; j = ++i*4)
                    out.push(...base.map(x => x + j));
                返回；
            })(lineVer.length / 12);
            let defaultCol = [...Array(lineVer.length / 3 * 4)].map((_, i) => i % 4 === 3?0.5：1.0）；
            如果（isFluid）renderType = Block.renderType.FLUID；
            this.meshs.set(renderType, {
                行：{
                    ver：render.createVbo（lineVer），
                    ele：渲染器.createIbo（lineEle），
                    defaultCol：renderer.createVbo（defaultCol），
                    col: renderer.createVbo([], ctx.DYNAMIC_DRAW),
                }，
                表面：表面网眼，
            }）；
        }
    };
    setRenderer(renderer = null) {
        如果（！渲染器）返回；
        // 释放缓冲区
        if (this.renderer) this.dispose();
        this.renderer = renderer;
        renderer.createProgram("selector", glsl.selector.vert, glsl.selector.frag);
        this.#calcMesh();
    };
    draw() {
        const {world} = this, {mainPlayer} = world;
        如果（mainPlayer.camera === null）返回；
        const hit = mainPlayer.controller.getHitting?.() ??无效；
        如果（hit === null）返回；

        const {renderer} = this, {ctx} = renderer;
        let [bx, by, bz] = hit.blockPos,
            block = world.getBlock(bx, by, bz),
            selector = renderer.getProgram("selector").use(),
            linecol = [], surfaceCol = [];
        mat4（this.mvp）。E().translate(hit.blockPos).postMul(mainPlayer.camera.projview);
        selector.setUni（“mvp”，this.mvp）；
        let mesh = this.meshs.get(block.renderType), lineMesh = mesh.line, surfaceMeshs = mesh.surface;
        switch (block.renderType) {
        案例 Block.renderType.FLUID：
        案例 Block.renderType.CACTUS：
        案例 Block.renderType.NORMAL：{
            如果（！hit.axis）中断；
            let [dx, dy, dz] = ({"x+":[1,0,0], "x-":[-1,0,0], "y+":[0,1,0], "y-":[0,-1,0], "z+":[0,0,1], "z-":[0,0,-1]})[hit.axis];
            let l = world.getLight(bx + dx, by + dy, bz + dz), col = Math.min(1, calCol(l) + 0.1);
            linecol = [...数组（lineMesh.ver.length / 3 * 4）]
                .map((_, i) => i % 4 === 3?0.4：col）；
            surfaceCol = [...Array(surfaceMeshs[hit.axis].ver.length / 3 * 4)]
                .map((_, i) => i % 4 === 3?0.1：col）；
            打破；}
        案例 Block.renderType.FLOWER：{
            let l = world.getLight(bx, by, bz), col = Math.min(1, calCol(l) + 0.1);
            linecol = [...数组（lineMesh.ver.length / 3 * 4）]
                .map((_, i) => i % 4 === 3?0.4：col）；
            surfaceCol = [...阵列（surfaceMeshs.face.ver.length / 3 * 4）]
                .map((_, i) => i % 4 === 3?0.1：col）；
            打破；}
        }
        设 lineColBO = lineMesh.defaultCol;
        if (linecol.length) {
            lineColBO = lineMesh.col;
            renderer.bindBoData(lineColBO, linecol, {drawType: ctx.DYNAMIC_DRAW});
        }
        // 画线
        ctx.enable（ctx.BLEND）；
        ctx.blendFunc（ctx.SRC_ALPHA，ctx.ONE_MINUS_SRC_ALPHA）；
        ctx.bindBuffer（lineMesh.ele.type，lineMesh.ele）；
        selector.setAtt("pos", lineMesh.ver).setAtt("col", lineColBO);
        ctx.drawElements(ctx.LINES, lineMesh.ele.length, ctx.UNSIGNED_SHORT, 0);
        ctx.disable（ctx.BLEND）；
        
        如果（！hit.axis）返回；
        let surfaceMesh = block.renderType === Block.renderType.FLOWER
？表面Meshs.face
：surfaceMeshs[hit.axis]，
            surfaceColBO = surfaceMesh.col;
        renderer.bindBoData(surfaceColBO, surfaceCol, {drawType: ctx.DYNAMIC_DRAW});
        // 绘制表面
        ctx.disable（ctx.CULL_FACE）；
        ctx.enable（ctx.BLEND）；
        ctx.blendFunc（ctx.SRC_ALPHA，ctx.ONE_MINUS_SRC_ALPHA）；
        ctx.enable（ctx.POLYGON_OFFSET_FILL）；
        ctx.polygonOffset（-1.0，-1.0）；
        ctx.depthMask（false）；
        ctx.bindBuffer（surfaceMesh.ele.type，surfaceMesh.ele）；
        selector.setAtt("pos", surfaceMesh.ver).setAtt("col", surfaceColBO);
        ctx.drawElements(ctx.TRIANGLES, surfaceMesh.ele.length, ctx.UNSIGNED_SHORT, 0);
        ctx.depthMask（真实）；
        ctx.disable（ctx.POLYGON_OFFSET_FILL）；
        ctx.disable（ctx.BLEND）；
        ctx.enable（ctx.CULL_FACE）；
    };
    dispose() {
        const {ctx} = this.renderer;
        for (let [, mesh] of this.meshs) {
            for (let k of ["ver", "ele", "col"]) {
                ctx.deleteBuffer（mesh.line[k]）；
                Object.values(mesh.surface).forEach(surfaceMesh => ctx.deleteBuffer(surfaceMesh[k]));
            }
            ctx.deleteBuffer（mesh.line.defaultCol）；
        }
    };
};

出口{
    HighlightSelectedBlock为默认值，
    HighlightSelectedBlock，
};
