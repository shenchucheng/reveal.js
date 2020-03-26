# **主题**：测试 
## **作者**：XXX
## **时间**：XXXX.XX.XX
Note:
    This will only display in the notes window.



## **PICTURES**
<img src="https://cn.bing.com/th?id=OHR.EquinoxAngkor_ZH-CN1157590532_1920x1080.jpg&rf=LaDigue_1920x1080.jpg&pid=hp" alt="pic1">



| Item     | Value | Qty   |
| :------- | ----: | :---: |
| Computer | $1600 |  5    |
| Phone    | $12   |  12   |
| Pipe     | $1    |  234  |



# **正则**
```
# 删除所有.png结尾的文件，即删除png格式的图片
rm *\.png

# 递归查找当前目录下的所有.listing文件，find改成rm，即删除由scp复制生成的.listing文件
find ./**/.listing
```
----------
# **wget**
```
wget -r -np -nH -R index.html http://localhost
wget -nH -m --ftp-user=your_username --ftp-password=your_password ftp://your_ftp_host/*

```

----------
# **scp**
```
scp .bashrc cheng@ipv6.phichem.xyz:/home/cheng/
scp cheng@ipv6.phichem.xyz:/home/cheng/ ./
```

----------

# **ps**
```
ps -ef |grep hello |awk '{print $2}'|xargs kill -9
```
[ps、grep和kill联合使用杀掉进程](https://www.cnblogs.com/shanheyongmu/p/6001098.html)

