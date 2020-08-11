/**
 *@fileOverview index
 *@Author wangyan15@leju.com
 *@Date 2020/6/3 上午11:28
 *@template
 */

require('./common/zepto.js');
require('./common/resize.js');
$(function(){
    let animate1,animate2,animate3;
    require('./js/draw.js')();
    const Drag = require('./js/drag.js');
    new Drag();
});