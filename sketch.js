// diff equation solution: https://thelig.ht/chladni/
// sketch: Eugene Yakshin, 2021

    
    const rvtemplate = (p) => {
      
      let div
      p.patternSize = 370
      p.chladni = new Chladni(p.patternSize)
      p.viewAnimationOption = 0
      p.viewParamsAnimDelay = 5000
      p.animateViewParams = false;
      p.minFPS = 100
      p.txtSize = 12
      
      p.setup = function() {
        div = p.canvas.parentElement
        //div.style('background-color', 'rgb(80, 80, 80)');
        //div.center();
        let c = p.createCanvas(p.patternSize, 1.5 * p.patternSize);
        //c.drop(p.gotFile)
        p.windowResized()
        p.textSize (p.txtSize)
        c.mouseOver (p.onMouseOver)
        c.mouseMoved (p.onMouseMove)
        p.colorMode (p.HSB, 255)
        p.background (40)
        p.textAlign (p.LEFT, p.TOP)
        p.noCursor()
        p.frameRate (30)
        //p.getAudioContext().suspend();
        //if (p.animateViewParams && p.chladni.animate)
        //  setTimeout (p.changeViewParams, p.viewParamsAnimDelay );
      }
      
      
      p.windowResized = function() {
        const maxW = div.clientWidth
        const maxH = div.clientHeight
        //p.resizeCanvas (w, h)
        p.chladni.onResize(p.width, p.height, 
                           maxW, maxH, p.pixelDensity())
      }
      
      
      p.draw = function() {
        p.chladni.update (p)
        
        const a = 200
        p.background (40, a)
        p.chladni.drawPattern (p)
        p.drawInfo()
        //p.drawMouse (p)
      }


      p.drawInfo = function() {
        p.push()
        p.noStroke()
        const c = p.chladni
        p.fill(230 * (0.75 + c.thresh))

        p.minFPS = performance.now() % 500 < 50
          ? p.frameRate()
          : Math.min(p.minFPS, p.frameRate())

        const prs = c.params
        const ts = p.txtSize
        const x0 = c.x0
        const y0 = c.y0

        let tx = x0
        const ty0 = y0 + c.patternSize + ts
        let ty = ty0

        p.text("frame  # " + p.frameCount, tx, ty)
        ty += ts
        p.text("fps  " + parseInt(p.minFPS), tx, ty)
        ty += ts
        p.text("a   " + p.numToStr (prs.a), tx, ty)
        ty += ts
        p.text("b   " + p.numToStr (prs.b), tx, ty)
        ty += ts
        p.text("n   " + p.numToStr (prs.n), tx, ty)
        ty += ts
        p.text("m   " + p.numToStr (prs.m), tx, ty)
        ty += ts
        p.text("l   " + p.numToStr (c.thresh), x0, ty)
        ty += ts
        p.text("dx   " + p.numToStr (c.dx), tx, ty)
        ty += ts
        p.text("dy   " + p.numToStr (c.dy), tx, ty)
        ty += ts
        p.text("mx   " + p.numToStr(c.mouseX), tx, ty)
        ty += ts
        p.text("my   " + p.numToStr(c.mouseY), tx, ty)

        ty = ty0
        tx += 100

        p.text("A - animate:  " + (c.animate ? "1" : "0"), tx, ty)
        ty += ts
        p.text("B - bent:  " + (c.bent ? "1" : "0"), tx, ty)
        ty += ts
        p.text("S - curved:  " + (c.curved ? "1" : "0"), tx, ty)
        ty += ts
        p.text("G - granules:  " + (c.granules ? "1" : "0"), tx, ty)
        ty += ts
        p.text("E - exp:  " + (c.exp ? "1" : "0"), tx, ty)
        ty += ts
        p.text("C - color:  " + (c.color ? "1" : "0"), tx, ty)
        ty += ts
        p.text("P - pulse:  " + (c.pulse ? "1" : "0"), tx, ty)
        ty += ts
        p.text("M - mouse mod:  " + (c.mouseAB ? "ab" : "nm"), tx, ty)

        ty = ty0
        tx += 120
        p.text("↑   ↓    - zoom:  " + p.numToStr (c.zoom), tx, ty)
        ty += ts
        p.text("← →  - thickness:  " + p.numToStr(c.threshAmp), tx, ty)
        ty += ts
        p.text("2x click - reset & randomize", tx, ty)
        ty += 2 * ts

        p.pop()
      }


      p.drawMouse = function (p) {
        p.push()
        const c = p.chladni;
        const d = 5
        if (p.mouseX < c.x0 - d || p.mouseX > c.x0 + c.patternSize + d
          || p.mouseY < c.y0 - d || p.mouseY > c.y0 + c.patternSize + d) {
          p.strokeWeight (1)
          p.stroke (200)
          p.line (p.mouseX - d, p.mouseY, p.mouseX + d, p.mouseY)
          p.line (p.mouseX, p.mouseY - d, p.mouseX, p.mouseY + d)
          }
        p.pop()
      }


      p.numToStr = function (x) {
        return Number.parseFloat(x).toPrecision(4);
      }


      p.changeViewParams = function () {
        const c = p.chladni;
        const opt = p.viewAnimationOption % 5
        switch (opt) {
          case 0:
            c.bent = !c.bent
          break
          case 1:
            c.granules = !c.granules
          break
          case 2:
            c.exp = !c.exp
          break
          case 3:
            c.mouseAB = !c.mouseAB
          break
          case 4:
            c.pulse = !c.pulse
          break
          default:
          break
        }
        ++p.viewAnimationOption
        if (c.animate && p.animateViewParams)
          setTimeout (p.changeViewParams, p.viewParamsAnimDelay);
      }
      
      
      p.gotFile = function(f) {
        filename = f.name
        console.log("dropped file", f.name)
      }
      
      p.mousePressed = function(){
        //console.log("mousePressed", p.mouseX, p.mouseY)
        p.mouseClicked()
      }
      
      p.mouseReleased = function(){
        //console.log("mouseReleased", p.mouseX, p.mouseY)
      }
      
      p.doubleClicked = function() {
        //console.log("doubleClicked", p.mouseX, p.mouseY)
        p.loop()
        p.chladni.reset()
        p.chladni.randomizePatternViewParams()
      }
      
      p.mouseClicked = function() {
        //p.userStartAudio();
        //console.log("mouseClicked", p.mouseX, p.mouseY)
      }
      
      p.onMouseOver = function() {
        //console.log("mouse over")
      }
      
      p.onMouseMove = function() {
        //console.log("mouse move")
      }
      
      p.mouseWheel = function(event) {
        //console.log("mouseWheel", event.deltaX, event.deltaY)
      }
      
      p.mouseDragged = function(){
        //console.log("mouseDragged", p.pmouseX, p.pmouseY, "->", p.mouseX, p.mouseY)
      }
      
      p.keyReleased = function() {
        //console.log("keyReleased")
      }
      
      p.keyPressed = function() {
        console.log("keyPressed, key:", p.key, "keyCode:", p.keyCode)
        let c = p.chladni

        switch (p.keyCode) {
          case p.RIGHT_ARROW:
              c.threshAmp *= 1.1
            break
          case p.LEFT_ARROW:
              c.threshAmp /= 1.1
            break

          case p.UP_ARROW:
            c.zoom *= 1.05
            break
          case p.DOWN_ARROW:
            c.zoom *= 0.95
            break
          default:
            break
        }

        switch (p.key) {
          case 'l':
          case 'д':
            p.loop()
            break
          case 'n':
          case 'т':
            p.noLoop()
            break
          case 'a':
          case 'ф':
            c.animate = !c.animate
            //if (c.animate && p.animateViewParams)
            //  setTimeout (p.changeViewParams, p.viewParamsAnimDelay );
            break
          case 'b':
          case 'и':
            c.bent = !c.bent
            break
          case 'c':
          case 'с':
            c.color = !c.color
            break
          case 's':
          case 'ы':
            c.curved = !c.curved
            break
          case 'g':
          case 'п':
            c.granules = !c.granules
            break
          case 'm':
          case 'ь':
            c.mouseAB = !c.mouseAB
            break
          case 'e':
          case 'у':
            c.exp = !c.exp
            break
          case 'p':
          case 'з':
            c.pulse = !c.pulse
            break
          default: break
          }
      }
      
    }
    
    const rv = new p5(rvtemplate)