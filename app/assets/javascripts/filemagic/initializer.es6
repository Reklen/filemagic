//= require_tree ./components

$(function(){
  $('.js-component').each(function(i, el){
    var element = $(el);
    var component = React.createElement(eval(element.data('component')), element.data());
    React.render(component, element[0]);
  });
})