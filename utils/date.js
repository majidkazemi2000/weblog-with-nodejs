function convertDate(date) {
    const months = {'1':'فروردین','2':'اردیبهشت','3':'خرداد','4':'تیر','5':'مرداد','6':'شهریور','7':'مهر','8':'آبان','9':'آذر','10':'دی','11':'بهمن','12':'اسفند'};
    const arr = date.split(" ");
    const da = arr[0].split("/");
    const str = `${da[2]} ${months[da[1]]} ${da[0]} ساعت  ${arr[1]}`;
    const final = str.replaceAll('1','۱').replaceAll('2','۲')
        .replaceAll('3','۳').replaceAll('4','۴').replaceAll('5','۵').replaceAll('6','۶').replaceAll('7','۷')
        .replaceAll('8','۸').replaceAll('9','۹').replaceAll('0','۰');
    return final;
}
module.exports= {convertDate};