function slug(str) {
    var x = str.trim().toLowerCase();

    var fixed = x.replaceAll("!","").replaceAll("~","").replaceAll("@","").replaceAll("#","").replaceAll("$","").replaceAll("%","").replaceAll("^","").replaceAll("&","")
        .replaceAll("*","").replaceAll("(","").replaceAll(")","").replaceAll("-","").replaceAll("+","")
        .replaceAll("=","").replaceAll("/","").replaceAll("\\","").replaceAll("<","").replaceAll(">","")
        .replaceAll("?","").replaceAll("؟","").replaceAll(".","").replaceAll(",","").replaceAll("،","").replaceAll(":","").replaceAll("”","").replaceAll("’","").replaceAll(";","")
        .replaceAll("|","").replaceAll("`","");

    var t = fixed.trim();
    var final = t.replaceAll(" ","-");
    return final;

}
module.exports = {slug};