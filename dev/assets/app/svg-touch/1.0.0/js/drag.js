const tools = require('./../common/tools.js');
const gsap = require('./../common/gsap.js');

class Drag{
    constructor(){
        this.init();
        this.bindEvent();
    }

    init(){
        this.iPosIndex = tools.getQueryString('position') || 1;
        this.oFilterGrass = document.querySelector('#grass');
        this.oFilterImg = document.querySelector('#grass image');
        this.oDragWrapper = document.getElementById('wrapper');
        this.oDragChild = this.oDragWrapper.children[0];
        this.oCurrentPath = document.querySelector('#path-' + this.iPosIndex );

        this.pos = {
            sl: 0,
            st: 0,
            ml: 0,
            mt: 0
        };

        this.oDragPath = document.querySelector('#bubble');
        this.oDragPath.setAttribute('d', this.oCurrentPath.getAttribute('d'))

        this.clientRect = {
            l: this.oDragPath.getBoundingClientRect().left,
            t: this.oDragPath.getBoundingClientRect().top,
            r: this.oDragPath.getBoundingClientRect().right,
            b: this.oDragPath.getBoundingClientRect().bottom,
            w: this.oDragPath.getBoundingClientRect().width,
            h: this.oDragPath.getBoundingClientRect().height
        }

        console.log(this.oDragPath.getBoundingClientRect());
        this.pos["sl"] = this.oDragWrapper.offsetLeft - this.clientRect["l"];
        this.pos["st"] = this.oDragWrapper.offsetTop - this.clientRect["t"];

        this.oFilterImg.style.transform = 'translateX(-' + this.pos["sl"] + 'px) translateY(-' + this.pos["st"] + 'px)';
        this.oDragChild.style.transform = 'translate('+ this.pos["sl"] +'px, '+ this.pos["st"] +'px)';

        let osize = {
            w: this.oDragWrapper.offsetWidth,
            h: this.oDragWrapper.offsetHeight
        }

        this.oDragWrapper.style.width = this.clientRect["w"] + 'px';
        this.oDragWrapper.style.height = this.clientRect["h"] + 'px';
    
        this.oDragWrapper.querySelector('.icons--grass').style.width = osize.w + 'px';
        this.oDragWrapper.querySelector('.icons--grass').style.height = osize.h + 'px';
    
        this.pos["sl"] = this.oDragWrapper.offsetLeft;
        this.pos["st"] = this.oDragWrapper.offsetTop;
    
    }

    bindEvent(){
        let that = this;
        let oriPos = {
            l: that.pos['sl'],
            t: that.pos['st']
        }
        this.oDragWrapper.addEventListener('touchstart', function (ev) {
            ev.preventDefault();
            that.pos['sl'] = ev.changedTouches[0].clientX - that.pos['sl'];
            that.pos['st'] = ev.changedTouches[0].clientY - that.pos['st'];
        }, false);
        
        this.oDragWrapper.addEventListener('touchmove', function (ev) {
            ev.preventDefault();
    
            that.pos['ml'] = ev.changedTouches[0].clientX - that.pos['sl'];
            that.pos['mt'] = ev.changedTouches[0].clientY - that.pos['st'];
    
            this.style.left = that.pos['ml'] + 'px';
            this.style.top = that.pos['mt'] + 'px';
        }, false);
        
        this.oDragWrapper.addEventListener("touchend", function (ev) {
            that.pos['sl'] = ev.changedTouches[0].clientX - that.pos['sl'];
            that.pos['st'] = ev.changedTouches[0].clientY - that.pos['st'];
            
            let iNear = {
                l: that.pos['sl'] - document.querySelector('.wy_show_wrap').offsetLeft,
                t: that.pos['st'] - document.querySelector('.wy_show_wrap').offsetTop
            } 
            
            if(Math.abs( iNear["l"] - that.clientRect["l"]) <= 30 && Math.abs( iNear["t"] - that.clientRect["t"]) <= 30 ){
                gsap.TweenLite.to(that.oCurrentPath, 1, {
                    fill:'rgba(0,0,0,0)',
                    onUpdate:()=>{
                        $(that.oCurrentPath).attr('fill', $(that.oCurrentPath).css('fill'))
                    }
                });
                gsap.TweenLite.to(this, 1, {
                   left: that.oCurrentPath.getBoundingClientRect().left + 'px',
                   top: that.oCurrentPath.getBoundingClientRect().top + 'px',
                   onComplete(){
                       document.querySelector('.body').classList.add('none')
                   }
                });

                if((typeof animate1) !== 'undefined' )animate1.kill();
                if((typeof animate2) !== 'undefined' )animate2.kill();
                if((typeof animate3) !== 'undefined' )animate3.kill();
    
            } else {
                gsap.TweenLite.to(this, 1, {
                    left: oriPos["l"] + 'px',
                    top: oriPos["t"] + 'px'
                 })
                 that.pos['sl'] = oriPos["l"];
                 that.pos['st'] = oriPos["t"];
            }
        }, false);
    }
}

module.exports = Drag;