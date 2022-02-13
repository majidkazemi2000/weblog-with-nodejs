function convertEnglish(str) {
    const final = str.replaceAll('۱','1').replaceAll('۲','2')
        .replaceAll('۳','3').replaceAll('۴','4').replaceAll('۵','5').replaceAll('۶','6').replaceAll('۷','7')
        .replaceAll('۸','8').replaceAll('۹','9').replaceAll('۰','0');
    return final;
}
module.exports = { convertEnglish };