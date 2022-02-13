function convertNumbers(str) {
    const final = str.replaceAll('1','۱').replaceAll('2','۲')
        .replaceAll('3','۳').replaceAll('4','۴').replaceAll('5','۵').replaceAll('6','۶').replaceAll('7','۷')
        .replaceAll('8','۸').replaceAll('9','۹').replaceAll('0','۰');
    return final;
}
module.exports = {convertNumbers};