# OneIndex-Serverless
## 说明
本项目是[OneIndex](https://github.com/donwa/oneindex)的阿里云[函数计算](https://help.aliyun.com/document_detail/51733.html)版本,无需购买服务器，即可拥有属于自己的OneDrive云盘
## 为什么选择Serverless?

1. 成本极其低廉，穷人也能用得起。完全实现按使用量付费，费率极低，无固定费用支出。
2. 不需要管理服务器，运行极其稳定
3. 服务质量稳定不受服务器的配置(带宽、内存、硬盘......)影响
4. 极为方便地搭配其他阿里云的云计算产品进行优化，比如使用CDN对静态页面加速，同时降低流量成本

## 基本部署流程
* 注册您的阿里云账号，获取accessKey
* 开通**对象存储**与**函数计算**服务
* 创建一个存储桶和一个云函数，分别上传已编译的React网页和Flask程序部署包，并进行必要的配置，同时注册一个Microsoft Graph应用供Flask使用。
* 在浏览器中访问OneIndex-Serverless并授权您的OneDrive账号
