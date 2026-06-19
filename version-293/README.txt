项目说明

本压缩包已经生成可直接部署的静态电影网站文件。

文件结构：
- index.html：首页
- categories.html：分类总览页
- rank.html：热播排行榜页
- category/：10 个独立分类页
- movies/：1977 个影片详情页
- assets/css/style.css：站点样式
- assets/js/app.js：菜单、筛选、Hero 切换、播放器初始化脚本
- sitemap.xml：页面地址清单

封面图片说明：
当前上传素材未包含 1.jpg 至 150.jpg。页面已经按影片顺序写好图片引用路径，请把 1.jpg、2.jpg、...、150.jpg 放在本文件夹根目录，与 index.html 同级。

播放源说明：
已从上传的原 JS 文件中提取 150 个 m3u8 播放源，并按影片顺序循环绑定到详情页播放器。
