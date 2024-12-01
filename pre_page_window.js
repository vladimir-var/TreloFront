$(document).ready(function(){
  $(".pre_page_window_button_login").click(function(){
    window.location.href='http://127.0.0.1:5500/reglog.html'
  });
});

$(document).ready(function() {
  function updateCirclePositionAndSize() {
      // Получаем ширину и высоту экрана
      var screenWidth = $(window).width();
      var screenHeight = $(window).height();
      
      // Вычисляем размеры кругов, например, 20% от меньшего измерения (ширины или высоты экрана)
      var circleSize = Math.min(screenWidth, screenHeight) * 0.2;
      
      // Устанавливаем размеры и позиции для первого круга (#first)
      var firstCircleSize = circleSize * 5; // Примерно в два раза больше первого круга
      var firstCircleTop = screenHeight * 0.00001; // Примерное положение от верхней границы
      var firstCircleLeft = screenWidth * 0.00001; // Примерное положение от левой границы
      
      $('.pre_page_window_img_container#first').css({
          'width': firstCircleSize + 'px',
          'height': firstCircleSize + 'px',
          'top': firstCircleTop + 'px',
          'left': firstCircleLeft + 'px'
      });
      
      // Устанавливаем размеры и позиции для второго круга (#seccond)
      var secondCircleSize = circleSize *3;
      var secondCircleRight = screenWidth * 0.00001; // Примерное положение от правой границы
      var secondCircleBottom = screenHeight * 0.00001; // Примерное положение от нижней границы
      
      $('.pre_page_window_img_container#seccond').css({
          'width': secondCircleSize + 'px',
          'height': secondCircleSize + 'px',
          'right': secondCircleRight + 'px',
          'bottom': secondCircleBottom + 'px'
      });

  }
  
  // Вызываем функцию для первоначальной настройки размеров и позиций кругов
  updateCirclePositionAndSize();
  
  // При изменении размеров окна браузера вызываем функцию заново
  $(window).resize(function() {
      updateCirclePositionAndSize();
  });
});