class StringUtil {

  wrap(text, resultLength) {
    if (resultLength <= 0) return '';

    const wrapText = '....';

    if (text === null || text === undefined
        || text.length <= (resultLength - wrapText.length)) { return text; }

    const showTextLength = parseInt((resultLength - wrapText.length) / 2);
    return ''.concat(text.substr(0, showTextLength)).concat(wrapText).concat(text.substr((text.length - showTextLength), showTextLength));
  }
}

export default new StringUtil();
