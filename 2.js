从“../utils/math/index.js”导入{vec3, mat4 }；

班级相机{
    static get projectionType() {
        返回{
            视角：“透视”，
            ortho：“正字法”，
        };
    };
    static get viewType() {
        返回{
            fps：“fpsView”，
            lookAt: "lookAt",
        };
    };
    构造函数（aspectRatio，{
projectionType = Camera.projectionType.perspective，
viewType = Camera.viewType.fps，
fovy = 90，近 = 0.1，远 = 256，
左=-1，右=1，底部=-1，顶部=1，
position = [0, 0, 3], pitch = 0, yaw = 0, rollZ = 0,
target = [0, 0, 0], up = [0, 1, 0],
实体 = null，
    } = {}) {
        this.projectionType = projectionType;
        this.viewType = viewType;
        this.aspectRatio = aspectRatio;
        this.fovy = this.nowFovy = fovy; this.near = near; this.far = far;
        this.left = left; this.right = right; this.bottom = bottom; this.top = top;
        this.position = vec3.create(...position);
        this.pitch = pitch; this.yaw = yaw; this.rollZ = rollZ;
        this.target = target; this.up = up;
        开关（viewType）{
        案例Camera.viewType.fps：
            this.vM = mat4.fpsView(this.position, pitch, yaw, rollZ);
            休息；
        案例Camera.viewType.lookAt：
            this.vM = mat4.lookAt(this.position, target, up);
            休息；
        默认：
            抛出“无法识别的视图类型”；
        }
        开关（投影类型）{
        案例Camera.projectionType.perspective：
            this.pM = mat4.perspective(this.fovy, this.aspectRatio, this.near, this.far);
            休息；
        案例Camera.projectionType.ortho：
            this.pM = mat4.ortho(this.left, this.right, this.bottom, this.top, this.near, this.far);
            休息；
        默认：
            抛出“无法识别的投影类型”；
        }
        this.pvM = mat4.multiply(this.pM, this.vM);
        this.pChange = this.vChange = false;
        this.bindEntity（实体）；
    };
    setPos(pos) { this.position = vec3.create(...pos); this.vChange = true; return this; };
    setPitch(pitch) { this.pitch = pitch; this.vChange = true; return this; };
    setYaw(yaw) { this.yaw = yaw; this.vChange = true; return this; };
    setRollZ(z) { this.rollZ = z; this.vChange = true; return this; };
    setTarget(target) { this.target = target; this.vChange = true; return this; }
    setUp(up) { this.up = up; this.vChange = true; return this; };

    setFovy(fovy) { if (fovy == this.fovy) return this; this.fovy = this.nowFovy = fovy; this.pChange = true; return this; };
    setNear(near) { this.near = near; this.pChange = true; return this; };
    setFar(far) { this.far = far; this.pChange = true; return this; };
    setAspectRatio(aspectRatio) { this.aspectRatio = aspectRatio; this.pChange = true; return this; };
    setLeft(left) { this.left = left; this.pChange = true; return this; };
    setRight(right) { this.right = right; this.pChange = true; return this; };
    setBottom(bottom) { this.bottom = bottom; this.pChange = true; return this; };
    setTop(top) { this.top = top; this.pChange = true; return this; };

    _linearGradient(sx, ex, sy, ey, x) {
        x = Math.max(0, Math.min((x - sx) / (ex - sx), 1));
        返回sy > ey
？sy - (sy - ey) * x
：sy + (ey - sy) * x;
    };
    _powerGradient(sx, ex, sy, ey, x) {
        x = Math.max(0, Math.min((x - sx) / (ex - sx), 1));
        返回sy > ey
？ey + (sy - ey) * ((-x + 1) ** 2)
：sy + (ey - sy) * (x ** 0.5);
    };
    changeFovyWithAnimation(deltaFovy = 0, deltaTime = 250) {
        如果（deltaTime == 0）返回this.setFovy（this.fovy + deltaFovy）；
        如果（this.fovy + deltaFovy === this.endFovy）返回此；
        let now = this.nowTime = (new Date()).getTime();
        如果（！（”beginFovy" in this)) {
            this.endFovy = this.nowFovy = this.fovy;
            this.fovyAnimationEndTime = now;
        }
        if (this.fovyAnimationEndTime <= now) {
            this.fovyAnimationBeginTime = now;
            this.fovyAnimationEndTime = now + deltaTime;
        }
        其他{
            this.fovyAnimationEndTime = now +（现在 - this.fovyAnimationBeginTime）；
            this.fovyAnimationBeginTime = this.fovyAnimationEndTime - deltaTime;
        }
        this.beginFovy = this.endFovy;
        this.endFovy = this.fovy + deltaFovy;
        归还这个；
    };

    get projection() {
        if (this.pChange) {
            this.pChange = false;
            return this.projectionType === Camera.projectionType.perspective
？mat4.perspective(this.nowFovy, this.aspectRatio, this.near, this.far, this.pM)
: mat4.ortho(this.left, this.right, this.bottom, this.top, this.near, this.far, this.pM);
        }
        返回 this.pM;
    };
    get view() {
        如果（this.entity）{
            let e = this.entity，
                pos = e.getEyePosition();
            if (this.pitch == e.pitch && this.yaw == e.yaw && vec3.exactEquals(pos, e.position))
                返回此.vM；
            vec3.create(...pos, this.position);
            this.pitch = e.pitch; this.yaw = e.yaw;
            return mat4.fpsView(this.position, this.pitch, this.yaw, this.rollZ, this.vM);
        }
        if (this.vChange) {
            this.vChange = false;
            返回 this.viewType === Camera.viewType.fps
？mat4.fpsView(this.position, this.pitch, this.yaw, this.rollZ, this.vM)
: mat4.lookAt(this.position, this.target, this.up, this.vM);
        }
        返回此.vM；
    };
    get projview() {
        let now = (new Date()).getTime();
        // 60fps -> 0.0166spf -> 16 mspf
        如果（this.nowFovy！= this.endFovy && now - this.nowTime > 16) {
            this.nowTime = now;
            this.pChange = true;
            this.nowFovy = this._powerGradient(
                this.fovyAnimationBeginTime， this.fovyAnimationEndTime，
                this.beginFovy, this.endFovy, now);
        }
        如果（this.entity || this.pChange || this.vChange）
            return mat4.multiply(this.projection, this.view, this.pvM);
        返回 this.pvM；
    };
    bindEntity(entity = null) {
        如果（实体===此.entity）返回；
        if (this.entity) this.entity.setCamera(null);
        this.entity = 实体；
        如果（实体）实体.setCamera（此）；
    };
};

出口{
    默认情况下，
    相机，
};
