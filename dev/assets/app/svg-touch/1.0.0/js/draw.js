const gsap = require('./../common/gsap.js');
const tools = require('./../common/tools.js');

module.exports = function(){
    let iShow = tools.getQueryString('position');
    $('#svg use').map((index,item)=>{
        let iPath = $($(item).attr('xlink:href'))[0];
        if(index + 1 != iShow){
            gsap.TweenLite.to(iPath,1.5,{
                fill:'rgba(0,0,0,0)',
                onUpdate:update
            });
        } else {
            // let totalLength = $(iPath)[0].getTotalLength();
            // $(iPath).css('strokeDasharray',totalLength + ' 0');
            // $(iPath).attr('strokeDasharray',totalLength + ' 0');
            animate1 = gsap.TweenLite.to(iPath,1.5,{
                // fill:'#00A378',
                fill: 'rgba(0, 163, 120,0.9)',
                onUpdate:update,
                onComplete:()=>{
                    animate1.pause();
                    restart(iPath);
                }
            });

            function restart(iPath){
                animate2 = gsap.TweenLite.to(iPath, .5, {
                    fill: 'rgba(0, 163, 120,0.5)',
                    onUpdate:()=>{$(iPath).attr('fill', $(iPath).css('fill'));},
                    onComplete:()=>{
                        animate3 = gsap.TweenLite.to(iPath, 0.9, {
                            fill: 'rgba(0, 163, 120,0.95)',
                            onUpdate:()=>{$(iPath).attr('fill', $(iPath).css('fill'));},
                            onComplete: ()=>{
                                restart(iPath);
                            }
                        })
                    }
                });
            }



            //filter="url(#f1)"
            // $(iPath).attr('filter', 'url(#f1)');

            // $(iPath).attr({
            //     'stroke-width': '10',
            //     'stroke': 'rgba(0, 163, 120,1)'
            // });

            // gsap.TweenLite.to(iPath, 3, {
            //     'stroke-dasharray': '0% '+ totalLength,
            //     onUpdate:updateTarget
            // })
        }

        // gsap.TweenLite.from(iPath,72, {
        //     'strokeDasharray': '0% '+totalLength,
        //     onUpdate: strokeUpdate
        // });
        // function strokeUpdate() {
        //     console.log($(iPath).css('strokeDasharray'))
        //     // $(iPath).attr('strokeDasharray',$(iPath).css('strokeDasharray'));
        // }
        //


        // function updateTarget(){
        //     $(iPath).attr('fill', $(iPath).css('fill'));
        //     $(iPath).attr('strokeDasharray',$(iPath).css('strokeDasharray'));
        // }

        function update(o) {
            $(iPath).attr('fill', $(iPath).css('fill'));
        }
    });



    let x = 0;
    let iTarget = 0;
    let iMax = $('.wy_ctr_wrap').width() - $('.wy_ctr_wrap .wy_ctr_rb').width() - $('.wy_ctr_wrap .wy_ctr_lb').width() + ($('.wy_ctr_wrap .wy_ctr_lb').width() - $('.wy_ctr_wrap .wy_ctr_rb').width() + 4);

    $('.wy_ctr_wrap .wy_ctr_lb').on('touchstart', function(e){
        e.preventDefault();
        x = e.changedTouches[0].clientX;
        $('.wy_ctr_wrap .wy_ctr_lb').on('touchmove', function(e){
            let iCurrent = e.changedTouches[0].clientX - x;
            iCurrent = iCurrent < 0 ? 0 :iCurrent > iMax ? iMax : iCurrent;
            $(this).css('left', iCurrent+ 'px')
        });
        $('.wy_ctr_wrap .wy_ctr_lb').on('touchend', function(e){
            iTarget = e.changedTouches[0].clientX - x;
            if(iTarget >= iMax/2){

                if(animate1 !== null)animate1.kill();
                if(animate2 !== null)animate2.kill();
                if(animate3 !== null)animate3.kill();


                let iPath = $($('#svg use').eq(iShow - 1).attr('xlink:href'))[0]
                gsap.TweenLite.to(iPath,1,{
                    fill:'rgba(0,0,0,0)',
                    onUpdate:update
                });
                function update(o) {
                    $(iPath).attr('fill', $(iPath).css('fill'))
                }


                if(iTarget >= iMax){
                    $('.wy_ctr_wrap').removeClass('ready_wrap');
                    $('.wy_ctr_wrap .wy_ctr_cb p').removeClass('ready').addClass('ok').text('连接美好生活 创造美好未来');
                    $('.wy_ctr_wrap .wy_ctr_rb div').removeClass('wy_ctr_rb_1').addClass('wy_ctr_rb_2');
                    $(this).remove();
                } else {
                    gsap.TweenLite.to($(this)[0],0.2,{
                        left: iMax
                    });
                    gsap.TweenLite.delayedCall(.2,()=>{
                        $('.wy_ctr_wrap').removeClass('ready_wrap');
                        $('.wy_ctr_wrap .wy_ctr_cb p').removeClass('ready').addClass('ok').text('连接美好生活 创造美好未来');
                        $('.wy_ctr_wrap .wy_ctr_rb div').removeClass('wy_ctr_rb_1').addClass('wy_ctr_rb_2');
                        $(this).remove();
                    })
                }


            } else {
                gsap.TweenLite.to($(this)[0],.2,{
                    left: 0
                });
            }
            $('.wy_ctr_wrap .wy_ctr_lb').unbind('touchmove touchend');
        });
    });
}
