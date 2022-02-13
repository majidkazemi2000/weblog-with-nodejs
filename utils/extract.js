function extractContent(s) {
   return s.replace(/<[^>]*>?/gm, '').replaceAll('&nbsp;','').replaceAll('&zwnj;',' ').replaceAll('.','');
}
module.exports = {extractContent};