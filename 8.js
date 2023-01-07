
从“../utils/math/index.js”导入{ mat4, degree2radian作为d2r }；
从“导入渲染”。/Render.js"；
从“导入相机”。/Camera.js"；
从“./glsl.js”导入*作为glsl；
从“../utils/loadResources.js”导入{waitResource }；

让texImgs = null;
waitResource("welcomePage/textures").then(imgs => texImgs = imgs);

类 WelcomeRenderer 扩展 Render {
    构造函数（画布）{
        超级（帆布）；
        this.fitScreen();
        new ResizeObserver(async e => {
            等待新的Promise(s => setTimeout(s, 0));
            this.fitScreen();
        }）。观察（画布）；
        let vertexPosition = [
                -1，1，-1，-1，-1，-1，-1，1，-1，-1，1，1，1，
                -1，1，1，-1，1，1，-1，1，1，1，1，
                 1, 1, 1, 1, 1,-1, 1, 1,-1,-1, 1, 1,-1,
                 1, 1,-1, 1,-1,-1, -1,-1,-1, -1, 1,-1,
                 1, 1,-1, -1, 1,-1, -1, 1, 1, 1, 1, 1,
                -1,-1,-1, 1,-1,-1, 1,-1, 1, -1,-1, 1,
            ]，
            element = (len => {
                让 base = [0,1,2, 0,2,3], out = [];
                （让i = 0，j = 0；i <= len；j = i++ * 4）
                    out.push(...base.map(x => x + j));
                返回；
            }）（vertexPosition.length / 12）；
        this.bos = {
            ver: this.createVbo(vertexPosition),
            ele：这个.createIbo（元素），
        };
        this.prg = this.createProgram("welcomePage", glsl.welcomePage.vert, glsl.welcomePage.frag)
                    .use().bindTex("uTexture", this.createCubemapsTexture(texImgs, "welcomePage/textures"))
                    .setAtt("aPosition", this.bos.ver);
        const {ctx} = this;
        ctx.texParameteri(ctx.TEXTURE_CUBE_MAP, ctx.TEXTURE_MAG_FILTER, ctx.LINEAR);
        ctx.texParameteri(ctx.TEXTURE_CUBE_MAP, ctx.TEXTURE_MIN_FILTER, ctx.LINEAR);
        let mainCamera = this.mainCamera = new Camera(this.aspectRatio, {
            viewType：Camera.viewType.lookAt，
            fovy：120，位置：[0，0，0]，
            lookAt：[-1，0，0]，向上：[0，1，0]，
            远：10，
        }）；
        this.addCamera（mainCamera）；
        this.mM = mat4.identity();
        this.mvpM = mat4.identity();
    };
    get vpM() { return this.mainCamera.projview; };
    onRender() {
        const {ctx, prg, mM, vpM, mvpM, bos} = this;
        mat4.rotate（mM，d2r（1 / 70），[0，1，0]，mM）；
        mat4.multiply（vpM，mM，mvpM）；
        prg.use().setUni("uMvpMatrix", mvpM);
        ctx.clear（ctx.COLOR_BUFFER_BIT）；
        ctx.bindBuffer（bos.ele.type，bos.ele）；
        ctx.drawElements(ctx.TRIANGLES, bos.ele.length, ctx.UNSIGNED_SHORT, 0);
        ctx.flush();
    };
};

出口{
    WelcomeRenderer为默认值，
    欢迎渲染器，
};
