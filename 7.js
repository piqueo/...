从“导入程序”。/Program.js"；
从“../utils/isWebGL2Context.js”导入{isWebGL2Context }；

类渲染{
    构造函数（画布）{
        让ctx = this.gl = this.ctx =
            canvas.getContext("webgl2") ||
            canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
        如果（！ctx）抛出“无法获取WebGL上下文”；
        this.isWebGL2 =窗口中的“isSupportWebGL2”？window.isSupportWebGL2：isWebGL2Context（ctx）；
        this.prgCache = {};
        this.texCache = {};
        this.bufferCache = new Set();
        this.camera = [];
        this.frame = this.frame.bind(this);
        this.timer = null;
        this.lastFrameTime = window.performance.now();
        this.dpr = window.devicePixelRatio;
    };
    get aspectRatio() {
        返回 this.ctx.canvas.width / this.ctx.canvas.height;
    };
    addCamera(camera) {
        this.camera.push（相机）；
        归还这个；
    };
    createProgram(name, vectSrc, fragSrc) {
        return this.prgCache[name] = new Program(this.ctx, vectSrc, fragSrc);
    };
    getProgram(name) { return this.prgCache[name]; };
    delProgram（名称）{
        this.prgCache[name]?.dispose();
        删除此.prgCache[名称]；
    };

    frame(timestamp = this.lastFrameTime) {
        this.timer = window.requestAnimationFrame(this.frame);
        if (this.onRender) this.onRender(timestamp, timestamp - this.lastFrameTime);
        this.lastFrameTime = 时间戳;
    };
    play() {
        如果（this.timer！== null）返回；
        this.lastFrameTime = window.performance.now();
        this.frame();
    };
    stop() {
        如果（this.timer === null）返回；
        window.cancelAnimationFrame（this.timer）；
        this.timer = null;
    };

    setSize(w, h, dpr = this.dpr) {
        const c = this.ctx.canvas；
        this.dpr = dpr;
        w = (w * dpr) | 0; h = (h * dpr) | 0;
        c.width = w; c.height = h;
        this.ctx.viewport(0, 0, w, h);
        this.camera.forEach(camera => camera.setAspectRatio(w / h));
        返回{w，h}；
    };

    fitScreen(wp = 1, hp = 1) {
        返回此.setSize（
            window.innerWidth * wp，
            window.innerHeight *马力
        ）；
    };

    createIbo(data, drawType = this.ctx.STATIC_DRAW) {
        返回this.createBo（data，this.ctx.ELEMENT_ARRAY_BUFFER，drawType）；
    };
    createVbo(data, drawType = this.ctx.STATIC_DRAW) {
        返回this.createBo（data，this.ctx.ARRAY_BUFFER，drawType）；
    };
    createBo(data, boType, drawType = this.ctx.STATIC_DRAW) {
        返回this.bindBoData(this.ctx.createBuffer(), data, {boType, drawType});
    };
    bindBoData(bufferObj, data, {
boType = bufferObj.type，
drawType = this.ctx.STATIC_DRAW，
    } = {}) {
        const ctx = this.ctx;
        如果（！（data.buffer instanceof ArrayBuffer)) {
            如果（boType === ctx.ELEMENT_ARRAY_BUFFER）
                数据=新的Int16Array（数据）；
            else if (boType === ctx.ARRAY_BUFFER)
                数据=新的Float32Array（数据）；
        }
        bufferObj.length = data.length;
        bufferObj.type = boType;
        ctx.bindBuffer（boType，bufferObj）；
        ctx.bufferData（boType，数据，drawType）；
        ctx.bindBuffer（boType，null）；
        如果（！this.bufferCache.has(bufferObj))
            this.bufferCache.add（bufferObj）；
        返回缓冲区Obj；
    };
    delBo(bufferObj) {
        如果（！this.bufferCache.has(bufferObj))返回false；
        this.ctx.deleteBuffer（bufferObj）；
        返回this.bufferCache.delete（bufferObj）；
    };

    _getImageName(img) {
        let uri = img.outerHTML.match(/src="([^"]*)"/);
        返回uri？uri[1]：String(Math.random());
    };
    createTexture(img, name = this._getImageName(img), doYFlip = false) {
        const {ctx} = 这个，
              tex = ctx.createTexture();
        if (doYFlip) ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, true);
        ctx.bindTexture（ctx.TEXTURE_2D，tex）；
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MAG_FILTER, ctx.NEAREST);
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.NEAREST);
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);
        ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);
        ctx.texImage2D(ctx.TEXTURE_2D, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE,
            img.mipmap && img.mipmap[0]?img.mipmap[0]：img）；
        if (img.mipmap) {
            ctx.generateMipmap（ctx.TEXTURE_2D）；
            ctx.texParameteri(ctx.TEXTURE_2D, ctx.TEXTURE_MIN_FILTER, ctx.NEAREST_MIPMAP_LINEAR);
            （let i = 1; i < img.mipmap.length; ++i）
                ctx.texImage2D(ctx.TEXTURE_2D, i, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, img.mipmap[i]);
        }
        ctx.bindTexture（ctx.TEXTURE_2D，null）；
        if (doYFlip) ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, false);
        this.texCache[name] = tex;
        tex.name = name;
        tex.type = ctx.TEXTURE_2D;
        返回tex；
    };
    createTextureArray(img, {
singleW = img.texture4array && img.texture4array.singleW，
singleH = img.texture4array && img.texture4array.singleH，
altesCount = img.texture4array && img.texture4array.altesCount，
name = this._getImageName(img),
doYFlip = false，
useMips = true，
    } = {}) {
        如果（！window.isSupportWebGL2 || !this.isWebGL2）抛出“不支持webgl2”；
        如果（img.texture4array）img = img.texture4array；
        const {ctx} = 这个，
              tex = ctx.createTexture();
        if (doYFlip) ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, true);
        ctx.bindTexture（ctx.TEXTURE_2D_ARRAY，tex）；
        ctx.texParameteri(ctx.TEXTURE_2D_ARRAY, ctx.TEXTURE_MAG_FILTER, ctx.NEAREST);
        ctx.texParameteri(ctx.TEXTURE_2D_ARRAY, ctx.TEXTURE_MIN_FILTER, ctx.NEAREST);
        ctx.texParameteri(ctx.TEXTURE_2D_ARRAY, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);
        ctx.texParameteri(ctx.TEXTURE_2D_ARRAY, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);
        如果（单W >= ctx.getParameter(ctx.MAX_TEXTURE_SIZE)）抛出“宽度超出范围”；
        如果（单H >= ctx.getParameter(ctx.MAX_TEXTURE_SIZE)）抛出“超出范围”；
        如果（altesCount >= ctx.getParameter(ctx.MAX_ARRAY_TEXTURE_LAYERS)）抛出“深度超出范围”；
        if (Array.isArray(img)) {
            ctx.texImage3D(ctx.TEXTURE_2D_ARRAY, 0, ctx.RGBA, singleW, singleH, altesCount, 0, ctx.RGBA, ctx.UNSIGNED_BYTE, null);
            对于（let i = 0; i < img.length; ++i）
                ctx.texSubImage3D(ctx.TEXTURE_2D_ARRAY, 0, 0, 0, i, singleW, singleH, 1, ctx.RGBA, ctx.UNSIGNED_BYTE, img[i]);
        }
        其他
            ctx.texImage3D(ctx.TEXTURE_2D_ARRAY, 0, ctx.RGBA, singleW, singleH, altesCount, 0, ctx.RGBA, ctx.UNSIGNED_BYTE, img);
        如果（useMips）{
            ctx.generateMipmap（ctx.TEXTURE_2D_ARRAY）；
            ctx.texParameteri(ctx.TEXTURE_2D_ARRAY, ctx.TEXTURE_MIN_FILTER, ctx.NEAREST_MIPMAP_LINEAR);
        }
        ctx.bindTexture（ctx.TEXTURE_2D_ARRAY，null）；
        if (doYFlip) ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, false);
        this.texCache[name] = tex;
        tex.name = name;
        tex.type = ctx.TEXTURE_2D_ARRAY;
        返回tex；
    };
    createCubemapsTexture(imgs, name = Math.random(), doYFlip = false) {
        const {ctx} = this, tex = ctx.createTexture();
        if (doYFlip) ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, true);
        ctx.bindTexture（ctx.TEXTURE_CUBE_MAP，tex）；
        ctx.texParameteri(ctx.TEXTURE_CUBE_MAP, ctx.TEXTURE_MAG_FILTER, ctx.NEAREST);
        ctx.texParameteri(ctx.TEXTURE_CUBE_MAP, ctx.TEXTURE_MIN_FILTER, ctx.NEAREST);
        ctx.texParameteri(ctx.TEXTURE_CUBE_MAP, ctx.TEXTURE_WRAP_S, ctx.CLAMP_TO_EDGE);
        ctx.texParameteri(ctx.TEXTURE_CUBE_MAP, ctx.TEXTURE_WRAP_T, ctx.CLAMP_TO_EDGE);
        for (let i = 0; i < 6; ++i) {
            ctx.texImage2D(ctx.TEXTURE_CUBE_MAP_POSITIVE_X + i, 0, ctx.RGBA, ctx.RGBA, ctx.UNSIGNED_BYTE, imgs[i]);
        }
        ctx.generateMipmap（ctx.TEXTURE_CUBE_MAP）；
        ctx.bindTexture（ctx.TEXTURE_CUBE_MAP，null）；
        if (doYFlip) ctx.pixelStorei(ctx.UNPACK_FLIP_Y_WEBGL, true);
        this.texCache[name] = tex;
        tex.name = name;
        tex.type = ctx.TEXTURE_CUBE_MAP;
        返回tex；
    };
    getTexture(name) { return this.texCache[name]; };
    getOrCreateTexture(img, name = img instanceof Image && this._getImageName(img), doYFlip = false) {
        let cache = this.getTexture(name);
        如果（缓存）返回缓存；
        如果（Array.isArray（img））返回this.createCubemapsTexture（img，name，doYFlip）；
        如果（img.texture4array）
            try { return this.createTextureArray(img, { name, doYFlip }); }
            catch (e) {
                console.warn（e）；
                window.isSupportWebGL2 = this.isWebGL2 = false;
            }
        返回this.createTexture（img，name，doYFlip）；
    };

    dispose() {
        this.stop();
        const {ctx} = this;
        this.bufferCache.forEach(bo => ctx.deleteBuffer(bo));
        this.bufferCache.clear();
        Object.values(this.texCache).forEach(tex => ctx.deleteTexture(tex));
        this.texCache = {};
        Object.values(this.prgCache).forEach(prg => prg.dispose());
    };
};

出口{
    渲染，
    呈现为默认值
};
