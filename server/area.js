function create_area(w, h) {
    let str = `struct tile_info name = { ${w}, ${h}, 40, (uint8_t[]){\n`;
    let m = "/*       ";
    for(let i = 0; i < h; ++i) {
        m += i.toString().padStart(3, " ") + " ";
    }
    m += "*/\n";
    str += m + "\n";
    for(let x = 0; x < w; ++x) {
        str += `/*${x.toString().padStart(4, " ")}*/  `;
        for(let y = 0; y < h; ++y) {
            str += " 0, ";
        }
        str = str.substring(0, str.length - 1);
        str += "\n\n";
    }
    str = str.substring(0, str.length - 1);
    str += `\n${m}  }\n};`;
    console.log(str);
}
