# String 音乐

[English](README.md) | 中文

一个现代风格的音乐播放器，基于 [Tauri](https://tauri.app/start/)，支持在线音乐。可添加自定义的在线音乐源。

## 特性

todo

## 安装

从 [Releases](https://github.com/MuttonString/string-music/releases) 下载

| 操作系统 | 架构                  | 文件          |
| -------- | --------------------- | ------------- |
| Windows  | x64 / ARM64           | `.exe`        |
| macOS    | Apple Silicon / Intel | `.dmg`        |
| Linux    | x64 / ARM64           | `.deb` `.rpm` |

## 开发

开发依赖：<https://tauri.app/start/prerequisites/>
应将 Pull Request 提交到 **dev** 分支。

将路径切换到项目目录下。
首次需运行：

```bash
npm i
```

然后运行：

```bash
npm run tauri dev
```

## 规范

### 语言文件

语言文件采用 JSON 编写，文件类型为 `*.json`，文件名需符合 [BCP 47](https://mdn.org.cn/en-US/docs/Glossary/BCP_47_language_tag) 语法。
完整的文件名应当是 `语言子标签-文字子标签-地区子标签.json`，其中，文字子标签和地区子标签可以省略。例如这些的文件名是符合规范的：`zh.json` `zh-CN.json` `zh-Hans.json` `zh-Hans-CN.json`。虽然不符合规范的 JSON 文件也可以被本应用程序正常使用，但语言设置为“自动”时，程序无法根据操作系统的语言匹配到该文件。
当语言设置为“自动”时，程序会按照以下顺序匹配语言文件（未获取到某子标签则会跳过该步）：
`系统语言子标签-系统文字子标签-系统地区子标签.json`→`系统语言子标签-系统地区子标签.json`→`系统语言子标签-系统文字子标签.json`→`系统语言子标签.json`→`en.json`
