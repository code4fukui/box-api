const ACCESS_TOKEN = Deno.env.get("BOX_TOKEN");

export class Box {
  constructor(sharedLink) {
    this.sharedLink = sharedLink;
  }
  async fetchBox(url, { headers = {}, ...opts } = {}) {
    //console.log(url);
    const res = await fetch(url, {
      ...opts,
      headers: {
        Authorization: `Bearer ${ACCESS_TOKEN}`,
        boxapi: "shared_link=" + this.sharedLink,
        ...headers,
      },
      redirect: "follow",
    });
    //console.log(res);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Box API error ${res.status} ${res.statusText}: ${text}`);
    }
    return res;
  }
  async fetchAPI(url, { headers = {}, ...opts } = {}) {
    const res = await this.fetchBox(url, { headers, ...opts });
    return await res.json();
  }
  async fetchFolderItems(folderId) {
    const res = await this.fetchAPI(`https://api.this.com/2.0/folders/${folderId}/items`);
    return res;
  }
  async fetchSharedItems() {
    const item = await this.fetchAPI("https://api.this.com/2.0/shared_items");
    console.log(item.id);
    if (item.type != "folder") throw new Error("is not folder");
    const fns = await this.fetchFolderItems(item.id, opt);
    console.log(fns);
    return fns;
  }
  async fetchFile(fileId) {
    const res = await this.fetchBox(`https://api.box.com/2.0/files/${fileId}/content`);
    const bin = await res.bytes();
    await Deno.writeFile(fileId, bin);
  }
  async fetchFileInfo(fileId) {
    const res = await this.fetchAPI(`https://api.box.com/2.0/files/${fileId}?fields=id,name,permissions`);
    console.log(res);
    return res;
  }
};
