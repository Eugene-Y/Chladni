// diff equation solution: https://thelig.ht/chladni/
// sketch: Eugene Yakshin, 2021


class Chladni {

    constructor (patternSize) {
        this.time = 0
        this.params = { a: 0, b: 0, n: 0, m: 0 }
        this.screenW = 1
        this.screenH = 1
        this.pixelDensity = 1
        this.x0 = 0
        this.y0 = 0
        this.mouseX = 0
        this.mouseY = 0
        // смещение координат мыши для div, 
        // который не занимает весь экран
        this.mX0 = 0
        this.mY0 = 0
        this.patternSize = patternSize
        this.reset();
    }


    copyParams (prs) {
        return {
            a: prs.a, b: prs.b,
            n: prs.n, m: prs.m
        }
    }


    reset() {
        this.thresh = 0.5
        this.threshFactor = 1
        this.threshAmp = 1
        this.zoom = 4 / this.patternSize
        this.animate = true
        this.curved = true
        this.bent = false
        this.granules = false
        this.exp = false
        this.pulse = true
        this.color = true
        this.mouseAB = true
        this.dx = 0
        this.dy = 0
    }


    onResize (canvW, canvH,
              screenW, screenH, d) {
        this.mX0 = (screenW - canvW) / 2
        this.mY0 = (screenH - canvH) / 2
        this.screenW = screenW
        this.screenH = screenH
        this.pixelDensity = d
        this.x0 = Math.floor((canvW - this.patternSize) / 2)
        this.y0 = 0// Math.floor((canvH - this.patternSize) / 2)
    }


    update (p) {
        this.updateTime()
        this.updateMouseParams (p)
        this.updatePatternParams()
        this.updateThresh()
    }


    HSBToRGB (h, s, b) { // H: [0, 360], S: [0, 255], B: [0, 255]
        s /= 255
        b /= 255
        const k = (n) => (n + h / 60) % 6
        const f = (n) => b * (1 - s * Math.max (0, Math.min (k (n), 4 - k (n), 1)))
        return { r: 255 * f (5), g: 255 * f (3), b: 255 * f (1) }
    }


    pixelIndexesFor (g, x, y) {
        const d = this.pixelDensity
        const len = d * d
        let indexes = new Array(len)
        for (let n = 0; n < d; ++n)
            for (let m = 0; m < d; ++m) {
                const k = n * d + m
                indexes[k] = 4 * ((y * d + m) * g.width * d + (x * d + n));
            }
        return indexes
    }


    drawPoint (g, x, y, color) {
        const indexes = this.pixelIndexesFor (g, x, y)
        for (let i = 0; i < indexes.length; ++i) {
            let k = indexes[i]
            g.pixels[k] = color.r
            g.pixels[++k] = color.g
            g.pixels[++k] = color.b
            //g.pixels[++k] = 255
        }
    }


    drawPattern (p) {
        p.push()
        p.loadPixels()

        let prs = this.copyParams (this.params)
        const sat = 150
        const br = 255
        const hc = 360 / 255
        
        let s = this.patternSize
        for (let j = 0; j < s; ++j) {
            let color
            if (this.color) {
                const hue = ((p.frameCount + 0.05 * j) % 255) * hc
                color = this.HSBToRGB (hue, sat, br)
            }
            else
                color = { r: 255, g: 255, b: 255 }

            for (let i = 0; i < s; ++i) {
                const x = this.zoom * (-s / 2 + i)
                const y = this.zoom * (-s / 2 + j)

                if (this.bent) {
                    prs.a += 0.00003 * prs.a
                    prs.n += 0.00001 * prs.n
                }

                const prs2 = this.curved ?
                    this.computeCurvedParams (prs, i, j)
                    : prs

                const v = this.computeChladniVal (prs2, x, y)
                const av = Math.abs (v)
                //console.assert (av <= 1) // ?
                let q = this.thresh - av
                if (this.granules)
                    q *= q

                if (q > 0.2 || Math.random() * q > 0.04) {
                    const px = this.x0 + i
                    const py = this.y0 + j
                    this.drawPoint (p, px, py, color)
                }
            }
        }

        p.updatePixels()
        p.pop()
    }


