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

语言文件采用 JSON 编写，文件名为 `*.json`，每个属性的说明见下：

#### `languageName`

**语言名称** `string`
例：`"English"`、`"English (UK)"`、`"简体中文"`、`"繁體中文"`、`"繁體中文 (香港)"`、`"日本語"`、`"한국어"`

缺失该项时，此语言文件会被排除。
建议遵循 `"LANGUAGE (REGION)"` 的格式

#### `languageCode`

**语言代码** `string | undefined`
例：英语 `"en"`、汉语 `"zh"`、日语 `"ja"`、朝鲜语 `"ko"`

需符合 [BCP 47](https://mdn.org.cn/en-US/docs/Glossary/BCP_47_language_tag) 语法。
当用户尚未设置语言时，会根据用户操作系统的区域查找语言代码匹配的文件。
应用程序的全局默认字体会受到该项影响。

#### `regionCodes`

**区域代码** `string[] | undefined`
例：美国 `["US"]`、中国大陆 `["CN"]`、中国香港 `["HK"]`、日本 `["JP"]`、韩国 `["KR"]`、港澳台地区 `["HK", "MO", "TW"]`

需符合 [BCP 47](https://mdn.org.cn/en-US/docs/Glossary/BCP_47_language_tag) 语法，多个区域代码之间用半角逗号`,`分隔。
当用户尚未设置语言，且找到了多个语言代码匹配的文件时，会查找区域代码匹配的文件。如区域代码匹配的文件也存在多个，则按如下规则排序：
匹配的区域最靠前的优先。若匹配的区域的索引相同，语言文件所含区域代码最少的优先。缺失区域代码的语言文件优先级最低。例如用户操作系统区域代码为 `zh-HK` 时，在多个 `languageCode` 为 `"zh"` 的语言文件当中，它们 `regionCodes` 优先级从高到低按照 `["HK"]`、`["HK", "MO"]`、`["TW", "HK", "MO"]`、`[]`、`undefined` 排序。
应用程序的全局默认字体会受到该项第一个区域代码的影响。

#### `direction`

**文字方向** `"ltr" | "rtl" | undefined`
从左到右`ltr`、从右到左`rtl`

若缺失该项，将根据 `languageCode` 自动判断。

#### `translation`

**翻译** `object`

缺失该项时，此语言文件会被排除。该项的所有键名可参照本应用程序自带的语言文件。对于缺失的键，程序会根据 `regionCodes` 所述的优先级使用其他语言文件的翻译，若仍缺失，使用 `en.json` 文件。
