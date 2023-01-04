<html>
 <head><title>动态时间显示</title></head>
  <script type="text/javascript">
    setInterval("aa.innerHTML=new Date().toLocaleString();",1000);
  </script>
<body>
 <label id="aa"></label>
</body>
</html>