module.exports = function(){
    let iPosition = tools.getQueryString('position');
    var grass = document.querySelector('#grass');
    var grassImage = document.querySelector('#grass image');
    var wrapper = document.getElementById('wrapper');
    var wrapperChild = wrapper.children[0];
    var iTargetPath = document.querySelector('#path-' + iPosition );

    var position = {
        sl: 0,
        st: 0,
        ml: 0,
        mt: 0
    };
    
    var oBubble = document.querySelector('#bubble');
    oBubble.setAttribute('d', iTargetPath.getAttribute('d'));

    var clientRect = {
        l: oBubble.getBoundingClientRect().left,
        t: oBubble.getBoundingClientRect().top,
        r: oBubble.getBoundingClientRect().right,
        b: oBubble.getBoundingClientRect().bottom,
        w: oBubble.getBoundingClientRect().width,
        h: oBubble.getBoundingClientRect().height
    }
    console.log(oBubble.getBoundingClientRect());
    var pleft = parseInt(wrapper.offsetLeft - clientRect["l"]);
    var ptop = parseInt(wrapper.offsetTop - clientRect["t"]);

    console.log(grassImage)
    position["sl"] = pleft;
    position["st"] = ptop;

    grassImage.style.transform = 'translateX(-' + position["sl"] + 'px) translateY(-' + position["st"] + 'px)';
    wrapperChild.style.transform = 'translate('+ position["sl"] +'px, '+ position["st"] +'px)';
    
    let osize = {
        w: wrapper.offsetWidth,
        h: wrapper.offsetHeight
    }
    wrapper.style.width = clientRect["w"] + 'px';
    wrapper.style.height = clientRect["h"] + 'px';

    wrapper.querySelector('.icons--grass').style.width = osize.w + 'px';
    wrapper.querySelector('.icons--grass').style.height = osize.h + 'px';

    position["sl"] = wrapper.offsetLeft;
    position["st"] = wrapper.offsetTop;

    wrapper.addEventListener('touchstart', function (ev) {
        ev.preventDefault();
        position['sl'] = ev.changedTouches[0].clientX - position['sl'];
        position['st'] = ev.changedTouches[0].clientY - position['st'];
    }, false);
    
    wrapper.addEventListener('touchmove', function (ev) {
        ev.preventDefault();

        position['ml'] = ev.changedTouches[0].clientX - position['sl'];
        position['mt'] = ev.changedTouches[0].clientY - position['st'];

        wrapper.style.left = position['ml'] + 'px';
        wrapper.style.top = position['mt'] + 'px';
    }, false);
    
    wrapper.addEventListener("touchend", function (ev) {
        position['sl'] = ev.changedTouches[0].clientX - position['sl'];
        position['st'] = ev.changedTouches[0].clientY - position['st'];
        
        let iNear = {
            l: position['sl'] - document.querySelector('.wy_show_wrap').offsetLeft,
            t: position['st'] - document.querySelector('.wy_show_wrap').offsetTop
        } 
        console.log(Math.abs( iNear["l"] - clientRect["l"]), Math.abs( iNear["t"] - clientRect["t"]))
        if(Math.abs( iNear["l"] - clientRect["l"]) <= 200 && Math.abs( iNear["t"] - clientRect["t"]) <= 200 ){
            let iPath = document.querySelector('#path-' + iPosition );
            gsap.TweenLite.to(iPath,1,{
                fill:'rgba(0,0,0,0)',
                onUpdate:update
            });
            gsap.TweenLite.to(this, 1, {
               left: iTargetPath.getBoundingClientRect().left + 'px',
               top: iTargetPath.getBoundingClientRect().top + 'px'
            })
            function update(o) {
                $(iPath).attr('fill', $(iPath).css('fill'))
            }
            if((typeof animate1) !== 'undefined' )animate1.kill();
            if((typeof animate2) !== 'undefined' )animate2.kill();
            if((typeof animate3) !== 'undefined' )animate3.kill();

        } else {
            
        }
    }, false);
}