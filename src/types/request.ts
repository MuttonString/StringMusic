export interface ShareDataResp {
  /**
   * 自定义的文本标识。
   */
  key: string;
  /**
   * 文本记录的URL，可以通过该URL读取文本数据。
   */
  url: string;
}

export type ParseJpnTextResp = [
  表記: string,
  読みがな: string,
  基本形表記: string,
  品詞: string,
  品詞細分類: string,
  活用型: string,
  活用形: string,
];
