## 开发指南

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```
### 开发模式 同步更新浏览器扩展代码
```bash
npm run dev:watch
```
### 构建扩展

```bash
npm run build
```

构建完成后，扩展文件将输出到`dist`目录。

## 加载扩展

1. 打开Chrome浏览器，进入扩展管理页面 (`chrome://extensions/`)
2. 开启「开发者模式」
3. 点击「加载已解压的扩展」
4. 选择项目的`dist`目录
