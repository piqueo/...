// 负责实体模型的绘制

从“导入{EntityItemModel}。/EntityItemModel.js";
从“./glsl.js”导入*作为glsl；
从..导入{块}/World/Block.js"；

类实体Painter {
    构造函数（世界，渲染器）{
        this.models = new Set();
        this.setRenderer（renderer）；
        this.setWorld（世界）；
    };
    onAddEntity = (entity) => {
        如果（！entity.isItem）返回；
        this.models.add(new EntityItemModel(entity, this.renderer));
    };
    setWorld(world = null) {
        如果（this.world === world）返回；
        if (this.world) {
            对于（让这个模型.models）
                model.dispose();
            this.world.removeEventListener（“onAddEntity”，this.onAddEntity）；
        }
        this.world = 世界；
        this.models.clear();
        如果（！世界）回归；
        for (let entity of world.entities) {
            如果（！entity.isItem）继续；
            this.models.add(new EntityItemModel(entity, this.renderer));
        }
        world.addEventListener("onAddEntity", this.onAddEntity);
    };
    setRenderer(renderer = null) {
        如果（this.renderer ===渲染器）返回；
        if (this.renderer) {
            对于（让这个模型.models）
                model.setRenderer();
        }
        this.renderer = renderer;
        如果（！渲染器）返回；
        if (renderer.isWebGL2) {
            renderer.createProgram("entityItem", glsl.entityItem_webgl2.vert, glsl.entityItem_webgl2.frag)
                .use().bindTex("blockTex", renderer.createTextureArray(Block.defaultBlockTextureImg));
        }
        其他{}
        对于（让这个模型.models）
            model.setRenderer（enderer）；
    };
    更新（timestamp，dt）{
        对于（let model of this.models）{
            model.update（timestamp，dt）；
        }
    };
    draw() {
        对于（let model of this.models）{
            model.draw();
        }
    };
    dispose() {
        this.setWorld();
    };
};

出口{
    默认情况下，实体Painter，
    实体Painter，
};
