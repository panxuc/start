function setBingSearch() {
  var bingType = document.querySelector('input[name="bingType"]:checked').value;
  var bingSearchForm = document.getElementById('bingSearchForm');
  if (bingType == 'en') {
    bingSearchForm.action = 'https://www.bing.com/search';
  } else if (bingType == 'cn') {
    bingSearchForm.action = 'https://cn.bing.com/search';
  }
}