## 登录 npm
```
# 已有用户登录
npm login --registry=https://registry.npmjs.org

# 验证登录状态
npm whoami
```

## 标准发布命令
```
npm publish --access public --registry=https://registry.npmjs.org
```

## 检查发布文件
```
npm pack --dry-run
```