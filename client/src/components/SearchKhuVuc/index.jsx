import React, { useEffect, useState } from "react";
import khuvucApi from "../../api/khuvucApi";
import "./searchkhuvuc.css";

function SearchKhuVuc({ onSearch }) {
  const [tree, setTree] = useState([]); // full tree
  const [levels, setLevels] = useState([]); // array of options per level (always render all)
  const [selectedIds, setSelectedIds] = useState([]); // selected id per level
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTree();
  }, []);

  const getMaxDepth = (nodes) => {
    let max = 0;
    const dfs = (list, depth) => {
      if (!list || !list.length) return;
      max = Math.max(max, depth);
      for (const n of list) {
        if (n.children && n.children.length) dfs(n.children, depth + 1);
      }
    };
    dfs(nodes, 1);
    return max;
  };

  const loadTree = async () => {
    setLoading(true);
    try {
      const res = await khuvucApi.getTree();
      const raw = Array.isArray(res.data)
        ? res.data
        : Array.isArray(res.data?.data)
        ? res.data.data
        : [];
      setTree(raw);

      const depth = getMaxDepth(raw) || 1;
      const initLevels = Array.from({ length: depth }, (_, i) =>
        i === 0 ? raw : []
      );
      const initSelected = Array.from({ length: depth }, () => "");
      setLevels(initLevels);
      setSelectedIds(initSelected);
    } catch (err) {
      console.error("Lỗi lấy khu vực:", err?.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (levelIndex, id) => {
    const newSelected = selectedIds.slice();
    newSelected[levelIndex] = id || "";
    // clear deeper selections
    for (let i = levelIndex + 1; i < newSelected.length; i++)
      newSelected[i] = "";
    setSelectedIds(newSelected);

    // rebuild levels from tree using newSelected
    const newLevels = levels.slice();
    let nodeList = tree;
    for (let lvl = 0; lvl < newLevels.length; lvl++) {
      // if lvl === 0, nodeList already correct (tree)
      if (lvl > 0) {
        const prevId = newSelected[lvl - 1];
        if (!prevId) {
          newLevels[lvl] = []; // no parent selected => empty options
          nodeList = [];
          continue;
        }
        const parent = nodeList.find(
          (n) => (n.KhuVucID ?? n.id) === Number(prevId)
        );
        nodeList = parent?.children ?? [];
        newLevels[lvl] = nodeList;
      }
    }
    setLevels(newLevels);
  };

  const handleSearch = () => {
    const lastSelected = selectedIds
      .slice()
      .reverse()
      .find((id) => id);

    // Tìm node được chọn cuối cùng để lấy tên
    let selectedNode = null;
    let nodeList = tree;
    for (let i = 0; i < selectedIds.length; i++) {
      const id = selectedIds[i];
      if (!id) break;
      selectedNode = nodeList.find((n) => (n.KhuVucID ?? n.id) === Number(id));
      if (!selectedNode) break;
      nodeList = selectedNode?.children ?? [];
    }

    const selectedName = selectedNode
      ? selectedNode.TenKhuVuc ?? selectedNode.name
      : "";

    const payload = {
      KhuVucID: lastSelected ? Number(lastSelected) : null,
      path: selectedIds.filter(Boolean).map(Number),
      tenKhuVuc: selectedName, // ✅ Thêm tên khu vực
    };

    console.log("[SearchKhuVuc] payload:", payload); // debug

    if (typeof onSearch === "function") {
      onSearch(payload);
    } else {
      window.dispatchEvent(
        new CustomEvent("khuvucSearch", { detail: payload })
      );
      console.log("Search khu vực:", payload);
    }
  };

  return (
    <div className="search-khuvuc">
      <div className="sk-row">
        {loading && <div className="sk-loading">Đang tải khu vực...</div>}

        {!loading &&
          levels.map((opts, idx) => (
            <select
              key={idx}
              className="sk-select"
              value={selectedIds[idx] ?? ""}
              onChange={(e) => handleSelect(idx, e.target.value)}
              disabled={
                idx !== 0 && !selectedIds[idx - 1]
              } /* disabled until parent chosen */
            >
              <option value="">
                {idx === 0 ? "Chọn khu vực " : "Chọn..."}
              </option>
              {opts && opts.length
                ? opts.map((opt) => {
                    const id = opt.KhuVucID ?? opt.id;
                    const label = opt.TenKhuVuc ?? opt.name;
                    return (
                      <option key={id} value={id}>
                        {label}
                      </option>
                    );
                  })
                : null}
            </select>
          ))}

        <button className="sk-btn" onClick={handleSearch}>
          Tìm
        </button>
      </div>
    </div>
  );
}

export default SearchKhuVuc;