    computeCurvedParams (params, i, j) {
        const dx = this.dx
        const dy = this.dy

        // вычитаем mx0 и my0 тк нам нужна позиция внутри паттерна  
        const mx = this.mouseX - this.mX0 + 30 * dx * dx * dx // инерция
        const my = this.mouseY - this.mY0 + 30 * dy * dy * dy

        const px = this.x0 + i + 10 * Math.cos (10 * dx) // колебания вокруг мышки
        const py = this.y0 + j + 10 * Math.cos (10 * dy)

        let mpxs = mx - px; mpxs *= mpxs
        let mpys = my - py; mpys *= mpys
        const dist = Math.pow (mpxs + mpys, 0.45)
                        * (1 + Math.abs(dx) + Math.abs(dy)) // стекание к мышке при остановке

        let curvature = 50 / dist

        let prs = this.copyParams (params)
        prs.n *= 1 + curvature
        prs.m *= 1 + curvature
        //c = (1 + 10 * c) * Math.cos (10 * c)
        //prs.a += c
        //prs.b += c
        return prs
    }


    updateTime() {
        this.time = performance.now() / 300000
    }


    updateMouseParams (p) {
        const prevMouseX = this.mouseX
        const prevMouseY = this.mouseY
        this.mouseX = 0.01 * prevMouseX + 0.99 * (p.mouseX + this.mX0)
        this.mouseY = 0.01 * prevMouseY + 0.99 * (p.mouseY + this.mY0)
        const dx = this.mouseX - prevMouseX
        const dy = this.mouseY - prevMouseY
        this.dx = 0.99 * this.dx + 0.01 * dx
        this.dy = 0.99 * this.dy + 0.01 * dy
        const dmax = 0.5;
        this.dx = Math.min (this.dx, dmax)
        this.dx = Math.max (this.dx, -dmax)
        this.dy = Math.min (this.dy, dmax)
        this.dy = Math.max (this.dy, -dmax)
        if (Math.abs (this.dx) < 1e-5)
            this.dx = 0
        if (Math.abs (this.dy) < 1e-5)
            this.dy = 0

    }


    updatePatternParams (p) {
        let prs = this.params

        const cx = -1 + 2 * (this.mouseX / this.screenW)
        const cy = -1 + 2 * (this.mouseY / this.screenH)
        // TODO dx dy
        if (this.mouseAB) {
            prs.a = 20 * cx// * (1 + 10 * this.dx)
            prs.b = 20 * cy// * (1 + 10 * this.dy)
            if (this.animate) {
                prs.n = 10 * Math.cos ((4 * 11 * this.time) + (1 + 0.2 * this.dx))
                prs.m = 10 * Math.cos ((4 * 17 * this.time) + (1 + 0.2 * this.dy))
            }
        }
        else {
            if (this.animate) {
                prs.a = 20 * Math.cos ((15 * 11 * this.time))// * (1 + 0.01 * this.dx))
                prs.b = 20 * Math.cos ((15 * 17 * this.time))// * (1 + 0.01 * this.dy))
            }
            prs.n = 10 * cx * (1 + 0.5 * this.dx)
            prs.m = 10 * cy * (1 + 0.5 * this.dy)
        }
    }


    updateThresh() {
        if (this.pulse)
            this.thresh = 0.06 + 0.1 *
                (1
                    + Math.pow (Math.cos (1000 * this.time), 3)
                    + 0.2 * Math.random())
        else
            this.thresh = 0.08

        let a = this.threshAmp
        if (this.exp) {
            a *= 3.5
            if (this.bent) {
                a *= 2
                if (!this.mouseAB)
                    a *= 2
            }
        }
        if (!this.pulse)
            a *= 2.8

        this.thresh *= a * this.threshFactor
    }


    computeChladniVal (params, x, y) {
        let v = this.exp ? this.chladniExp (params, x, y)
                         : this.chladniSimple (params, x, y)
        v /= (Math.abs (params.a) + Math.abs (params.b)) // normalize thickness
        return v
    }


    chladniSimple(params, x, y) {
        return params.a * Math.sin (params.n * x)
                        * Math.sin (params.m * y)
             + params.b * Math.sin (params.m * x)
                        * Math.sin (params.n * y)
    }


    chladniExp (params, x, y) {
        let n = params.n * x
        let m = params.m * y

        let v = 1000
        if (Math.abs (n) > 1e-5 && Math.abs (m) > 1e-5)
            v = params.a * 1 / Math.sin (n)
                         * 1 / Math.sin (m)
                + params.b * Math.sin (params.m * x)
                           * Math.sin (params.n * y)
        return v
    }


} // class Chladni

