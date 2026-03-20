(function (global) {
  "use strict";

  const SVG_NS = "http://www.w3.org/2000/svg";

  const LAYOUT = {
    width: 960,
    height: 580,
    top: 72,
    sidePadding: 60,
    levelGap: 124,
    nodeRadius: 38
  };

  function getVisualMetrics(nodeCount, depthCount) {
    let desiredRadius;
    if (nodeCount <= 1) {
      desiredRadius = 78;
    } else if (nodeCount <= 3) {
      desiredRadius = 68;
    } else if (nodeCount <= 7) {
      desiredRadius = 56;
    } else if (nodeCount <= 12) {
      desiredRadius = 46;
    } else {
      desiredRadius = LAYOUT.nodeRadius;
    }

    const maxRadiusFromWidth = ((LAYOUT.width - (LAYOUT.sidePadding * 2)) / (nodeCount + 1)) * 0.34;
    const maxRadiusFromHeight = depthCount > 0
      ? ((LAYOUT.height - 44) / Math.max(depthCount, 1)) * 0.34
      : desiredRadius;
    const nodeRadius = Math.max(
      38,
      Math.min(desiredRadius, maxRadiusFromWidth, maxRadiusFromHeight)
    );

    return {
      nodeRadius: nodeRadius,
      keyFontSize: Math.round(nodeRadius * 0.52),
      metaFontSize: Math.max(12, Math.round(nodeRadius * 0.26)),
      badgeOffset: nodeRadius + 40,
      metaOffset: nodeRadius + 20
    };
  }

  const CODE_LINES = [
    "function height(node) {",
    "  return node ? node.height : 0;",
    "}",
    "function getBalance(node) {",
    "  return node",
    "    ? height(node.left) - height(node.right)",
    "    : 0;",
    "}",
    "function updateHeight(node) {",
    "  node.height = 1 + Math.max(",
    "    height(node.left),",
    "    height(node.right)",
    "  );",
    "}",
    "function rightRotate(y) {",
    "  const x = y.left;",
    "  const T2 = x.right;",
    "  x.right = y;",
    "  y.left = T2;",
    "  updateHeight(y);",
    "  updateHeight(x);",
    "  return x;",
    "}",
    "function leftRotate(x) {",
    "  const y = x.right;",
    "  const T2 = y.left;",
    "  y.left = x;",
    "  x.right = T2;",
    "  updateHeight(x);",
    "  updateHeight(y);",
    "  return y;",
    "}",
    "function insert(node, key) {",
    "  if (!node) return new Node(key);",
    "  if (key < node.key)",
    "    node.left = insert(node.left, key);",
    "  else if (key > node.key)",
    "    node.right = insert(node.right, key);",
    "  else",
    "    return node;",
    "  updateHeight(node);",
    "  const balance = getBalance(node);",
    "  if (balance > 1 && key < node.left.key)",
    "    return rightRotate(node);",
    "  if (balance < -1 && key > node.right.key)",
    "    return leftRotate(node);",
    "  if (balance > 1 && key > node.left.key) {",
    "    node.left = leftRotate(node.left);",
    "    return rightRotate(node);",
    "  }",
    "  if (balance < -1 && key < node.right.key) {",
    "    node.right = rightRotate(node.right);",
    "    return leftRotate(node);",
    "  }",
    "  return node;",
    "}",
    "function deleteNode(node, key) {",
    "  if (!node) return node;",
    "  if (key < node.key)",
    "    node.left = deleteNode(node.left, key);",
    "  else if (key > node.key)",
    "    node.right = deleteNode(node.right, key);",
    "  else if (!node.left || !node.right)",
    "    node = node.left || node.right;",
    "  else {",
    "    const temp = minValueNode(node.right);",
    "    node.key = temp.key;",
    "    node.right = deleteNode(node.right, temp.key);",
    "  }",
    "  if (!node) return node;",
    "  updateHeight(node);",
    "  const balance = getBalance(node);",
    "  if (balance > 1 && getBalance(node.left) >= 0)",
    "    return rightRotate(node);",
    "  if (balance > 1 && getBalance(node.left) < 0) {",
    "    node.left = leftRotate(node.left);",
    "    return rightRotate(node);",
    "  }",
    "  if (balance < -1 && getBalance(node.right) <= 0)",
    "    return leftRotate(node);",
    "  if (balance < -1 && getBalance(node.right) > 0) {",
    "    node.right = rightRotate(node.right);",
    "    return leftRotate(node);",
    "  }",
    "  return node;",
    "}"
  ];

  const LINE = {
    ROTATE_RIGHT: [15, 16, 17, 18, 19, 20, 21, 22],
    ROTATE_LEFT: [24, 25, 26, 27, 28, 29, 30, 31],
    INSERT_BASE: [34],
    INSERT_LEFT: [35, 36],
    INSERT_RIGHT: [37, 38],
    INSERT_DUP: [39, 40],
    INSERT_HEIGHT: [41],
    INSERT_BALANCE: [42],
    INSERT_LL: [43, 44],
    INSERT_RR: [45, 46],
    INSERT_LR: [47, 48, 49],
    INSERT_RL: [51, 52, 53],
    DELETE_NULL: [58],
    DELETE_LEFT: [59, 60],
    DELETE_RIGHT: [61, 62],
    DELETE_ONE_CHILD: [63, 64],
    DELETE_SUCCESSOR: [65, 66, 67, 68],
    DELETE_RETURN_EMPTY: [70],
    DELETE_HEIGHT: [71],
    DELETE_BALANCE: [72],
    DELETE_LL: [73, 74],
    DELETE_LR: [75, 76, 77],
    DELETE_RR: [79, 80],
    DELETE_RL: [81, 82, 83]
  };

  const SCENARIOS = [
    {
      id: "insert-ll",
      title: "Insert LL",
      expectedCase: "LL",
      summary: "Cây ban đầu có sẵn, chèn thêm 1 node để phát sinh lệch trái-trái.",
      initialValues: [30, 20],
      operations: [
        { type: "insert", value: 10 }
      ]
    },
    {
      id: "insert-rr",
      title: "Insert RR",
      expectedCase: "RR",
      summary: "Cây ban đầu có sẵn, chèn thêm 1 node để phát sinh lệch phải-phải.",
      initialValues: [10, 20],
      operations: [
        { type: "insert", value: 30 }
      ]
    },
    {
      id: "insert-lr",
      title: "Insert LR",
      expectedCase: "LR",
      summary: "Cây ban đầu có sẵn, chèn node vào nhánh phải của cây con trái.",
      initialValues: [30, 10],
      operations: [
        { type: "insert", value: 20 }
      ]
    },
    {
      id: "insert-rl",
      title: "Insert RL",
      expectedCase: "RL",
      summary: "Cây ban đầu có sẵn, chèn node vào nhánh trái của cây con phải.",
      initialValues: [10, 30],
      operations: [
        { type: "insert", value: 20 }
      ]
    },
    {
      id: "delete-left-rebalance",
      title: "Delete gây quay phải",
      expectedCase: "Delete -> LL",
      summary: "Cây ban đầu có sẵn, xóa 1 node để gây lệch trái rồi quay phải.",
      initialValues: [21, 17, 22, 12, 18, 23, 11, 13, 14],
      operations: [
        { type: "delete", value: 22 }
      ]
    },
    {
      id: "delete-right-rebalance",
      title: "Delete gây quay trái",
      expectedCase: "Delete -> RR",
      summary: "Cây ban đầu có sẵn, xóa 1 node để gây lệch phải rồi quay trái.",
      initialValues: [31, 35, 30, 40, 34, 29, 41, 39, 38],
      operations: [
        { type: "delete", value: 30 }
      ]
    }
  ];

  function createNode(key) {
    return { key: key, height: 1, left: null, right: null };
  }

  function height(node) {
    return node ? node.height : 0;
  }

  function getBalance(node) {
    return node ? height(node.left) - height(node.right) : 0;
  }

  function updateHeight(node) {
    if (node) {
      node.height = 1 + Math.max(height(node.left), height(node.right));
    }
  }

  function rightRotate(y) {
    const x = y.left;
    const tempBranch = x.right;

    x.right = y;
    y.left = tempBranch;

    updateHeight(y);
    updateHeight(x);

    return x;
  }

  function leftRotate(x) {
    const y = x.right;
    const tempBranch = y.left;

    y.left = x;
    x.right = tempBranch;

    updateHeight(x);
    updateHeight(y);

    return y;
  }

  function minValueNode(node) {
    let current = node;
    while (current && current.left) {
      current = current.left;
    }
    return current;
  }

  function insertPlain(node, key) {
    if (!node) {
      return createNode(key);
    }

    if (key < node.key) {
      node.left = insertPlain(node.left, key);
    } else if (key > node.key) {
      node.right = insertPlain(node.right, key);
    } else {
      return node;
    }

    updateHeight(node);
    const balance = getBalance(node);

    if (balance > 1 && key < node.left.key) {
      return rightRotate(node);
    }
    if (balance < -1 && key > node.right.key) {
      return leftRotate(node);
    }
    if (balance > 1 && key > node.left.key) {
      node.left = leftRotate(node.left);
      return rightRotate(node);
    }
    if (balance < -1 && key < node.right.key) {
      node.right = rightRotate(node.right);
      return leftRotate(node);
    }

    return node;
  }

  function buildInitialTree(values) {
    return (values || []).reduce(function (root, value) {
      return insertPlain(root, value);
    }, null);
  }

  function compactSteps(steps) {
    if (!steps.length) {
      return steps;
    }

    const kept = steps.filter(function (step, index) {
      if (index === 0 || index === steps.length - 1) {
        return true;
      }

      if (step.rotation) {
        return true;
      }

      if (step.type === "insert" || step.type === "delete") {
        return true;
      }

      if (step.type === "compare") {
        return step.message.indexOf("Bắt đầu thao tác") === 0
          || step.message.indexOf("có 2 con") >= 0;
      }

      if (step.type === "rebalance_check") {
        return step.highlights
          && ["LL", "RR", "LR", "RL", "Mất cân bằng"].indexOf(step.highlights.caseLabel) >= 0;
      }

      return false;
    });

    return kept.map(function (step, index) {
      return Object.assign({}, step, { id: index });
    });
  }

  function cloneTree(node) {
    if (!node) {
      return null;
    }
    return {
      key: node.key,
      height: node.height,
      balance: getBalance(node),
      left: cloneTree(node.left),
      right: cloneTree(node.right)
    };
  }

  function countNodes(node) {
    if (!node) {
      return 0;
    }
    return 1 + countNodes(node.left) + countNodes(node.right);
  }

  function replaceAtPath(state, path, subtree) {
    if (path.length === 0) {
      state.root = subtree;
      return;
    }
    const last = path[path.length - 1];
    last.node[last.dir] = subtree;
  }

  function normalizeHighlights(highlights) {
    const safe = highlights || {};
    return {
      focusKeys: safe.focusKeys ? safe.focusKeys.slice() : [],
      insertedKeys: safe.insertedKeys ? safe.insertedKeys.slice() : [],
      deletedKeys: safe.deletedKeys ? safe.deletedKeys.slice() : [],
      accentKeys: safe.accentKeys ? safe.accentKeys.slice() : [],
      caseLabel: safe.caseLabel || ""
    };
  }

  function createRecorder(state, scenario) {
    const steps = [];

    function record(meta) {
      steps.push({
        id: steps.length,
        scenarioId: scenario.id,
        scenarioTitle: scenario.title,
        type: meta.type,
        message: meta.message,
        activeLines: (meta.activeLines || []).slice(),
        highlights: normalizeHighlights(meta.highlights),
        rotation: meta.rotation || null,
        treeSnapshot: cloneTree(state.root)
      });
    }

    return { steps: steps, record: record };
  }

  function insertTracked(node, key, state, record, path) {
    if (!node) {
      const newNode = createNode(key);
      replaceAtPath(state, path, newNode);
      record({
        type: "insert",
        message: "Chèn " + key + " vào vị trí trống.",
        activeLines: LINE.INSERT_BASE,
        highlights: { focusKeys: [key], insertedKeys: [key] }
      });
      return newNode;
    }

    if (key < node.key) {
      record({
        type: "compare",
        message: "So sánh " + key + " < " + node.key + ", đi sang trái.",
        activeLines: LINE.INSERT_LEFT,
        highlights: { focusKeys: [node.key], insertedKeys: [key] }
      });
      node.left = insertTracked(node.left, key, state, record, path.concat({ node: node, dir: "left" }));
    } else if (key > node.key) {
      record({
        type: "compare",
        message: "So sánh " + key + " > " + node.key + ", đi sang phải.",
        activeLines: LINE.INSERT_RIGHT,
        highlights: { focusKeys: [node.key], insertedKeys: [key] }
      });
      node.right = insertTracked(node.right, key, state, record, path.concat({ node: node, dir: "right" }));
    } else {
      record({
        type: "compare",
        message: "Bỏ qua " + key + " vì khóa đã tồn tại.",
        activeLines: LINE.INSERT_DUP,
        highlights: { focusKeys: [node.key] }
      });
      return node;
    }

    updateHeight(node);
    record({
      type: "update_height",
      message: "Cập nhật chiều cao node " + node.key + " = " + node.height + ".",
      activeLines: LINE.INSERT_HEIGHT,
      highlights: { focusKeys: [node.key] }
    });

    const balance = getBalance(node);
    record({
      type: "rebalance_check",
      message: "Kiểm tra cân bằng tại " + node.key + ": bf = " + balance + ".",
      activeLines: LINE.INSERT_BALANCE,
      highlights: {
        focusKeys: [node.key],
        caseLabel: Math.abs(balance) > 1 ? "Mất cân bằng" : "Ổn định"
      }
    });

    if (balance > 1 && key < node.left.key) {
      record({
        type: "rebalance_check",
        message: "Phát hiện case LL tại node " + node.key + ".",
        activeLines: LINE.INSERT_LL,
        highlights: {
          focusKeys: [node.key],
          accentKeys: [node.left.key],
          caseLabel: "LL"
        }
      });

      const pivotKey = node.key;
      const newRoot = rightRotate(node);
      replaceAtPath(state, path, newRoot);

      record({
        type: "rotate_right",
        message: "Quay phải tại " + pivotKey + ", node " + newRoot.key + " lên làm gốc nhánh.",
        activeLines: LINE.ROTATE_RIGHT,
        highlights: {
          focusKeys: [newRoot.key],
          accentKeys: [pivotKey],
          caseLabel: "LL"
        },
        rotation: {
          direction: "right",
          pivot: pivotKey,
          newRoot: newRoot.key,
          caseLabel: "LL"
        }
      });
      return newRoot;
    }

    if (balance < -1 && key > node.right.key) {
      record({
        type: "rebalance_check",
        message: "Phát hiện case RR tại node " + node.key + ".",
        activeLines: LINE.INSERT_RR,
        highlights: {
          focusKeys: [node.key],
          accentKeys: [node.right.key],
          caseLabel: "RR"
        }
      });

      const pivotKey = node.key;
      const newRoot = leftRotate(node);
      replaceAtPath(state, path, newRoot);

      record({
        type: "rotate_left",
        message: "Quay trái tại " + pivotKey + ", node " + newRoot.key + " lên làm gốc nhánh.",
        activeLines: LINE.ROTATE_LEFT,
        highlights: {
          focusKeys: [newRoot.key],
          accentKeys: [pivotKey],
          caseLabel: "RR"
        },
        rotation: {
          direction: "left",
          pivot: pivotKey,
          newRoot: newRoot.key,
          caseLabel: "RR"
        }
      });
      return newRoot;
    }

    if (balance > 1 && key > node.left.key) {
      record({
        type: "rebalance_check",
        message: "Phát hiện case LR tại node " + node.key + ".",
        activeLines: LINE.INSERT_LR,
        highlights: {
          focusKeys: [node.key],
          accentKeys: [node.left.key],
          caseLabel: "LR"
        }
      });

      const leftPivot = node.left.key;
      node.left = leftRotate(node.left);
      record({
        type: "rotate_left",
        message: "Quay trái tại " + leftPivot + " để đổi LR thành LL.",
        activeLines: LINE.ROTATE_LEFT,
        highlights: {
          focusKeys: [node.left.key],
          accentKeys: [leftPivot, node.key],
          caseLabel: "LR"
        },
        rotation: {
          direction: "left",
          pivot: leftPivot,
          newRoot: node.left.key,
          caseLabel: "LR"
        }
      });

      const pivotKey = node.key;
      const newRoot = rightRotate(node);
      replaceAtPath(state, path, newRoot);
      record({
        type: "rotate_right",
        message: "Quay phải tại " + pivotKey + " để hoàn tất cân bằng LR.",
        activeLines: LINE.ROTATE_RIGHT,
        highlights: {
          focusKeys: [newRoot.key],
          accentKeys: [pivotKey],
          caseLabel: "LR"
        },
        rotation: {
          direction: "right",
          pivot: pivotKey,
          newRoot: newRoot.key,
          caseLabel: "LR"
        }
      });
      return newRoot;
    }

    if (balance < -1 && key < node.right.key) {
      record({
        type: "rebalance_check",
        message: "Phát hiện case RL tại node " + node.key + ".",
        activeLines: LINE.INSERT_RL,
        highlights: {
          focusKeys: [node.key],
          accentKeys: [node.right.key],
          caseLabel: "RL"
        }
      });

      const rightPivot = node.right.key;
      node.right = rightRotate(node.right);
      record({
        type: "rotate_right",
        message: "Quay phải tại " + rightPivot + " để đổi RL thành RR.",
        activeLines: LINE.ROTATE_RIGHT,
        highlights: {
          focusKeys: [node.right.key],
          accentKeys: [rightPivot, node.key],
          caseLabel: "RL"
        },
        rotation: {
          direction: "right",
          pivot: rightPivot,
          newRoot: node.right.key,
          caseLabel: "RL"
        }
      });

      const pivotKey = node.key;
      const newRoot = leftRotate(node);
      replaceAtPath(state, path, newRoot);
      record({
        type: "rotate_left",
        message: "Quay trái tại " + pivotKey + " để hoàn tất cân bằng RL.",
        activeLines: LINE.ROTATE_LEFT,
        highlights: {
          focusKeys: [newRoot.key],
          accentKeys: [pivotKey],
          caseLabel: "RL"
        },
        rotation: {
          direction: "left",
          pivot: pivotKey,
          newRoot: newRoot.key,
          caseLabel: "RL"
        }
      });
      return newRoot;
    }

    replaceAtPath(state, path, node);
    return node;
  }

  function deleteTracked(node, key, state, record, path) {
    if (!node) {
      record({
        type: "delete",
        message: "Không tìm thấy khóa " + key + " trong cây.",
        activeLines: LINE.DELETE_NULL,
        highlights: { deletedKeys: [key] }
      });
      return node;
    }

    if (key < node.key) {
      record({
        type: "compare",
        message: "So sánh " + key + " < " + node.key + ", đi sang trái để xóa.",
        activeLines: LINE.DELETE_LEFT,
        highlights: { focusKeys: [node.key], deletedKeys: [key] }
      });
      node.left = deleteTracked(node.left, key, state, record, path.concat({ node: node, dir: "left" }));
    } else if (key > node.key) {
      record({
        type: "compare",
        message: "So sánh " + key + " > " + node.key + ", đi sang phải để xóa.",
        activeLines: LINE.DELETE_RIGHT,
        highlights: { focusKeys: [node.key], deletedKeys: [key] }
      });
      node.right = deleteTracked(node.right, key, state, record, path.concat({ node: node, dir: "right" }));
    } else {
      record({
        type: "delete",
        message: "Đã tìm thấy node " + key + " cần xóa.",
        activeLines: LINE.DELETE_ONE_CHILD,
        highlights: { focusKeys: [node.key], deletedKeys: [key] }
      });

      if (!node.left || !node.right) {
        const replacement = node.left || node.right;
        replaceAtPath(state, path, replacement);
        record({
          type: "delete",
          message: replacement
            ? "Xóa " + key + " và đưa node " + replacement.key + " lên thay thế."
            : "Xóa node lá " + key + ".",
          activeLines: LINE.DELETE_ONE_CHILD,
          highlights: {
            focusKeys: replacement ? [replacement.key] : [],
            deletedKeys: [key]
          }
        });
        return replacement;
      }

      const successor = minValueNode(node.right);
      const successorKey = successor.key;
      record({
        type: "compare",
        message: "Node " + key + " có 2 con, chọn kế nhiệm " + successorKey + ".",
        activeLines: LINE.DELETE_SUCCESSOR,
        highlights: {
          focusKeys: [node.key],
          accentKeys: [successorKey],
          caseLabel: "Successor"
        }
      });
      node.key = successorKey;
      node.right = deleteTracked(node.right, successorKey, state, record, path.concat({ node: node, dir: "right" }));
      record({
        type: "delete",
        message: "Thay khóa " + key + " bằng " + successorKey + " rồi xóa bản sao ở cây con phải.",
        activeLines: LINE.DELETE_SUCCESSOR,
        highlights: { focusKeys: [node.key], deletedKeys: [key] }
      });
    }

    if (!node) {
      record({
        type: "delete",
        message: "Nhánh hiện tại trở thành rỗng sau khi xóa.",
        activeLines: LINE.DELETE_RETURN_EMPTY,
        highlights: {}
      });
      return node;
    }

    updateHeight(node);
    record({
      type: "update_height",
      message: "Cập nhật chiều cao node " + node.key + " = " + node.height + " sau khi xóa.",
      activeLines: LINE.DELETE_HEIGHT,
      highlights: { focusKeys: [node.key] }
    });

    const balance = getBalance(node);
    record({
      type: "rebalance_check",
      message: "Kiểm tra cân bằng sau xóa tại " + node.key + ": bf = " + balance + ".",
      activeLines: LINE.DELETE_BALANCE,
      highlights: {
        focusKeys: [node.key],
        caseLabel: Math.abs(balance) > 1 ? "Mất cân bằng" : "Ổn định"
      }
    });

    if (balance > 1 && getBalance(node.left) >= 0) {
      record({
        type: "rebalance_check",
        message: "Sau khi xóa xuất hiện lệch trái-trái tại " + node.key + ".",
        activeLines: LINE.DELETE_LL,
        highlights: {
          focusKeys: [node.key],
          accentKeys: [node.left.key],
          caseLabel: "LL"
        }
      });
      const pivotKey = node.key;
      const newRoot = rightRotate(node);
      replaceAtPath(state, path, newRoot);
      record({
        type: "rotate_right",
        message: "Quay phải tại " + pivotKey + " để cân bằng lại sau xóa.",
        activeLines: LINE.ROTATE_RIGHT,
        highlights: {
          focusKeys: [newRoot.key],
          accentKeys: [pivotKey],
          caseLabel: "LL"
        },
        rotation: {
          direction: "right",
          pivot: pivotKey,
          newRoot: newRoot.key,
          caseLabel: "LL"
        }
      });
      return newRoot;
    }

    if (balance > 1 && getBalance(node.left) < 0) {
      record({
        type: "rebalance_check",
        message: "Sau khi xóa xuất hiện lệch trái-phải tại " + node.key + ".",
        activeLines: LINE.DELETE_LR,
        highlights: {
          focusKeys: [node.key],
          accentKeys: [node.left.key],
          caseLabel: "LR"
        }
      });
      const leftPivot = node.left.key;
      node.left = leftRotate(node.left);
      record({
        type: "rotate_left",
        message: "Quay trái tại " + leftPivot + " để đổi LR thành LL.",
        activeLines: LINE.ROTATE_LEFT,
        highlights: {
          focusKeys: [node.left.key],
          accentKeys: [node.key, leftPivot],
          caseLabel: "LR"
        },
        rotation: {
          direction: "left",
          pivot: leftPivot,
          newRoot: node.left.key,
          caseLabel: "LR"
        }
      });
      const pivotKey = node.key;
      const newRoot = rightRotate(node);
      replaceAtPath(state, path, newRoot);
      record({
        type: "rotate_right",
        message: "Quay phải tại " + pivotKey + " để hoàn tất rebalance LR sau xóa.",
        activeLines: LINE.ROTATE_RIGHT,
        highlights: {
          focusKeys: [newRoot.key],
          accentKeys: [pivotKey],
          caseLabel: "LR"
        },
        rotation: {
          direction: "right",
          pivot: pivotKey,
          newRoot: newRoot.key,
          caseLabel: "LR"
        }
      });
      return newRoot;
    }

    if (balance < -1 && getBalance(node.right) <= 0) {
      record({
        type: "rebalance_check",
        message: "Sau khi xóa xuất hiện lệch phải-phải tại " + node.key + ".",
        activeLines: LINE.DELETE_RR,
        highlights: {
          focusKeys: [node.key],
          accentKeys: [node.right.key],
          caseLabel: "RR"
        }
      });
      const pivotKey = node.key;
      const newRoot = leftRotate(node);
      replaceAtPath(state, path, newRoot);
      record({
        type: "rotate_left",
        message: "Quay trái tại " + pivotKey + " để cân bằng lại sau xóa.",
        activeLines: LINE.ROTATE_LEFT,
        highlights: {
          focusKeys: [newRoot.key],
          accentKeys: [pivotKey],
          caseLabel: "RR"
        },
        rotation: {
          direction: "left",
          pivot: pivotKey,
          newRoot: newRoot.key,
          caseLabel: "RR"
        }
      });
      return newRoot;
    }

    if (balance < -1 && getBalance(node.right) > 0) {
      record({
        type: "rebalance_check",
        message: "Sau khi xóa xuất hiện lệch phải-trái tại " + node.key + ".",
        activeLines: LINE.DELETE_RL,
        highlights: {
          focusKeys: [node.key],
          accentKeys: [node.right.key],
          caseLabel: "RL"
        }
      });
      const rightPivot = node.right.key;
      node.right = rightRotate(node.right);
      record({
        type: "rotate_right",
        message: "Quay phải tại " + rightPivot + " để đổi RL thành RR.",
        activeLines: LINE.ROTATE_RIGHT,
        highlights: {
          focusKeys: [node.right.key],
          accentKeys: [node.key, rightPivot],
          caseLabel: "RL"
        },
        rotation: {
          direction: "right",
          pivot: rightPivot,
          newRoot: node.right.key,
          caseLabel: "RL"
        }
      });
      const pivotKey = node.key;
      const newRoot = leftRotate(node);
      replaceAtPath(state, path, newRoot);
      record({
        type: "rotate_left",
        message: "Quay trái tại " + pivotKey + " để hoàn tất rebalance RL sau xóa.",
        activeLines: LINE.ROTATE_LEFT,
        highlights: {
          focusKeys: [newRoot.key],
          accentKeys: [pivotKey],
          caseLabel: "RL"
        },
        rotation: {
          direction: "left",
          pivot: pivotKey,
          newRoot: newRoot.key,
          caseLabel: "RL"
        }
      });
      return newRoot;
    }

    replaceAtPath(state, path, node);
    return node;
  }

  function findScenario(scenarioId) {
    return SCENARIOS.find(function (scenario) {
      return scenario.id === scenarioId;
    });
  }

  function runScenario(scenarioId) {
    const scenario = typeof scenarioId === "string" ? findScenario(scenarioId) : scenarioId;
    if (!scenario) {
      throw new Error("Không tìm thấy kịch bản: " + scenarioId);
    }

    const state = { root: buildInitialTree(scenario.initialValues) };
    const recorder = createRecorder(state, scenario);
    const steps = recorder.steps;
    const record = recorder.record;
    const operationText = scenario.operations
      .map(function (operation) {
        return (operation.type === "insert" ? "chèn " : "xóa ") + operation.value;
      })
      .join(", ");

    record({
      type: "done",
      message: scenario.initialValues && scenario.initialValues.length
        ? "Cây ban đầu đã sẵn sàng. Bắt đầu minh họa thao tác " + operationText + "."
        : "Sẵn sàng chạy kịch bản \"" + scenario.title + "\".",
      activeLines: [],
      highlights: { caseLabel: scenario.expectedCase }
    });

    scenario.operations.forEach(function (operation) {
      if (operation.type === "insert") {
        record({
          type: "compare",
          message: "Bắt đầu thao tác chèn " + operation.value + ".",
          activeLines: [33, 34],
          highlights: { insertedKeys: [operation.value] }
        });
        state.root = insertTracked(state.root, operation.value, state, record, []);
      } else if (operation.type === "delete") {
        record({
          type: "compare",
          message: "Bắt đầu thao tác xóa " + operation.value + ".",
          activeLines: [57, 58],
          highlights: { deletedKeys: [operation.value] }
        });
        state.root = deleteTracked(state.root, operation.value, state, record, []);
      }
    });

    record({
      type: "done",
      message: "Hoàn tất kịch bản \"" + scenario.title + "\".",
      activeLines: [],
      highlights: { caseLabel: scenario.expectedCase }
    });

    return compactSteps(steps);
  }

  function buildLayout(treeSnapshot) {
    if (!treeSnapshot) {
      return {
        rootKey: null,
        nodes: [],
        links: [],
        byKey: new Map(),
        depth: 0,
        nodeCount: 0
      };
    }

    const orderedNodes = [];
    let maxDepth = 0;

    function traverse(node, depth, parentKey) {
      if (!node) {
        return;
      }
      traverse(node.left, depth + 1, node.key);
      orderedNodes.push({
        key: node.key,
        height: node.height,
        balance: typeof node.balance === "number"
          ? node.balance
          : ((node.left ? node.left.height : 0) - (node.right ? node.right.height : 0)),
        depth: depth,
        parentKey: parentKey
      });
      maxDepth = Math.max(maxDepth, depth);
      traverse(node.right, depth + 1, node.key);
    }

    traverse(treeSnapshot, 0, null);

    const depthCount = maxDepth + 1;
    const nodeCount = orderedNodes.length;
    const visuals = getVisualMetrics(nodeCount, depthCount);
    const slot = (LAYOUT.width - (LAYOUT.sidePadding * 2)) / (nodeCount + 1);
    const availableHeight = LAYOUT.height - (visuals.nodeRadius * 2) - 28;
    const levelGap = depthCount > 1
      ? Math.min(LAYOUT.levelGap, availableHeight / (depthCount - 1))
      : 0;
    const topOffset = depthCount > 1
      ? (LAYOUT.height - (levelGap * (depthCount - 1))) / 2
      : LAYOUT.height / 2;
    const byKey = new Map();

    orderedNodes.forEach(function (node, index) {
      node.x = LAYOUT.sidePadding + slot * (index + 1);
      node.y = topOffset + (node.depth * levelGap);
      node.radius = visuals.nodeRadius;
      node.keyFontSize = visuals.keyFontSize;
      node.metaFontSize = visuals.metaFontSize;
      node.metaOffset = visuals.metaOffset;
      node.badgeOffset = visuals.badgeOffset;
      byKey.set(node.key, node);
    });

    const links = orderedNodes
      .filter(function (node) {
        return node.parentKey !== null;
      })
      .map(function (node) {
        return {
          id: String(node.parentKey) + "->" + String(node.key),
          from: node.parentKey,
          to: node.key
        };
      });

    return {
      rootKey: treeSnapshot.key,
      nodes: orderedNodes,
      links: links,
      byKey: byKey,
      depth: maxDepth + 1,
      nodeCount: nodeCount,
      nodeRadius: visuals.nodeRadius
    };
  }

  function validateAVL(treeSnapshot) {
    function walk(node) {
      if (!node) {
        return {
          valid: true,
          height: 0,
          min: Infinity,
          max: -Infinity,
          count: 0
        };
      }

      const left = walk(node.left);
      const right = walk(node.right);
      const computedHeight = 1 + Math.max(left.height, right.height);
      const actualBalance = left.height - right.height;
      const heightMatches = typeof node.height !== "number" || node.height === computedHeight;
      const bstValid = left.max < node.key && node.key < right.min;
      const valid = left.valid
        && right.valid
        && bstValid
        && Math.abs(actualBalance) <= 1
        && heightMatches;

      return {
        valid: valid,
        height: computedHeight,
        min: Math.min(left.min, node.key),
        max: Math.max(right.max, node.key),
        count: left.count + right.count + 1
      };
    }

    return walk(treeSnapshot);
  }

  function createSvgElement(tagName, attributes) {
    const element = document.createElementNS(SVG_NS, tagName);
    Object.keys(attributes || {}).forEach(function (key) {
      element.setAttribute(key, attributes[key]);
    });
    return element;
  }

  function setupSvgLayers(svg) {
    while (svg.firstChild) {
      svg.removeChild(svg.firstChild);
    }
    return {
      edges: svg.appendChild(createSvgElement("g", { "data-layer": "edges" })),
      nodes: svg.appendChild(createSvgElement("g", { "data-layer": "nodes" })),
      overlay: svg.appendChild(createSvgElement("g", { "data-layer": "overlay" }))
    };
  }

  function describeOperation(operation) {
    return (operation.type === "insert" ? "+" : "−") + operation.value;
  }

  function describeScenarioFlow(scenario) {
    const initial = scenario.initialValues && scenario.initialValues.length
      ? "Cây sẵn: " + scenario.initialValues.join(", ")
      : "Cây sẵn: rỗng";
    const operations = scenario.operations.map(function (operation) {
      return (operation.type === "insert" ? "Chèn " : "Xóa ") + operation.value;
    }).join(" -> ");
    return initial + " | " + operations;
  }

  function describeStepType(type) {
    const labels = {
      compare: "So sánh",
      insert: "Chèn node",
      delete: "Xóa node",
      update_height: "Cập nhật chiều cao",
      rebalance_check: "Kiểm tra cân bằng",
      rotate_left: "Quay trái",
      rotate_right: "Quay phải",
      done: "Hoàn tất"
    };
    return labels[type] || type;
  }

  function createScenarioCache() {
    return SCENARIOS.map(function (scenario) {
      const steps = runScenario(scenario.id);
      const finalStep = steps[steps.length - 1];
      const validation = validateAVL(finalStep.treeSnapshot);
      return Object.assign({}, scenario, {
        steps: steps,
        validation: validation
      });
    });
  }

  function createNodeElement(node, step) {
    const group = createSvgElement("g", { class: "tree-node" });
    const circle = createSvgElement("circle", {
      r: String(node.radius || LAYOUT.nodeRadius),
      cx: "0",
      cy: "0"
    });
    const keyText = createSvgElement("text", {
      class: "tree-node__key",
      x: "0",
      y: "0",
      "font-size": String(node.keyFontSize || 20)
    });
    const metaText = createSvgElement("text", {
      class: "tree-node__meta",
      x: "0",
      y: String(node.metaOffset || (LAYOUT.nodeRadius + 18)),
      "font-size": String(node.metaFontSize || 12)
    });

    group.appendChild(circle);
    group.appendChild(keyText);
    group.appendChild(metaText);

    updateNodeElement(group, node, step);
    return group;
  }

  function formatBalance(balance) {
    return balance > 0 ? "+" + balance : String(balance);
  }

  function updateNodeElement(group, node, step) {
    const highlights = step.highlights || {};
    const focusKeys = highlights.focusKeys || [];
    const insertedKeys = highlights.insertedKeys || [];
    const accentKeys = highlights.accentKeys || [];
    const rotation = step.rotation || null;

    group.dataset.key = String(node.key);
    group.classList.toggle("is-focus", focusKeys.indexOf(node.key) >= 0);
    group.classList.toggle("is-inserted", insertedKeys.indexOf(node.key) >= 0);
    group.classList.toggle("is-accent", accentKeys.indexOf(node.key) >= 0);
    group.classList.toggle(
      "is-rotation",
      Boolean(rotation) && (rotation.pivot === node.key || rotation.newRoot === node.key)
    );

    const textNodes = group.querySelectorAll("text");
    const circle = group.querySelector("circle");
    circle.setAttribute("r", String(node.radius || LAYOUT.nodeRadius));
    textNodes[0].textContent = String(node.key);
    textNodes[0].setAttribute("font-size", String(node.keyFontSize || 20));
    textNodes[1].textContent = "h=" + node.height + " | bf=" + formatBalance(node.balance);
    textNodes[1].setAttribute("y", String(node.metaOffset || (LAYOUT.nodeRadius + 18)));
    textNodes[1].setAttribute("font-size", String(node.metaFontSize || 12));
  }

  function setNodePosition(group, point, animate) {
    if (!animate) {
      group.style.transition = "none";
      group.style.transform = "translate(" + point.x + "px, " + point.y + "px)";
      group.getBoundingClientRect();
      group.style.transition = "";
      return;
    }
    group.style.transform = "translate(" + point.x + "px, " + point.y + "px)";
  }

  function setLinePosition(line, fromNode, toNode) {
    line.setAttribute("x1", String(fromNode.x));
    line.setAttribute("y1", String(fromNode.y + 4));
    line.setAttribute("x2", String(toNode.x));
    line.setAttribute("y2", String(toNode.y - 4));
  }

  function guessEntryPoint(node, prevLayout, nextLayout, step) {
    if (prevLayout && prevLayout.byKey.has(node.key)) {
      return prevLayout.byKey.get(node.key);
    }

    const rotation = step.rotation;
    if (rotation) {
      const pivot = prevLayout && prevLayout.byKey.get(rotation.pivot);
      if (pivot) {
        return pivot;
      }
    }

    if (node.parentKey !== null) {
      const anchor = (prevLayout && prevLayout.byKey.get(node.parentKey)) || nextLayout.byKey.get(node.parentKey);
      if (anchor) {
        return anchor;
      }
    }

    return { x: LAYOUT.width / 2, y: 38 };
  }

  function guessExitPoint(node, nextLayout, step) {
    const rotation = step.rotation;
    if (rotation) {
      const target = nextLayout.byKey.get(rotation.newRoot);
      if (target) {
        return target;
      }
    }

    const focusKeys = (step.highlights && step.highlights.focusKeys) || [];
    if (focusKeys.length > 0) {
      const focusNode = nextLayout.byKey.get(focusKeys[0]);
      if (focusNode) {
        return focusNode;
      }
    }

    return { x: LAYOUT.width / 2, y: 38 };
  }

  function syncEdges(state, prevLayout, nextLayout, animate) {
    const nextIds = new Set();

    nextLayout.links.forEach(function (link) {
      nextIds.add(link.id);
      const fromNode = nextLayout.byKey.get(link.from);
      const toNode = nextLayout.byKey.get(link.to);
      let line = state.edgeElements.get(link.id);

      if (!line) {
        line = createSvgElement("line", { class: "tree-link" });
        state.edgeElements.set(link.id, line);
        state.layers.edges.appendChild(line);

        const fromStart = (prevLayout && prevLayout.byKey.get(link.from)) || fromNode;
        const toStart = (prevLayout && prevLayout.byKey.get(link.to)) || fromStart;
        setLinePosition(line, fromStart, toStart);
        requestAnimationFrame(function () {
          setLinePosition(line, fromNode, toNode);
        });
      } else {
        line.classList.remove("is-exiting");
        setLinePosition(line, fromNode, toNode);
      }
    });

    Array.from(state.edgeElements.entries()).forEach(function (entry) {
      const id = entry[0];
      const line = entry[1];
      if (nextIds.has(id)) {
        return;
      }
      line.classList.add("is-exiting");
      const renderToken = state.renderToken;
      window.setTimeout(function () {
        if (state.renderToken !== renderToken) {
          return;
        }
        if (state.edgeElements.get(id) === line) {
          line.remove();
          state.edgeElements.delete(id);
        }
      }, animate ? 430 : 0);
    });
  }

  function syncNodes(state, prevLayout, nextLayout, step, animate) {
    const nextKeys = new Set();

    nextLayout.nodes.forEach(function (node) {
      nextKeys.add(node.key);
      let group = state.nodeElements.get(node.key);

      if (!group) {
        group = createNodeElement(node, step);
        state.nodeElements.set(node.key, group);
        state.layers.nodes.appendChild(group);

        const start = guessEntryPoint(node, prevLayout, nextLayout, step);
        setNodePosition(group, start, false);
        requestAnimationFrame(function () {
          updateNodeElement(group, node, step);
          setNodePosition(group, node, animate);
        });
      } else {
        updateNodeElement(group, node, step);
        group.classList.remove("is-exiting");
        setNodePosition(group, node, animate);
      }
    });

    Array.from(state.nodeElements.entries()).forEach(function (entry) {
      const key = entry[0];
      const group = entry[1];
      if (nextKeys.has(key)) {
        return;
      }
      const previousNode = prevLayout && prevLayout.byKey.get(key);
      if (previousNode) {
        group.classList.add("is-exiting");
        setNodePosition(group, guessExitPoint(previousNode, nextLayout, step), animate);
      }

      const renderToken = state.renderToken;
      window.setTimeout(function () {
        if (state.renderToken !== renderToken) {
          return;
        }
        if (state.nodeElements.get(key) === group) {
          group.remove();
          state.nodeElements.delete(key);
        }
      }, animate ? 430 : 0);
    });
  }

  function renderOverlay(state, nextLayout, step) {
    while (state.layers.overlay.firstChild) {
      state.layers.overlay.removeChild(state.layers.overlay.firstChild);
    }

    const caseLabel = step.rotation
      ? step.rotation.caseLabel
      : (step.highlights ? step.highlights.caseLabel : "");

    if (!caseLabel || ["LL", "RR", "LR", "RL"].indexOf(caseLabel) < 0) {
      return;
    }

    const anchorKey = step.rotation
      ? step.rotation.newRoot
      : ((step.highlights.focusKeys && step.highlights.focusKeys[0]) || nextLayout.rootKey);
    const anchor = nextLayout.byKey.get(anchorKey);

    if (!anchor) {
      return;
    }

    const badge = createSvgElement("g", { class: "tree-overlay__badge" });
    badge.setAttribute(
      "transform",
      "translate(" + anchor.x + "," + (anchor.y - (anchor.badgeOffset || (LAYOUT.nodeRadius + 34))) + ")"
    );

    const rect = createSvgElement("rect", {
      x: "-28",
      y: "-18",
      width: "56",
      height: "36",
      rx: "16"
    });
    const text = createSvgElement("text", { x: "0", y: "1", "font-size": "16" });
    text.textContent = caseLabel;

    badge.appendChild(rect);
    badge.appendChild(text);
    state.layers.overlay.appendChild(badge);
  }

  function animateTransition(state, prevLayout, nextLayout, step, animate) {
    syncEdges(state, prevLayout, nextLayout, animate);
    syncNodes(state, prevLayout, nextLayout, step, animate);
    renderOverlay(state, nextLayout, step);
  }

  function renderScenarioList(state) {
    const fragment = document.createDocumentFragment();

    state.scenarios.forEach(function (scenario) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "scenario-card";
      button.dataset.scenarioId = scenario.id;

      const top = document.createElement("div");
      top.className = "scenario-card__top";

      const title = document.createElement("h3");
      title.className = "scenario-card__title";
      title.textContent = scenario.title;

      const tag = document.createElement("span");
      tag.className = "scenario-card__tag";
      tag.textContent = scenario.expectedCase;

      top.appendChild(title);
      top.appendChild(tag);

      const summary = document.createElement("p");
      summary.className = "scenario-card__summary";
      summary.textContent = scenario.summary;

      const ops = document.createElement("p");
      ops.className = "scenario-card__ops";
      ops.textContent = describeScenarioFlow(scenario);

      button.appendChild(top);
      button.appendChild(summary);
      button.appendChild(ops);
      button.addEventListener("click", function () {
        selectScenario(state, scenario.id);
      });

      fragment.appendChild(button);
    });

    state.dom.scenarioList.innerHTML = "";
    state.dom.scenarioList.appendChild(fragment);
  }

  function updateScenarioSelection(state) {
    const buttons = state.dom.scenarioList.querySelectorAll(".scenario-card");
    buttons.forEach(function (button) {
      button.classList.toggle("is-active", button.dataset.scenarioId === state.activeScenario.id);
    });
  }

  function renderCodePanel(state, activeLines) {
    if (!state.codeRows.length) {
      const fragment = document.createDocumentFragment();
      CODE_LINES.forEach(function (line, index) {
        const row = document.createElement("div");
        row.className = "code-line";
        row.dataset.line = String(index + 1);

        const number = document.createElement("span");
        number.className = "code-line__number";
        number.textContent = String(index + 1).padStart(2, "0");

        const content = document.createElement("span");
        content.className = "code-line__content";
        content.textContent = line;

        row.appendChild(number);
        row.appendChild(content);
        fragment.appendChild(row);
        state.codeRows.push(row);
      });
      state.dom.codePanel.appendChild(fragment);
    }

    const active = new Set(activeLines || []);
    let firstActive = null;

    state.codeRows.forEach(function (row) {
      const lineNumber = Number(row.dataset.line);
      const isActive = active.has(lineNumber);
      row.classList.toggle("is-active", isActive);
      if (isActive && !firstActive) {
        firstActive = row;
      }
    });

    if (firstActive) {
      firstActive.scrollIntoView({ block: "center", behavior: "smooth" });
    }
  }

  function renderLogs(state, stepIndex) {
    const logPanel = state.dom.logPanel;
    const visibleSteps = state.steps.slice(0, stepIndex + 1);
    const fragment = document.createDocumentFragment();

    visibleSteps.forEach(function (step) {
      const entry = document.createElement("article");
      entry.className = "log-entry";
      if (step.id === state.stepIndex) {
        entry.classList.add("is-current");
      }

      const top = document.createElement("div");
      top.className = "log-entry__top";

      const stepLabel = document.createElement("span");
      stepLabel.className = "log-entry__step";
      stepLabel.textContent = "Bước " + step.id;

      const typeLabel = document.createElement("span");
      typeLabel.className = "log-entry__type";
      typeLabel.textContent = describeStepType(step.type);

      top.appendChild(stepLabel);
      top.appendChild(typeLabel);

      const message = document.createElement("p");
      message.className = "log-entry__message";
      message.textContent = step.message;

      entry.appendChild(top);
      entry.appendChild(message);
      fragment.appendChild(entry);
    });

    logPanel.innerHTML = "";
    logPanel.appendChild(fragment);
    logPanel.scrollTop = logPanel.scrollHeight;
  }

  function updateStageMeta(state, step, layout) {
    state.dom.scenarioTitle.textContent = state.activeScenario.title;

    const badge = (step.rotation && step.rotation.caseLabel)
      || (step.highlights && step.highlights.caseLabel)
      || state.activeScenario.expectedCase;
    state.dom.caseBadge.textContent = badge || "Sẵn sàng";
    state.dom.stepCounter.textContent = state.stepIndex + " / " + Math.max(0, state.steps.length - 1);
    state.dom.treeHeight.textContent = step.treeSnapshot ? String(step.treeSnapshot.height) : "0";
    state.dom.nodeCount.textContent = String(layout.nodeCount);
    state.dom.stepType.textContent = describeStepType(step.type);
    state.dom.stepMessage.textContent = step.message;
    state.dom.emptyState.style.display = layout.nodeCount > 0 ? "none" : "grid";
  }

  function updateControlState(state) {
    const atStart = state.stepIndex === 0;
    const atEnd = state.stepIndex >= state.steps.length - 1;

    state.dom.prevButton.disabled = atStart;
    state.dom.resetButton.disabled = atStart;
    state.dom.nextButton.disabled = atEnd;
    state.dom.playButton.disabled = state.isPlaying;
    state.dom.pauseButton.disabled = !state.isPlaying;
  }

  function renderStep(state, nextIndex, options) {
    const config = options || {};
    state.stepIndex = Math.max(0, Math.min(nextIndex, state.steps.length - 1));
    state.renderToken += 1;

    const step = state.steps[state.stepIndex];
    const previousLayout = state.currentLayout;
    const nextLayout = buildLayout(step.treeSnapshot);
    const animate = config.animate !== false;

    animateTransition(state, previousLayout, nextLayout, step, animate);
    state.currentLayout = nextLayout;

    renderCodePanel(state, step.activeLines);
    renderLogs(state, state.stepIndex);
    updateStageMeta(state, step, nextLayout);
    updateControlState(state);
  }

  function stopPlayback(state) {
    state.isPlaying = false;
    if (state.timer) {
      window.clearTimeout(state.timer);
      state.timer = null;
    }
    updateControlState(state);
  }

  function schedulePlayback(state) {
    if (!state.isPlaying) {
      return;
    }

    if (state.stepIndex >= state.steps.length - 1) {
      stopPlayback(state);
      return;
    }

    state.timer = window.setTimeout(function () {
      renderStep(state, state.stepIndex + 1, { animate: true });
      schedulePlayback(state);
    }, state.playbackDelay);
  }

  function startPlayback(state) {
    if (state.isPlaying) {
      return;
    }
    if (state.stepIndex >= state.steps.length - 1) {
      renderStep(state, 0, { animate: false });
    }
    state.isPlaying = true;
    updateControlState(state);
    schedulePlayback(state);
  }

  function selectScenario(state, scenarioId) {
    stopPlayback(state);
    const scenario = state.scenarios.find(function (item) {
      return item.id === scenarioId;
    });

    if (!scenario) {
      return;
    }

    state.activeScenario = scenario;
    state.steps = scenario.steps;
    state.stepIndex = 0;
    state.currentLayout = buildLayout(null);
    updateScenarioSelection(state);
    renderStep(state, 0, { animate: false });
  }

  function bindControls(state) {
    state.dom.playButton.addEventListener("click", function () {
      startPlayback(state);
    });

    state.dom.pauseButton.addEventListener("click", function () {
      stopPlayback(state);
    });

    state.dom.nextButton.addEventListener("click", function () {
      stopPlayback(state);
      renderStep(state, state.stepIndex + 1, { animate: true });
    });

    state.dom.prevButton.addEventListener("click", function () {
      stopPlayback(state);
      renderStep(state, state.stepIndex - 1, { animate: true });
    });

    state.dom.resetButton.addEventListener("click", function () {
      stopPlayback(state);
      renderStep(state, 0, { animate: false });
    });

    state.dom.speedSelect.addEventListener("change", function (event) {
      state.playbackDelay = Number(event.target.value);
      if (state.isPlaying) {
        stopPlayback(state);
        startPlayback(state);
      }
    });
  }

  function initApp() {
    const appRoot = document.getElementById("app");
    if (!appRoot) {
      return;
    }

    const dom = {
      scenarioList: document.getElementById("scenarioList"),
      treeSvg: document.getElementById("treeSvg"),
      emptyState: document.getElementById("emptyState"),
      codePanel: document.getElementById("codePanel"),
      logPanel: document.getElementById("logPanel"),
      scenarioTitle: document.getElementById("scenarioTitle"),
      caseBadge: document.getElementById("caseBadge"),
      stepCounter: document.getElementById("stepCounter"),
      treeHeight: document.getElementById("treeHeight"),
      nodeCount: document.getElementById("nodeCount"),
      stepType: document.getElementById("stepType"),
      stepMessage: document.getElementById("stepMessage"),
      prevButton: document.getElementById("prevButton"),
      playButton: document.getElementById("playButton"),
      pauseButton: document.getElementById("pauseButton"),
      nextButton: document.getElementById("nextButton"),
      resetButton: document.getElementById("resetButton"),
      speedSelect: document.getElementById("speedSelect")
    };

    const scenarios = createScenarioCache();
    const state = {
      dom: dom,
      scenarios: scenarios,
      activeScenario: scenarios[0],
      steps: scenarios[0].steps,
      stepIndex: 0,
      playbackDelay: Number(dom.speedSelect.value),
      isPlaying: false,
      timer: null,
      renderToken: 0,
      edgeElements: new Map(),
      nodeElements: new Map(),
      currentLayout: buildLayout(null),
      codeRows: [],
      layers: setupSvgLayers(dom.treeSvg)
    };

    renderScenarioList(state);
    bindControls(state);
    updateScenarioSelection(state);
    renderStep(state, 0, { animate: false });
  }

  const AVLApp = {
    CODE_LINES: CODE_LINES,
    SCENARIOS: SCENARIOS,
    runScenario: runScenario,
    buildLayout: buildLayout,
    animateTransition: animateTransition,
    validateAVL: validateAVL,
    createScenarioCache: createScenarioCache,
    countNodes: countNodes
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = AVLApp;
  }

  if (typeof window !== "undefined") {
    global.AVLApp = AVLApp;
    window.addEventListener("DOMContentLoaded", initApp);
  }
})(typeof globalThis !== "undefined" ? globalThis : this);
