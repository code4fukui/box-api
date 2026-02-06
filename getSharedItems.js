import { fetchOrLoad, HTMLParser, CSV, nextTag, prevTag, table2json, table2csv, sleep } from "https://code4fukui.github.io/scrapeutil/scrapeutil.js";
import { parseModule } from "https://code4fukui.github.io/acorn-es/parseModule.js";

const getAssigns = (ast, src) => {
  const res = [];
  const get = (ast) => {
    if (ast.type == "ExpressionStatement" && ast.expression.type == "AssignmentExpression") {
      const value = src.substring(ast.expression.right.start, ast.expression.right.end);
      try {
        res.push({
          name: ast.expression.left.object.name + "." + ast.expression.left.property.name,
          value: JSON.parse(value),
        });
      } catch (e) {
        //console.log(e);
      }
    } else if (Array.isArray(ast.body)) {
      ast.body.forEach(i => get(i));
    }
  };
  get(ast);
  return res;
};

const parseJSON = (html, dataname) => {
  const dom = HTMLParser.parse(html);
  const scripts = dom.querySelectorAll("script");
  for (const scr of scripts) {
    const src = scr.text;
    const ast = parseModule(src);
    //console.log(ast);
    const assigns = getAssigns(ast, src);
    if (!assigns.length) continue;
    //console.log(assigns.map(i => i.name));
    //if (assigns.length) console.log(assigns);
    const p = assigns.find(i => i.name == dataname);
    if (p) {
      return p.value;
    }
  }
  return null;
};

const getCommon = (strarray) => {
  if (strarray.length == 0) return "";
  let s = strarray[0];
  for (let i = 1; i < strarray.length; i++) {
    const s2 = strarray[i];
    for (let j = 0; j < s.length; j++) {
      if (s[j] != s2[j]) {
        console.log(s[j], s2[j])
        s = s2.substring(0, j);
        break;
      }
    }
  }
  return s;
};

export const getSharedItems = async (url) => {
  const html = await fetchOrLoad(url);
  const data = parseJSON(html, "Box.postStreamData");
  //await Deno.writeTextFile("test.json", JSON.stringify(data, null, 2));
  const items = data["/app-api/enduserapp/shared-folder"].items; //.map(i => i.name);
  //console.log(items);

  const makeURL = (item) => url + "/" + item.type + "/" + item.id;
  items.forEach(i => {
    i.url = makeURL(i);
  });
  return items;
};
