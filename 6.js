
function createShader(ctx, type, src) {
    const s = ctx.createShader(type);
    ctx.shaderSource（s，src）；
    ctx.compileShader（s）；
    如果（！ctx.getShaderParameter(s, ctx.COMPILE_STATUS))
        抛出“错误编译”+（类型=== ctx.VERTEX_SHADER？"vertex": "fragment") + " shader: "
            + ctx.getShaderInfoLog（s）；
    返回s；
}

function createProgram(ctx, vertShader, fragShader) {
    const p = ctx.createProgram();
    ctx.attachShader（p，vertShader）；
    ctx.attachShader（p，fragShader）；
    ctx.linkProgram（p）；
    如果（！ctx.getProgramParameter(p, ctx.LINK_STATUS))
        抛出“错误链接程序：”+ ctx.getProgramInfoLog(p);
    返回p；
}

课程计划{
    constructor(ctx, vertSrc, fragSrc) {
        this.ctx = this.gl = ctx;
        let vs = createShader(ctx, ctx.VERTEX_SHADER, vertSrc),
            fs = createShader(ctx, ctx.FRAGMENT_SHADER, fragSrc);
        this.shaders = { vs, fs };
        let prog = this.prog = this.program = createProgram(ctx, vs, fs);
        const getCurrentVars = (varsType, aou = varsType === ctx.ACTIVE_ATTRIBUTES?"Attrib": "制服") =>
            [...Array(ctx.getProgramParameter(prog, varsType))]
            .map((_, i) => {
                const {size, type, name} = ctx["getActive" + aou](prog, i),
                      loc = ctx[`get${aou}Location`](prog, name);
                return {size, type, name: name.split("[")[0], loc};
            }）
            .reduce((ac, {name, size, type, loc}) => {
                ac[name] = {name, size, type, loc};
                返回ac；
            }，{}）；
        this.vars = {
            atts：getCurrentVars（ctx.ACTIVE_ATTRIBUTES），
            unis：getCurrentVars（ctx.ACTIVE_UNIFORMS）
        };
    };
    use() { this.ctx.useProgram(this.prog); return this; };
    getAtt(name) { return this.vars.atts[name].loc; };
    getUni(name) { return this.vars.unis[name].loc; };
    setAtt(name, bufferData, size = undefined, attDataType = this.ctx.FLOAT, normalized = false, stride = 0, offset = 0) {
        const ctx = this.ctx, att = this.vars.atts[name];
        如果（！att）抛出“无法获得属性”+名称；
        if (size === undefined) {
            开关（att.type）{
                案例ctx.FLOAT：
                    尺寸=1；断裂；
                案例ctx.FLOAT_VEC2：案例ctx.FLOAT_MAT2：
                    尺寸=2；断裂；
                案例ctx.FLOAT_VEC3：案例ctx.FLOAT_MAT3：
                    尺寸=3；休息；
                案例ctx.FLOAT_VEC4：案例ctx.FLOAT_MAT4：
                    尺寸=4；休息；
                默认：
                    console.error（“不知道gl类型”，att.type，“for attribute”，att.name）；
                    抛出“不知道属性类型”；
            }
        }
        let bufferType = bufferData.type || ctx.ARRAY_BUFFER;
        ctx.bindBuffer（bufferType，bufferData）；
        ctx.enableVertexAttribArray（att.loc）；
        ctx.vertexAttribPointer（att.loc，大小，attDataType，归一化，步幅，偏移）；
        ctx.bindBuffer（bufferType，null）；
        归还这个；
    };
    setUni（名称，值）{
        const ctx = this.ctx, uni = this.vars.unis[name];
        开关（uni.type）{
            案例ctx.FLOAT_MAT4：
                ctx.uniformMatrix4fv（uni.loc，false，value）；
                休息；
            案例ctx.FLOAT_MAT3：
                ctx.uniformMatrix3fv（uni.loc，false，value）；
                休息；
            案例ctx.FLOAT_MAT2：
                ctx.uniformMatrix2fv（uni.loc，false，值）；
                休息；
            案例ctx.FLOAT：
                ctx.uniform1f（uni.loc，值）；
                休息；
            案例ctx.INT：案例ctx.SAMPLER_CUBE：案例ctx.SAMPLER_2D：
            案例ctx.SAMPLER_2D_ARRAY：
                ctx.uniform1i（uni.loc，值）；
                休息；
            案例ctx.FLOAT_VEC2：
                ctx.uniform2fv（uni.loc，值）；
                休息；
            案例ctx.FLOAT_VEC3：
                ctx.uniform3fv（uni.loc，值）；
                休息；
            案例ctx.FLOAT_VEC4：
                ctx.uniform4fv（uni.loc，值）；
                休息；
            案例ctx.INT_VEC2：
                ctx.uniform2iv（uni.loc，值）；
                休息；
            案例ctx.INT_VEC3：
                ctx.uniform3iv（uni.loc，值）；
                休息；
            案例ctx.INT_VEC4：
                ctx.uniform4iv（uni.loc，值）；
                休息；
            默认：
                console.warn("Don't know gl type", uni.type, "for uniform", uni.name);
                扔“不知道制服类型”；
        }
        归还这个；
    };
    bindTex(uniName, tex, texType = tex.type || ctx.TEXTURE_2D, unit = 0) {
        const ctx = this.ctx;
        ctx.activeTexture（ctx.TEXTURE0 + unit）；
        ctx.bindTexture（texType，tex）；
        返回this.setUni（uniName，unit）；
    };
    dispose() {
        const {ctx} = this;
        ctx.deleteShader（this.shaders.vs）；
        ctx.deleteShader（this.shaders.fs）；
        ctx.deleteProgram（this.program）；
    };
};

出口{
    程序，
    默认程序
};
