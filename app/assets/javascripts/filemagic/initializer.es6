//= require_tree ./components

$(function(){
  $('.filemagic-container').each(function(i, el){
    var element = $(el);
    var component = React.createElement(eval(element.data('component')), element.data());
    ReactDOM.render(component, element[0]);
  });
})